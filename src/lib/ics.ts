// 刀剣ごとのカレンダー（.ics）の生成（RFC 5545、decisions.md D-008）。
// 展示期間を終日の予定として出力する。刀ごとの展示期間（period_ids）を反映する。
// 終了日が未定（D-012）の展示は、開始日だけの終日の予定（「展示開始」）として出力する。
import { addDays, formatDateRange, type IsoDate } from "./date";
import type { Exhibit, Exhibition, Venue } from "./schema";
import { exhibitDisplayRanges, mergeRanges } from "./status";

const CRLF = "\r\n";
const MAX_LINE_OCTETS = 75;
const encoder = new TextEncoder();

export const ICS_PRODID = "-//houken-token//sword-calendar//JA";
const UID_DOMAIN = "houken-token";

/** TEXT 型の値のエスケープ（RFC 5545 §3.3.11）。 */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/**
 * 1行を75オクテット以内に折り返す（RFC 5545 §3.1）。
 * 続きの行は空白1文字で始める。UTF-8 の文字の途中では折り返さない。
 */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let currentOctets = 0;
  for (const ch of line) {
    const octets = encoder.encode(ch).length;
    // 続きの行は先頭の空白1オクテットを含めて75オクテット以内にする
    const limit = parts.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1;
    if (currentOctets + octets > limit) {
      parts.push(current);
      current = "";
      currentOctets = 0;
    }
    current += ch;
    currentOctets += octets;
  }
  parts.push(current);
  return parts.join(`${CRLF} `);
}

/** "2026-10-07" → "20261007"（DATE 型） */
export function formatIcsDate(date: IsoDate): string {
  return date.replace(/-/g, "");
}

/** Date → "20261007T013000Z"（UTC の DATE-TIME 型） */
export function formatIcsDateTimeUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z")
    .replace(/[-:]/g, "");
}

/** UID に使える文字（英数字・ハイフン・ピリオド）以外を置き換える。IDは英小文字・数字・ハイフンのみなので、通常はそのまま。 */
const uidPart = (value: string): string => value.replace(/[^A-Za-z0-9.-]/g, "_");

export interface IcsEvent {
  uid: string;
  /** 初日（終日の予定） */
  start: IsoDate;
  /** 最終日（この日を含む） */
  end: IsoDate;
  summary: string;
  description: string;
  location?: string;
  url?: string;
  geo?: { lat: number; lng: number };
}

export interface IcsCalendar {
  name: string;
  description?: string;
  events: IcsEvent[];
  /** DTSTAMP に使う日時（ビルドした時刻） */
  dtstamp: Date;
}

/** iCalendar のテキストを作る。行末は CRLF、各行は75オクテット以内に折り返す。 */
export function buildIcs(calendar: IcsCalendar): string {
  const stamp = formatIcsDateTimeUtc(calendar.dtstamp);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${ICS_PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendar.name)}`,
    ...(calendar.description ? [`X-WR-CALDESC:${escapeText(calendar.description)}`] : []),
    // 購読したカレンダーを、1日1回更新してもらう
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
  ];
  for (const ev of calendar.events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${ev.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${formatIcsDate(ev.start)}`,
      // 終日の予定の DTEND は、最終日の翌日（この日を含まない）
      `DTEND;VALUE=DATE:${formatIcsDate(addDays(ev.end, 1))}`,
      `SUMMARY:${escapeText(ev.summary)}`,
      `DESCRIPTION:${escapeText(ev.description)}`,
      ...(ev.location ? [`LOCATION:${escapeText(ev.location)}`] : []),
      ...(ev.geo ? [`GEO:${ev.geo.lat};${ev.geo.lng}`] : []),
      // URI 型の値は ASCII にする（日本語を含むURLはパーセントエンコードする）
      ...(ev.url ? [`URL:${new URL(ev.url).href}`] : []),
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join(CRLF) + CRLF;
}

type ExhibitionForIcs = Pick<
  Exhibition,
  "id" | "title" | "venue_id" | "room" | "start_date" | "end_date" | "status" | "official_url" | "periods" | "confidence"
> & { exhibits: Pick<Exhibit, "sword_id" | "period_ids">[] };

type VenueForIcs = Pick<Venue, "id" | "name" | "short_name" | "address" | "lat" | "lng">;

export interface SwordCalendarInput {
  sword: { id: string; heading: string };
  exhibitions: readonly ExhibitionForIcs[];
  venues: readonly VenueForIcs[];
  dtstamp: Date;
  /** 刀剣ページの絶対URL。公開先が未定のあいだは省略できる */
  swordPageUrl?: string;
}

/** 合わせた展示期間に含まれる、展示期間の区分の名前（例：「前期・後期」）。区分の指定がなければ null。 */
function periodLabel(
  exhibition: ExhibitionForIcs,
  exhibits: readonly Pick<Exhibit, "period_ids">[],
  range: { start: IsoDate; end: IsoDate | null },
): string | null {
  if (exhibits.some((e) => !e.period_ids || e.period_ids.length === 0)) return null;
  const ids = new Set(exhibits.flatMap((e) => e.period_ids ?? []));
  const names = exhibition.periods
    .filter((p) => ids.has(p.id) && range.start <= p.start_date && (range.end === null || p.end_date <= range.end))
    .map((p) => p.id);
  return names.length > 0 ? names.join("・") : null;
}

/**
 * 刀剣1振りのカレンダーの予定を作る。
 * - 展覧会ごとに、その刀の展示期間（period_ids を反映し、隣り合う期間はつなげる）を1件の終日の予定にする。
 * - 終了日が未定の展示は、開始日だけの終日の予定にする（終わりの分からない予定を、カレンダー上で長く伸ばさないため）。
 * - 中止・延期の展覧会は含めない。
 * - UID は「刀剣ID・展覧会ID・連番」から決まる。
 */
export function swordCalendarEvents(input: SwordCalendarInput): IcsEvent[] {
  const venueById = new Map(input.venues.map((v) => [v.id, v]));
  const events: IcsEvent[] = [];
  const exhibitions = [...input.exhibitions].sort((a, b) =>
    a.start_date < b.start_date ? -1 : a.start_date > b.start_date ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
  );
  for (const ex of exhibitions) {
    if (ex.status === "cancelled" || ex.status === "postponed") continue;
    const exhibits = ex.exhibits.filter((e) => e.sword_id === input.sword.id);
    if (exhibits.length === 0) continue;
    const ranges = mergeRanges(exhibits.flatMap((e) => exhibitDisplayRanges(ex, e)));
    const venue = venueById.get(ex.venue_id);
    ranges.forEach((range, i) => {
      const label = periodLabel(ex, exhibits, range);
      const openEnded = range.end === null;
      const description = [
        `展覧会：${ex.title}`,
        venue ? `会場：${venue.name}${ex.room ? `（${ex.room}）` : ""}` : null,
        `会期：${formatDateRange(ex.start_date, ex.end_date)}`,
        `この刀の展示：${formatDateRange(range.start, range.end)}${label ? `（${label}）` : ""}`,
        openEnded ? "終了日が未定のため、この予定は展示の開始日だけを示しています。" : null,
        `公式サイト：${ex.official_url}`,
        input.swordPageUrl ? `刀剣のページ：${input.swordPageUrl}` : null,
        ex.confidence === "unverified" ? "この展示情報は要確認です。" : null,
        "最新情報は公式サイトで確認してください。",
      ]
        .filter((line): line is string => line !== null)
        .join("\n");
      events.push({
        uid: `${uidPart(input.sword.id)}.${uidPart(ex.id)}.${i + 1}@${UID_DOMAIN}`,
        start: range.start,
        end: range.end ?? range.start,
        summary: `${input.sword.heading} ${openEnded ? "展示開始・会期未定" : "展示"}（${venue?.short_name ?? ex.title}）`,
        description,
        location: venue ? [venue.name, venue.address].filter(Boolean).join(" ") : undefined,
        url: ex.official_url,
        geo: venue ? { lat: venue.lat, lng: venue.lng } : undefined,
      });
    });
  }
  return events;
}

/** 刀剣1振りの .ics を作る。展示予定がなくても、予定のない有効なカレンダーを返す。 */
export function buildSwordIcs(input: SwordCalendarInput): string {
  return buildIcs({
    name: `${input.sword.heading}｜訪剣`,
    description: `${input.sword.heading}の展示予定（訪剣 −TOKEN−）。最新情報は各展覧会の公式サイトで確認してください。`,
    events: swordCalendarEvents(input),
    dtstamp: input.dtstamp,
  });
}
