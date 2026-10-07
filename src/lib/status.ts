// 状態の判定（data-model.md §9）。今日の日付（日本時間）を引数で受け取る。
// ビルド時とブラウザ側の両方で同じ関数を使う。
import { addDays, formatMonthDay, OPEN_END_LABEL, type IsoDate } from "./date";
import type { Exhibit, Exhibition } from "./schema";

export type ExhibitionStatus = "upcoming" | "ongoing" | "ended" | "cancelled" | "postponed";

type ExhibitionDates = Pick<Exhibition, "start_date" | "end_date" | "status">;
export type ExhibitionForStatus = Pick<Exhibition, "id" | "start_date" | "end_date" | "status" | "periods"> & {
  exhibits: Pick<Exhibit, "sword_id" | "period_ids">[];
};

export interface DateRange {
  start: IsoDate;
  /** 最終日（この日を含む）。null は終了日が未定（D-012） */
  end: IsoDate | null;
}

/** 終了日を比べる。null（未定）はどの日付よりも後として扱う。 */
export function compareEndDates(a: IsoDate | null, b: IsoDate | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

/** 終了日が未定の展覧会は、開始日を過ぎたら開催中として扱う（終了の判定ができないため）。 */
export function exhibitionStatus(exhibition: ExhibitionDates, today: IsoDate): ExhibitionStatus {
  if (exhibition.status) return exhibition.status;
  if (today < exhibition.start_date) return "upcoming";
  if (exhibition.end_date !== null && today > exhibition.end_date) return "ended";
  return "ongoing";
}

export const exhibitionStatusLabel: Record<ExhibitionStatus, string> = {
  upcoming: "開催予定",
  ongoing: "開催中",
  ended: "終了",
  cancelled: "中止",
  postponed: "延期",
};

/** 隣り合う（または重なる）期間をつなげる。前期・後期の両方に出る刀は、1つの連続した期間として扱う。 */
export function mergeRanges(ranges: readonly DateRange[]): DateRange[] {
  const sorted = [...ranges].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  const merged: DateRange[] = [];
  for (const r of sorted) {
    const last = merged.at(-1);
    if (last && (last.end === null || r.start <= addDays(last.end, 1))) {
      if (compareEndDates(r.end, last.end) > 0) last.end = r.end;
    } else {
      merged.push({ ...r });
    }
  }
  return merged;
}

/**
 * 出品物が展示される期間。period_ids が省略または空なら会期全体。
 * 存在しない period_id は無視する（検証スクリプトでエラーになる）。
 */
export function exhibitDisplayRanges(
  exhibition: Pick<Exhibition, "start_date" | "end_date" | "periods">,
  exhibit: Pick<Exhibit, "period_ids">,
): DateRange[] {
  if (!exhibit.period_ids || exhibit.period_ids.length === 0) {
    return [{ start: exhibition.start_date, end: exhibition.end_date }];
  }
  const ranges = exhibit.period_ids
    .map((pid) => exhibition.periods.find((p) => p.id === pid))
    .filter((p): p is Exhibition["periods"][number] => p !== undefined)
    .map((p) => ({ start: p.start_date, end: p.end_date }));
  return mergeRanges(ranges);
}

export type SwordStatus =
  /** 1. 今日、展示されている。until が null なら終了日は未定 */
  | { kind: "on_display"; exhibitionId: string; until: IsoDate | null }
  /** 2. 展覧会は開催中だが、この刀の展示はこれから */
  | { kind: "coming_in_ongoing"; exhibitionId: string; from: IsoDate }
  /** 3. 開催予定の展覧会に出品される */
  | { kind: "upcoming_exhibition"; exhibitionId: string; from: IsoDate }
  /** 4. どれでもない（所蔵先を表示する） */
  | { kind: "none" };

/**
 * 刀剣ページでの状態（§9 の判定順）。
 * 同じ順位の候補が複数あるときは、1 は終了日が遅いもの（未定は最も遅いとみなす）、2・3 は開始日が早いものを選ぶ。
 */
export function swordStatus(
  swordId: string,
  exhibitions: readonly ExhibitionForStatus[],
  today: IsoDate,
): SwordStatus {
  let onDisplay: Extract<SwordStatus, { kind: "on_display" }> | null = null;
  let coming: Extract<SwordStatus, { kind: "coming_in_ongoing" }> | null = null;
  let upcoming: Extract<SwordStatus, { kind: "upcoming_exhibition" }> | null = null;

  for (const ex of exhibitions) {
    const exStatus = exhibitionStatus(ex, today);
    if (exStatus !== "ongoing" && exStatus !== "upcoming") continue;

    const ranges = mergeRanges(
      ex.exhibits.filter((e) => e.sword_id === swordId).flatMap((e) => exhibitDisplayRanges(ex, e)),
    );
    for (const r of ranges) {
      if (r.start <= today && (r.end === null || today <= r.end)) {
        if (!onDisplay || compareEndDates(r.end, onDisplay.until) > 0) {
          onDisplay = { kind: "on_display", exhibitionId: ex.id, until: r.end };
        }
      } else if (r.start > today) {
        if (exStatus === "ongoing") {
          if (!coming || r.start < coming.from) {
            coming = { kind: "coming_in_ongoing", exhibitionId: ex.id, from: r.start };
          }
        } else if (!upcoming || r.start < upcoming.from) {
          upcoming = { kind: "upcoming_exhibition", exhibitionId: ex.id, from: r.start };
        }
      }
    }
  }

  return onDisplay ?? coming ?? upcoming ?? { kind: "none" };
}

/** 刀剣の状態を、画面に出す一文にする。 */
export function swordStatusText(status: SwordStatus, holderText: string): string {
  switch (status.kind) {
    case "on_display":
      return status.until === null
        ? `いま会えます・${OPEN_END_LABEL}`
        : `いま会えます（${formatMonthDay(status.until)}まで）`;
    case "coming_in_ongoing":
      return `${formatMonthDay(status.from)}から展示`;
    case "upcoming_exhibition":
      return `開催予定（${formatMonthDay(status.from)}から展示）`;
    case "none":
      return `所蔵：${holderText}`;
  }
}
