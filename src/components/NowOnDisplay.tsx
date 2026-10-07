// トップの「いま会える刀」（T-207）。目録の形式（docs/design/system.md §4.2）で、今日展示されている刀を並べる。
// ビルド時の日付で描画したあと、ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useState } from "react";
import { formatMonthDayJa, formatMonthDayWeek, OPEN_END_LABEL, todayJst } from "../lib/date";
import type { Confidence, Designation, NbthkRank } from "../lib/schema";
import type { ExhibitionForStatus } from "../lib/status";
import { nowOnDisplay } from "../lib/top-page";
import Catalog, { type CatalogRow, type CatalogSmith } from "./ui/Catalog";
import UnverifiedBadge from "./ui/UnverifiedBadge";

export interface NowSword {
  id: string;
  heading: string;
  subtitle: string;
  designation: Designation;
  nbthkRank?: NbthkRank;
  smiths: CatalogSmith[];
}

export interface NowExhibition extends ExhibitionForStatus {
  title: string;
  venueName: string;
  room?: string;
  confidence: Confidence;
}

interface Props {
  swords: NowSword[];
  exhibitions: NowExhibition[];
  buildToday: string;
}

export function NowOnDisplayView({ swords, exhibitions, today }: Omit<Props, "buildToday"> & { today: string }) {
  const swordById = new Map(swords.map((s) => [s.id, s]));
  const exhibitionById = new Map(exhibitions.map((e) => [e.id, e]));
  const items = nowOnDisplay(
    swords.map((s) => s.id),
    exhibitions,
    today,
  );

  const rows: CatalogRow[] = items.flatMap((item) => {
    const sword = swordById.get(item.swordId);
    const ex = exhibitionById.get(item.exhibitionId);
    if (!sword || !ex) return [];
    return [
      {
        key: sword.id,
        heading: sword.heading,
        subtitle: sword.subtitle,
        href: `/swords/${sword.id}`,
        designation: sword.designation,
        nbthkRank: sword.nbthkRank,
        smiths: sword.smiths,
        venue: (
          <>
            {ex.venueName}
            {ex.room && ` ${ex.room}`}
            <a className="note" href={`/exhibitions/${ex.id}`}>
              「{ex.title}」
            </a>
          </>
        ),
        display: (
          <>
            <span className="until">{item.until === null ? OPEN_END_LABEL : `${formatMonthDayWeek(item.until)}まで`}</span>{" "}
            {ex.confidence === "unverified" && <UnverifiedBadge title="この展示情報は、公式サイトでの確認がまだ済んでいません" />}
          </>
        ),
      },
    ];
  });

  return (
    <>
      <div className="sec-h">
        <h2 id="h-now">いま会える刀</h2>
        <span className="aside">
          {formatMonthDayJa(today)} 現在、展示中 ／ {rows.length}件
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="gothic mt-4 text-sm">今日、展示されている刀は登録されていません。</p>
      ) : (
        <Catalog rows={rows} caption="いま会える刀の目録" />
      )}
    </>
  );
}

export default function NowOnDisplay({ buildToday, ...rest }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);
  return <NowOnDisplayView {...rest} today={today} />;
}
