// トップの「会期終了が近い展覧会」（T-207）。案Bの .ex-list の形式（docs/design/system.md §4.2）。
// 終了日までの残り日数を「本日まで／明日まで／あと○日」で添える（D-020）。
// ビルド時の日付で描画したあと、ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useState } from "react";
import { todayJst } from "../lib/date";
import type { Confidence, Exhibition } from "../lib/schema";
import { ENDING_SOON_DEFAULTS, endingSoon, remainingDaysLabel } from "../lib/top-page";
import ExList, { type ExListItem } from "./ui/ExList";

export interface EndingExhibition extends Pick<Exhibition, "id" | "start_date" | "end_date" | "status"> {
  title: string;
  /** 「刀剣博物館　東京都墨田区」のような会場の表示 */
  venueText: string;
  confidence: Confidence;
}

interface Props {
  exhibitions: EndingExhibition[];
  buildToday: string;
}

export function EndingSoonView({ exhibitions, today }: { exhibitions: EndingExhibition[]; today: string }) {
  const byId = new Map(exhibitions.map((e) => [e.id, e]));
  const items: ExListItem[] = endingSoon(exhibitions, today).flatMap((item) => {
    const ex = byId.get(item.exhibitionId);
    if (!ex) return [];
    return [
      {
        key: ex.id,
        end: item.end,
        emphasis: item.emphasis,
        remaining: remainingDaysLabel(item.daysLeft),
        title: ex.title,
        href: `/exhibitions/${ex.id}`,
        venue: ex.venueText,
        unverified: ex.confidence === "unverified",
      },
    ];
  });

  return (
    <>
      <div className="sec-h">
        <h2 id="h-ending">会期終了が近い展覧会</h2>
        <span className="aside">{ENDING_SOON_DEFAULTS.withinDays}日以内に終わる展覧会 ／ 終了日の近い順</span>
      </div>
      {items.length === 0 ? (
        <p className="gothic mt-4 text-sm">{ENDING_SOON_DEFAULTS.withinDays}日以内に会期が終わる展覧会は、登録されていません。</p>
      ) : (
        <ExList items={items} />
      )}
    </>
  );
}

export default function EndingSoon({ buildToday, exhibitions }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);
  return <EndingSoonView exhibitions={exhibitions} today={today} />;
}
