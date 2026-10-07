// トップページの「いま会える刀」と「会期終了が近い展覧会」の抽出（data-model.md §11、T-207）。
// 今日の日付（日本時間）を引数で受け取り、ビルド時とブラウザ側の両方で同じ関数を使う。
import { compareEndDates, exhibitionStatus, swordStatus, type ExhibitionForStatus } from "./status";
import { daysBetween, type IsoDate } from "./date";
import type { Exhibition } from "./schema";

export interface NowOnDisplayItem {
  swordId: string;
  exhibitionId: string;
  /** この刀の展示の最終日。null は未定（D-012） */
  until: IsoDate | null;
}

/**
 * 今日、展示されている刀（刀剣詳細の「いま会えます」と同じ判定）。
 * 終了日の近い順に並べ、終了日が未定のものは最後にする。同じ終了日なら swordIds の順。
 */
export function nowOnDisplay(
  swordIds: readonly string[],
  exhibitions: readonly ExhibitionForStatus[],
  today: IsoDate,
): NowOnDisplayItem[] {
  const items: NowOnDisplayItem[] = [];
  for (const swordId of swordIds) {
    const related = exhibitions.filter((ex) => ex.exhibits.some((e) => e.sword_id === swordId));
    if (related.length === 0) continue;
    const status = swordStatus(swordId, related, today);
    if (status.kind === "on_display") {
      items.push({ swordId, exhibitionId: status.exhibitionId, until: status.until });
    }
  }
  // Array.prototype.sort は安定なので、同じ終了日なら元の順を保つ
  return items.sort((a, b) => compareEndDates(a.until, b.until));
}

export interface EndingSoonOptions {
  /** 今日から何日以内に終わるものを出すか */
  withinDays: number;
  /** 最大件数 */
  limit: number;
}

export const ENDING_SOON_DEFAULTS: EndingSoonOptions = { withinDays: 30, limit: 8 };

/** 終了日の数字を朱にする日数（今日から○日以内に終わる。docs/design/system.md §4.2） */
export const ENDING_SOON_EMPHASIS_DAYS = 5;

export interface EndingSoonItem {
  exhibitionId: string;
  end: IsoDate;
  /** 今日から終了日までの日数（終了日が今日なら 0） */
  daysLeft: number;
  /** 終了日が近いので強調する */
  emphasis: boolean;
}

/**
 * 開催中で、終了日が近い展覧会。終了日の近い順。
 * 終了日が未定（D-012）の展覧会は、いつ終わるか分からないので含めない。
 */
export function endingSoon(
  exhibitions: readonly Pick<Exhibition, "id" | "start_date" | "end_date" | "status">[],
  today: IsoDate,
  options: EndingSoonOptions = ENDING_SOON_DEFAULTS,
): EndingSoonItem[] {
  return exhibitions
    .flatMap((ex) => {
      if (ex.end_date === null || exhibitionStatus(ex, today) !== "ongoing") return [];
      const daysLeft = daysBetween(today, ex.end_date);
      if (daysLeft > options.withinDays) return [];
      return [{ exhibitionId: ex.id, end: ex.end_date, daysLeft, emphasis: daysLeft <= ENDING_SOON_EMPHASIS_DAYS }];
    })
    .sort((a, b) => (a.end < b.end ? -1 : a.end > b.end ? 1 : 0))
    .slice(0, options.limit);
}

/**
 * 終了日までの残り日数の表示（D-020）。0日は「本日まで」、1日は「明日まで」、それ以外は「あと○日」。
 */
export function remainingDaysLabel(daysLeft: number): string {
  if (daysLeft <= 0) return "本日まで";
  if (daysLeft === 1) return "明日まで";
  return `あと${daysLeft}日`;
}
