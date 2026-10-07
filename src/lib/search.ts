// 検索（data-model.md §10）。
// ビルド時に buildSearchIndex で検索用のインデックス（JSON）を作り、ブラウザ側で searchIndex を呼んで検索する。
// インデックスには、正規化済みの照合用の文字列（keys）と、結果の表示に必要な項目だけを入れる。
import { bladeAndMei, swordDisplayName } from "./display-name";
import { normalizeForSearch } from "./normalize";
import type { AttributionBasis, Smith, Sword } from "./schema";

export const SEARCH_INDEX_VERSION = 1;

export interface SmithIndexEntry {
  id: string;
  name: string;
  reading: string;
  generation?: string;
  school?: string;
  /** 照合用（name、reading、aliases、school を正規化したもの） */
  keys: string[];
}

export interface SwordIndexEntry {
  id: string;
  heading: string;
  subtitle: string;
  attributions: { smith_id: string; smith_name: string | null; basis: AttributionBasis }[];
  /** 号の照合用（go、go_reading を正規化したもの）。号の完全一致の判定に使う */
  goKeys: string[];
  /** その他の照合用（aliases、mei、組み立てた表示名を正規化したもの） */
  keys: string[];
  /** 同順位での並び替え用 */
  sortKey: string;
}

export interface SearchIndex {
  version: typeof SEARCH_INDEX_VERSION;
  smiths: SmithIndexEntry[];
  swords: SwordIndexEntry[];
}

/** 一致の度合い。小さいほど上位。 */
export const MatchLevel = {
  Exact: 0,
  Prefix: 1,
  Partial: 2,
} as const;
export type MatchLevel = (typeof MatchLevel)[keyof typeof MatchLevel];

export interface SmithHit {
  smith: SmithIndexEntry;
  level: MatchLevel;
}

export interface SwordHit {
  sword: SwordIndexEntry;
  level: MatchLevel;
  /** 検索語に一致した刀匠に帰属しているために、この順位になった */
  viaSmith: boolean;
}

export interface SearchResult {
  /** 正規化した検索語 */
  query: string;
  /** 号の完全一致で刀剣が1件だけのとき、その刀（swords には含めない） */
  featured: SwordHit | null;
  smiths: SmithHit[];
  swords: SwordHit[];
  /** 刀匠の結果を刀剣の結果より先に出すか（同順位では刀匠が上） */
  smithsFirst: boolean;
}

const uniqueNonEmpty = (values: readonly (string | null | undefined)[]): string[] => [
  ...new Set(values.filter((v): v is string => Boolean(v)).map(normalizeForSearch).filter((v) => v.length > 0)),
];

type SmithForIndex = Pick<Smith, "id" | "name" | "reading" | "aliases" | "generation" | "school">;
type SwordForIndex = Pick<Sword, "id" | "go" | "go_reading" | "aliases" | "blade_type" | "mei" | "mei_kind" | "attributions">;

export function buildSearchIndex(swords: readonly SwordForIndex[], smiths: readonly SmithForIndex[]): SearchIndex {
  const smithById = new Map(smiths.map((s) => [s.id, s]));
  return {
    version: SEARCH_INDEX_VERSION,
    smiths: smiths.map((s) => ({
      id: s.id,
      name: s.name,
      reading: s.reading,
      ...(s.generation ? { generation: s.generation } : {}),
      ...(s.school ? { school: s.school } : {}),
      keys: uniqueNonEmpty([s.name, s.reading, ...s.aliases, s.school]),
    })),
    swords: swords.map((sw) => {
      const name = swordDisplayName(sw, smiths);
      return {
        id: sw.id,
        heading: name.heading,
        subtitle: name.subtitle,
        attributions: sw.attributions.map((a) => ({
          smith_id: a.smith_id,
          smith_name: smithById.get(a.smith_id)?.name ?? null,
          basis: a.basis,
        })),
        goKeys: uniqueNonEmpty([sw.go, sw.go_reading]),
        keys: uniqueNonEmpty([...sw.aliases, sw.mei, name.heading, bladeAndMei(sw)]),
        sortKey: normalizeForSearch(sw.go_reading ?? name.heading),
      };
    }),
  };
}

function matchLevel(keys: readonly string[], query: string): MatchLevel | null {
  let best: MatchLevel | null = null;
  for (const key of keys) {
    let level: MatchLevel | null = null;
    if (key === query) level = MatchLevel.Exact;
    else if (key.startsWith(query)) level = MatchLevel.Prefix;
    else if (key.includes(query)) level = MatchLevel.Partial;
    if (level !== null && (best === null || level < best)) best = level;
    if (best === MatchLevel.Exact) break;
  }
  return best;
}

const basisRank: Record<AttributionBasis, number> = { 在銘: 0, 極め: 1, 伝: 2 };

const compareStrings = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/**
 * 検索する（data-model.md §10.3）。
 * - 順位は 完全一致 ＞ 前方一致 ＞ 部分一致。
 * - 刀匠に一致したときは、その刀匠に帰属する刀剣も、刀匠と同じ順位で結果に入れる。
 *   同じ順位の中では、一致した刀匠に帰属する刀剣を先に、在銘 ＞ 極め ＞ 伝 の順に並べる。
 * - 号の完全一致で刀剣が1件だけのときは、その刀を featured にする。
 */
export function searchIndex(index: SearchIndex, rawQuery: string): SearchResult {
  const query = normalizeForSearch(rawQuery);
  if (query.length === 0) {
    return { query, featured: null, smiths: [], swords: [], smithsFirst: true };
  }

  const smithHits: SmithHit[] = [];
  const smithLevelById = new Map<string, MatchLevel>();
  for (const smith of index.smiths) {
    const level = matchLevel(smith.keys, query);
    if (level === null) continue;
    smithHits.push({ smith, level });
    smithLevelById.set(smith.id, level);
  }
  smithHits.sort((a, b) => a.level - b.level || compareStrings(a.smith.reading, b.smith.reading));

  type Ranked = SwordHit & { basis: number; goExact: boolean };
  const ranked: Ranked[] = [];
  for (const sword of index.swords) {
    const direct = matchLevel([...sword.goKeys, ...sword.keys], query);
    let via: MatchLevel | null = null;
    let basis = Number.POSITIVE_INFINITY;
    for (const a of sword.attributions) {
      const level = smithLevelById.get(a.smith_id);
      if (level === undefined) continue;
      if (via === null || level < via) {
        via = level;
        basis = basisRank[a.basis];
      } else if (level === via) {
        basis = Math.min(basis, basisRank[a.basis]);
      }
    }
    if (direct === null && via === null) continue;
    const level = Math.min(direct ?? Number.POSITIVE_INFINITY, via ?? Number.POSITIVE_INFINITY) as MatchLevel;
    const viaSmith = via !== null && via === level;
    ranked.push({ sword, level, viaSmith, basis: viaSmith ? basis : Number.POSITIVE_INFINITY, goExact: sword.goKeys.includes(query) });
  }
  ranked.sort(
    (a, b) =>
      a.level - b.level ||
      Number(b.viaSmith) - Number(a.viaSmith) ||
      a.basis - b.basis ||
      compareStrings(a.sword.sortKey, b.sword.sortKey),
  );

  const goExact = ranked.filter((r) => r.goExact);
  const featuredRanked = goExact.length === 1 ? goExact[0] : null;
  const toHit = ({ sword, level, viaSmith }: Ranked): SwordHit => ({ sword, level, viaSmith });
  const featured = featuredRanked ? toHit(featuredRanked) : null;
  const swordHits = ranked.filter((r) => r !== featuredRanked).map(toHit);

  const bestSmith = smithHits[0]?.level ?? Number.POSITIVE_INFINITY;
  const bestSword = Math.min(featured?.level ?? Number.POSITIVE_INFINITY, swordHits[0]?.level ?? Number.POSITIVE_INFINITY);

  return { query, featured, smiths: smithHits, swords: swordHits, smithsFirst: bestSmith <= bestSword };
}

/** 刀剣の結果に添える、帰属の区別付きの刀匠名（例：「正宗（在銘）」「正宗（極め）」「安綱（伝）」）。 */
export function attributionLabels(sword: SwordIndexEntry): string[] {
  return sword.attributions.map((a) => `${a.smith_name ?? a.smith_id}（${a.basis}）`);
}
