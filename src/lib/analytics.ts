// アクセス解析（Vercel Web Analytics）で、ページの閲覧以外の操作を数える。
// 刀ごとのカレンダー購読のリンクが押された回数を数える（最終発表の資料用、roadmap.md 第8週）。
//
// Vercel の Hobby プランでは、独自のイベント（track）が集計されない（Pro 以上の機能）。
// そのため、track に加えて、実在しないページ（/_events/…）の閲覧として記録し、
// ダッシュボードの「Pages」の欄でも回数を見られるようにする。
import { pageview, track } from "@vercel/analytics";

export type CalendarLinkKind = "webcal" | "https";

/** 閲覧として記録するときのパス。例: /_events/calendar-webcal/<刀のID> */
export function calendarEventPath(kind: CalendarLinkKind, swordId: string): string {
  return `/_events/calendar-${kind}/${encodeURIComponent(swordId)}`;
}

/** カレンダー購読のリンクが押されたことを記録する。計測に失敗しても、リンクの動作は止めない。 */
export function recordCalendarClick(kind: CalendarLinkKind, swordId: string): void {
  try {
    track("calendar_click", { kind, sword: swordId });
    pageview({ route: `/_events/calendar-${kind}/[id]`, path: calendarEventPath(kind, swordId) });
  } catch {
    // 計測の失敗は無視する
  }
}
