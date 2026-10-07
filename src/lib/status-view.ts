// 状態の表示（札の文言と色の種類）。判定そのものは status.ts で行い、ここでは画面に出す形にするだけ。
// 状態は色だけで示さず、必ず文字でも示す（docs/design/system.md §1）。
import { formatFullDate, formatMonthDayJa, formatMonthDayWeek, OPEN_END_LABEL, weekdayJa, type IsoDate } from "./date";
import type { Exhibit, Exhibition } from "./schema";
import { exhibitionStatusLabel, type ExhibitionStatus, type SwordStatus } from "./status";

/** 札の色の種類。ok＝いま会えます、soon＝これから展示、plan＝開催予定、hold＝所蔵先のみ、ended＝終了・中止など */
export type StatusTone = "ok" | "soon" | "plan" | "hold" | "ended";

export interface SwordStatusView {
  tone: StatusTone;
  /** 札の文言 */
  badge: string;
  /** 札の横に添える文言（終了日など）。所蔵先のみの状態では null（所蔵先は別に表示する） */
  detail: string | null;
}

/** 刀剣の状態（data-model.md §9 の4種類）を、札の文言にする。 */
export function swordStatusView(status: SwordStatus): SwordStatusView {
  switch (status.kind) {
    case "on_display":
      return {
        tone: "ok",
        badge: "いま会えます",
        detail: status.until === null ? OPEN_END_LABEL : `${formatMonthDayWeek(status.until)}まで`,
      };
    case "coming_in_ongoing":
      return { tone: "soon", badge: `${formatMonthDayJa(status.from)}から展示`, detail: "展覧会は開催中です" };
    case "upcoming_exhibition":
      return { tone: "plan", badge: "開催予定", detail: `${formatMonthDayWeek(status.from)}から展示` };
    case "none":
      return { tone: "hold", badge: "所蔵先", detail: null };
  }
}

export const exhibitionStatusTone: Record<ExhibitionStatus, StatusTone> = {
  ongoing: "ok",
  upcoming: "plan",
  ended: "ended",
  cancelled: "ended",
  postponed: "hold",
};

export function exhibitionStatusView(status: ExhibitionStatus): { tone: StatusTone; badge: string } {
  return { tone: exhibitionStatusTone[status], badge: exhibitionStatusLabel[status] };
}

/**
 * 「この刀の展示」の欄の文言。展示期間の区分（前期・後期など）があれば、区分名と期間を並べる。
 * 区分の指定がなければ全期間。
 */
export function exhibitPeriodText(
  exhibition: Pick<Exhibition, "periods">,
  exhibits: readonly Pick<Exhibit, "period_ids">[],
): string {
  const periodIds = exhibits.some((e) => !e.period_ids || e.period_ids.length === 0)
    ? []
    : [...new Set(exhibits.flatMap((e) => e.period_ids ?? []))];
  if (periodIds.length === 0) {
    return exhibition.periods.length === 0 ? "全期間（展示期間の区分なし）" : "全期間";
  }
  return exhibition.periods
    .filter((p) => periodIds.includes(p.id))
    .map((p) => `${p.id}（${formatMonthDayJa(p.start_date)}〜${formatMonthDayJa(p.end_date)}）`)
    .join("・");
}

/** 「2026年8月4日（火）〜10月25日（日）」のような会期。同じ年なら終了日の年を省く。終了日が未定なら D-012 の表示。 */
export function formatSession(start: IsoDate, end: IsoDate | null): string {
  const startText = `${formatFullDate(start)}（${weekdayJa(start)}）`;
  if (end === null) return `${startText}〜 ${OPEN_END_LABEL}`;
  const endText = start.slice(0, 4) === end.slice(0, 4) ? formatMonthDayWeek(end) : `${end.slice(0, 4)}年${formatMonthDayWeek(end)}`;
  return `${startText}〜${endText}`;
}

/** 展覧会ページの「状態」の行で、札の横に添える文言 */
export function exhibitionStatusDetail(ex: Pick<Exhibition, "start_date" | "end_date">, status: ExhibitionStatus): string {
  switch (status) {
    case "ongoing":
      return ex.end_date === null ? OPEN_END_LABEL : `${formatMonthDayWeek(ex.end_date)}まで`;
    case "upcoming":
      return `${formatMonthDayWeek(ex.start_date)}から`;
    case "ended":
      return "会期は終了しました";
    case "cancelled":
      return "中止になりました";
    case "postponed":
      return "延期になりました";
  }
}
