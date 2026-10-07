// 日付は "YYYY-MM-DD"（日本時間の日付）の文字列で扱う。
// この形式は文字列のまま大小比較できる。

export type IsoDate = string;

const jstFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 日本時間での今日の日付。テストのために基準時刻を渡せる。 */
export function todayJst(now: Date = new Date()): IsoDate {
  return jstFormatter.format(now);
}

/** 日付に日数を足す（負の数も可）。 */
export function addDays(date: IsoDate, days: number): IsoDate {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** a から b までの日数（b − a）。 */
export function daysBetween(a: IsoDate, b: IsoDate): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/** "2026-10-07" → "10/7" */
export function formatMonthDay(date: IsoDate): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}/${Number(d)}`;
}

/** "2026-10-07" → "2026年10月7日" */
export function formatFullDate(date: IsoDate): string {
  const [y, m, d] = date.split("-");
  return `${y}年${Number(m)}月${Number(d)}日`;
}

/** 終了日が分からない会期の表示（D-012）。 */
export const OPEN_END_LABEL = "会期未定（公式サイトで確認）";

/**
 * 期間の表示。終了日が null（未定）なら「開始日〜 会期未定（公式サイトで確認）」にする。
 * 日付の書式は format で変えられる（既定は「2026年10月7日」）。
 */
export function formatDateRange(
  start: IsoDate,
  end: IsoDate | null,
  format: (date: IsoDate) => string = formatFullDate,
): string {
  return end === null ? `${format(start)}〜 ${OPEN_END_LABEL}` : `${format(start)}〜${format(end)}`;
}

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** 曜日（"日"〜"土"）。 */
export function weekdayJa(date: IsoDate): string {
  return WEEKDAYS_JA[new Date(`${date}T00:00:00Z`).getUTCDay()];
}

/** "2026-10-25" → "10月25日" */
export function formatMonthDayJa(date: IsoDate): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

/** "2026-10-25" → "10月25日（日）" */
export function formatMonthDayWeek(date: IsoDate): string {
  return `${formatMonthDayJa(date)}（${weekdayJa(date)}）`;
}

/** "2026-10-25" → "10.25"（目録の日付欄） */
export function formatDotDate(date: IsoDate): string {
  const [, m, d] = date.split("-");
  return `${Number(m)}.${d}`;
}
