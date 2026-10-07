// データの検証（data-model.md §12）。ファイルの読み込みは scripts/validate-data.ts で行い、ここでは判定だけを行う。
import type { z } from "zod";
import { daysBetween, type IsoDate } from "./date";
import {
  exhibitionSchema,
  smithSchema,
  swordSchema,
  venueSchema,
  type Exhibition,
  type Smith,
  type Sword,
  type Venue,
} from "./schema";
import { exhibitionStatus } from "./status";

export type DataFile = "venues.json" | "smiths.json" | "swords.json" | "exhibitions.json";

export interface Issue {
  file: DataFile | "data/*.json";
  /** 対象データのID（分かる場合）。IDがないときは配列の位置を "#3" のように入れる */
  target: string;
  message: string;
}

export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

export interface RawData {
  venues: unknown;
  smiths: unknown;
  swords: unknown;
  exhibitions: unknown;
}

export const ID_PATTERN = /^[a-z0-9-]+$/;

/** 開催中・開催予定の展覧会で、最終確認日がこの日数より古いと警告する。 */
export const VERIFIED_AT_MAX_AGE_DAYS = 14;

/**
 * 終了日の代用の値（"9999-12-31" など）とみなす年。この年以降の日付はエラーにする（D-012）。
 * 終了日が分からないときは end_date を null にする。
 */
export const PLACEHOLDER_YEAR_MIN = 9000;

const isPlaceholderDate = (date: string): boolean => Number(date.slice(0, 4)) >= PLACEHOLDER_YEAR_MIN;

/** 出品リストのうち、sword_id も smith_id もない行の割合がこの値を超えると警告する。 */
export const UNLINKED_EXHIBIT_RATIO_THRESHOLD = 0.5;

function targetOf(item: unknown, index: number): string {
  if (item && typeof item === "object" && "id" in item && typeof item.id === "string" && item.id !== "") {
    return item.id;
  }
  return `#${index}`;
}

function parseArray<T>(
  file: DataFile,
  raw: unknown,
  schema: z.ZodType<T>,
  errors: Issue[],
): { items: T[]; rawItems: unknown[] } {
  if (!Array.isArray(raw)) {
    errors.push({ file, target: "(ファイル全体)", message: "オブジェクトの配列ではありません" });
    return { items: [], rawItems: [] };
  }
  const items: T[] = [];
  raw.forEach((item, index) => {
    const result = schema.safeParse(item);
    if (result.success) {
      items.push(result.data);
    } else {
      for (const issue of result.error.issues) {
        const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
        errors.push({ file, target: targetOf(item, index), message: `${path}${issue.message}` });
      }
    }
  });
  return { items, rawItems: raw };
}

function checkIds(file: DataFile, rawItems: unknown[], errors: Issue[]): void {
  const seen = new Set<string>();
  rawItems.forEach((item, index) => {
    const id = targetOf(item, index);
    if (id.startsWith("#")) return; // id がないことはスキーマのエラーとして報告済み
    if (!ID_PATTERN.test(id)) {
      errors.push({ file, target: id, message: "IDに英小文字・数字・ハイフン以外の文字が含まれています" });
    }
    if (seen.has(id)) {
      errors.push({ file, target: id, message: "IDが重複しています" });
    }
    seen.add(id);
  });
}

function checkRef(
  ids: ReadonlySet<string>,
  value: string | undefined,
  issue: Omit<Issue, "message">,
  label: string,
  errors: Issue[],
): void {
  if (value !== undefined && !ids.has(value)) {
    errors.push({ ...issue, message: `${label} "${value}" が存在しません` });
  }
}

function checkConfirmedSources(
  file: DataFile,
  item: { id: string; confidence: string; sources: unknown[] },
  errors: Issue[],
  warnings: Issue[],
): void {
  if (item.confidence === "confirmed" && item.sources.length === 0) {
    errors.push({ file, target: item.id, message: 'confidence が "confirmed" なのに sources が空です' });
  }
  if (item.confidence === "unverified") {
    warnings.push({ file, target: item.id, message: '未確認のデータです（confidence: "unverified"）' });
  }
}

export function validateData(raw: RawData, today: IsoDate): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];

  const venues = parseArray<Venue>("venues.json", raw.venues, venueSchema, errors);
  const smiths = parseArray<Smith>("smiths.json", raw.smiths, smithSchema, errors);
  const swords = parseArray<Sword>("swords.json", raw.swords, swordSchema, errors);
  const exhibitions = parseArray<Exhibition>("exhibitions.json", raw.exhibitions, exhibitionSchema, errors);

  checkIds("venues.json", venues.rawItems, errors);
  checkIds("smiths.json", smiths.rawItems, errors);
  checkIds("swords.json", swords.rawItems, errors);
  checkIds("exhibitions.json", exhibitions.rawItems, errors);

  // 参照先の存在確認には、スキーマの検証に失敗したデータのIDも含める（参照切れの誤検出を防ぐ）。
  const idSet = (items: unknown[]) => new Set(items.map((item, i) => targetOf(item, i)).filter((id) => !id.startsWith("#")));
  const venueIds = idSet(venues.rawItems);
  const smithIds = idSet(smiths.rawItems);
  const swordIds = idSet(swords.rawItems);

  for (const venue of venues.items) {
    checkConfirmedSources("venues.json", venue, errors, warnings);
  }

  for (const smith of smiths.items) {
    const at = { file: "smiths.json" as const, target: smith.id };
    for (const teacherId of smith.teacher_ids ?? []) {
      checkRef(smithIds, teacherId, at, "teacher_ids の刀匠", errors);
    }
    checkConfirmedSources("smiths.json", smith, errors, warnings);
  }

  for (const sword of swords.items) {
    const at = { file: "swords.json" as const, target: sword.id };
    for (const a of sword.attributions) {
      checkRef(smithIds, a.smith_id, at, "attributions の刀匠", errors);
    }
    checkRef(venueIds, sword.holder_venue_id, at, "holder_venue_id の館", errors);
    checkConfirmedSources("swords.json", sword, errors, warnings);
  }

  for (const ex of exhibitions.items) {
    const at = { file: "exhibitions.json" as const, target: ex.id };
    checkRef(venueIds, ex.venue_id, at, "venue_id の館", errors);

    if (ex.end_date !== null && ex.start_date > ex.end_date) {
      errors.push({ ...at, message: `会期の開始日（${ex.start_date}）が終了日（${ex.end_date}）より後です` });
    }
    const datesToCheck: [label: string, date: string | null][] = [
      ["会期の開始日", ex.start_date],
      ["会期の終了日", ex.end_date],
      ...ex.periods.flatMap((p): [string, string][] => [
        [`展示期間「${p.id}」の開始日`, p.start_date],
        [`展示期間「${p.id}」の終了日`, p.end_date],
      ]),
    ];
    for (const [label, date] of datesToCheck) {
      if (date !== null && isPlaceholderDate(date)) {
        errors.push({
          ...at,
          message: `${label}（${date}）は代用の値と思われます。終了日が分からない場合は、会期の end_date を null にしてください`,
        });
      }
    }
    if (ex.end_date === null) {
      warnings.push({ ...at, message: "会期の終了日が未定です（end_date: null）。公式サイトで確認してください" });
    }

    const periodIds = new Set<string>();
    for (const p of ex.periods) {
      if (periodIds.has(p.id)) {
        errors.push({ ...at, message: `展示期間のID "${p.id}" が重複しています` });
      }
      periodIds.add(p.id);
      if (p.start_date > p.end_date) {
        errors.push({ ...at, message: `展示期間「${p.id}」の開始日（${p.start_date}）が終了日（${p.end_date}）より後です` });
      }
      if (p.start_date < ex.start_date || (ex.end_date !== null && p.end_date > ex.end_date)) {
        errors.push({
          ...at,
          message: `展示期間「${p.id}」（${p.start_date}〜${p.end_date}）が会期（${ex.start_date}〜${ex.end_date ?? "終了日未定"}）の外にはみ出しています`,
        });
      }
    }

    ex.exhibits.forEach((exhibit, i) => {
      const exhibitAt = { ...at, target: `${ex.id} の出品 #${i}（${exhibit.label}）` };
      checkRef(swordIds, exhibit.sword_id, exhibitAt, "sword_id の刀剣", errors);
      checkRef(smithIds, exhibit.smith_id, exhibitAt, "smith_id の刀匠", errors);
      for (const pid of exhibit.period_ids ?? []) {
        checkRef(periodIds, pid, exhibitAt, "period_ids の展示期間", errors);
      }
    });

    checkConfirmedSources("exhibitions.json", ex, errors, warnings);

    const status = exhibitionStatus(ex, today);
    if ((status === "ongoing" || status === "upcoming") && daysBetween(ex.verified_at, today) > VERIFIED_AT_MAX_AGE_DAYS) {
      warnings.push({
        ...at,
        message: `開催中・開催予定の展覧会ですが、最終確認日（${ex.verified_at}）が${VERIFIED_AT_MAX_AGE_DAYS}日より前です`,
      });
    }

    if (ex.exhibits.length > 0) {
      const unlinked = ex.exhibits.filter((e) => !e.sword_id && !e.smith_id).length;
      const ratio = unlinked / ex.exhibits.length;
      if (ratio > UNLINKED_EXHIBIT_RATIO_THRESHOLD) {
        warnings.push({
          ...at,
          message: `出品リスト${ex.exhibits.length}件のうち${unlinked}件が、刀剣にも刀匠にもリンクしていません`,
        });
      }
    }
  }

  const sampleCount = [venues, smiths, swords, exhibitions]
    .flatMap((c) => c.rawItems)
    .filter((item) => item && typeof item === "object" && "_sample" in item && item._sample === true).length;
  if (sampleCount > 0) {
    warnings.push({
      file: "data/*.json",
      target: "(全体)",
      message: `動作確認用のサンプルデータ（_sample: true）が${sampleCount}件あります。公開前に本番データに置き換えてください`,
    });
  }

  return { errors, warnings };
}

export function formatIssue(issue: Issue): string {
  return `  ${issue.file} [${issue.target}] ${issue.message}`;
}
