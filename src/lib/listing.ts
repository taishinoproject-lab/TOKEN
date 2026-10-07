// 刀匠・展覧会・館のページと一覧ページで使う、並べ方と絞り込み（T-203、T-204）。
// 開催中・開催予定・終了の分け方は、今日の日付（日本時間）を引数で受け取り、ビルド時とブラウザ側の両方で同じ関数を使う。
import { formatMonthDayJa, type IsoDate } from "./date";
import type { AttributionBasis, Exhibit, Exhibition, Smith, Sword } from "./schema";
import { compareEndDates, exhibitionStatus, type ExhibitionStatus } from "./status";

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** 帰属の区別の並び順（system.md §4.2：在銘→極め→伝） */
export const BASIS_ORDER: readonly AttributionBasis[] = ["在銘", "極め", "伝"];

export interface SmithWork<S> {
  sword: S;
  basis: AttributionBasis;
}

/** 刀匠に帰属する刀剣。在銘→極め→伝の順で、同じ区別の中はデータの順。 */
export function smithWorks<S extends Pick<Sword, "attributions">>(smithId: string, swords: readonly S[]): SmithWork<S>[] {
  const works = swords.flatMap((sword) =>
    sword.attributions.filter((a) => a.smith_id === smithId).map((a) => ({ sword, basis: a.basis })),
  );
  // Array.prototype.sort は安定なので、同じ区別の中はデータの順を保つ
  return works.sort((a, b) => BASIS_ORDER.indexOf(a.basis) - BASIS_ORDER.indexOf(b.basis));
}

/**
 * 刀匠の作が出品される展覧会。刀剣の帰属で結び付くもの（sword_id）に加えて、
 * 刀剣の登録がなくても、出品リストの smith_id で結び付くものを含める。
 */
export function smithExhibitions<E extends Pick<Exhibition, "exhibits">>(
  smithId: string,
  swords: readonly Pick<Sword, "id" | "attributions">[],
  exhibitions: readonly E[],
): E[] {
  const swordIds = new Set(swords.filter((s) => s.attributions.some((a) => a.smith_id === smithId)).map((s) => s.id));
  return exhibitions.filter((ex) =>
    ex.exhibits.some((e) => e.smith_id === smithId || (e.sword_id !== undefined && swordIds.has(e.sword_id))),
  );
}

/** 刀匠の作として出品される行（展覧会ページの出品リストのうち、その刀匠に結び付くもの） */
export function smithExhibitLabels(
  smithId: string,
  swords: readonly Pick<Sword, "id" | "attributions">[],
  exhibition: Pick<Exhibition, "exhibits">,
): string[] {
  const swordIds = new Set(swords.filter((s) => s.attributions.some((a) => a.smith_id === smithId)).map((s) => s.id));
  return exhibition.exhibits
    .filter((e) => e.smith_id === smithId || (e.sword_id !== undefined && swordIds.has(e.sword_id)))
    .map((e) => e.label);
}

/** 弟子（teacher_ids にこの刀匠を含む刀匠） */
export function smithStudents<S extends Pick<Smith, "teacher_ids">>(smithId: string, smiths: readonly S[]): S[] {
  return smiths.filter((s) => s.teacher_ids?.includes(smithId));
}

/** 出品リストの1行の「展示」の欄。区分の指定がなければ全期間 */
export function exhibitRowPeriod(exhibition: Pick<Exhibition, "periods">, exhibit: Pick<Exhibit, "period_ids">): string {
  if (!exhibit.period_ids || exhibit.period_ids.length === 0) return "全期間";
  const periods = exhibition.periods.filter((p) => exhibit.period_ids?.includes(p.id));
  if (periods.length === 0) return exhibit.period_ids.join("・");
  return periods.map((p) => `${p.id}（${formatMonthDayJa(p.start_date)}〜${formatMonthDayJa(p.end_date)}）`).join("・");
}

export type ExhibitionGroupKey = "ongoing" | "upcoming" | "ended";

export interface GroupedExhibition<E> {
  exhibition: E;
  status: ExhibitionStatus;
}

export type ExhibitionGroups<E> = Record<ExhibitionGroupKey, GroupedExhibition<E>[]>;

/**
 * 展覧会を、開催中・開催予定・終了に分ける。延期は開催予定に、中止は終了に入れる（札で区別する）。
 * - 開催中：終了日の近い順（終了日が未定のものは最後）
 * - 開催予定：開始日の早い順
 * - 終了：終了日の新しい順。endedLimit を指定すると、その件数までにする
 */
export function groupExhibitions<E extends Pick<Exhibition, "id" | "start_date" | "end_date" | "status">>(
  exhibitions: readonly E[],
  today: IsoDate,
  options: { endedLimit?: number } = {},
): ExhibitionGroups<E> {
  const groups: ExhibitionGroups<E> = { ongoing: [], upcoming: [], ended: [] };
  for (const exhibition of exhibitions) {
    const status = exhibitionStatus(exhibition, today);
    const key: ExhibitionGroupKey =
      status === "ongoing" ? "ongoing" : status === "upcoming" || status === "postponed" ? "upcoming" : "ended";
    groups[key].push({ exhibition, status });
  }
  const byId = (a: GroupedExhibition<E>, b: GroupedExhibition<E>) => compareText(a.exhibition.id, b.exhibition.id);
  groups.ongoing.sort((a, b) => compareEndDates(a.exhibition.end_date, b.exhibition.end_date) || byId(a, b));
  groups.upcoming.sort((a, b) => compareText(a.exhibition.start_date, b.exhibition.start_date) || byId(a, b));
  groups.ended.sort(
    (a, b) => compareEndDates(b.exhibition.end_date ?? b.exhibition.start_date, a.exhibition.end_date ?? a.exhibition.start_date) || byId(a, b),
  );
  if (options.endedLimit !== undefined) groups.ended = groups.ended.slice(0, options.endedLimit);
  return groups;
}

/**
 * 刀剣の一覧（/swords）の並び順。号の読み（go_reading）の五十音順。
 * 号のない刀は後ろにまとめ、種別＋銘の文字列の順にする。
 */
export function compareSwordsForIndex<S extends Pick<Sword, "go" | "go_reading" | "id">>(
  a: S,
  b: S,
  noGoKey: (s: S) => string = (s) => s.id,
): number {
  const ka = a.go ? (a.go_reading ?? a.go) : null;
  const kb = b.go ? (b.go_reading ?? b.go) : null;
  if (ka !== null && kb !== null) return ka.localeCompare(kb, "ja") || compareText(a.id, b.id);
  if (ka !== null) return -1;
  if (kb !== null) return 1;
  return noGoKey(a).localeCompare(noGoKey(b), "ja") || compareText(a.id, b.id);
}
