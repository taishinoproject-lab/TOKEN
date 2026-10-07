// 展覧会ページの展示情報の表（案Bの .exhibit。docs/design/system.md §4.1）。
// 行：状態／会場／会期／展示期間の区分／観覧料。表の下に要確認の注意欄。
// ビルド時の日付で描画したあと、ブラウザで今日の日付（日本時間）を使って状態を判定し直す。
import { useEffect, useState } from "react";
import { formatFullDate, formatMonthDayJa, todayJst } from "../lib/date";
import type { Confidence, Exhibition } from "../lib/schema";
import { exhibitionStatus } from "../lib/status";
import { exhibitionStatusDetail, exhibitionStatusView, formatSession } from "../lib/status-view";
import ExhibitTable, { type InfoRow } from "./ui/ExhibitTable";
import StatusBadge from "./ui/StatusBadge";
import Warn from "./ui/Warn";

export interface ExhibitionInfoData extends Pick<Exhibition, "start_date" | "end_date" | "status" | "periods"> {
  venue: { name: string; href?: string; address?: string } | null;
  room?: string;
  admission?: string;
  official_url: string;
  verified_at: string;
  confidence: Confidence;
}

interface Props {
  exhibition: ExhibitionInfoData;
  buildToday: string;
}

export function ExhibitionInfoView({ exhibition: ex, today }: { exhibition: ExhibitionInfoData; today: string }) {
  const status = exhibitionStatus(ex, today);
  const view = exhibitionStatusView(status);
  const rows: InfoRow[] = [
    {
      label: "状態",
      value: (
        <>
          <StatusBadge tone={view.tone}>{view.badge}</StatusBadge>
          <span className="until">{exhibitionStatusDetail(ex, status)}</span>
        </>
      ),
    },
    {
      label: "会場",
      value: ex.venue ? (
        <>
          {ex.venue.href ? <a href={ex.venue.href}>{ex.venue.name}</a> : ex.venue.name}
          {ex.room && `　${ex.room}`}
          {ex.venue.address && <span className="sub">{ex.venue.address}</span>}
        </>
      ) : (
        (ex.room ?? "—")
      ),
    },
    { label: "会期", value: formatSession(ex.start_date, ex.end_date) },
    {
      label: "展示期間の区分",
      value:
        ex.periods.length === 0 ? (
          <>
            区分の登録なし
            <span className="sub">展示替えの有無は、公式ページでご確認ください。</span>
          </>
        ) : (
          <ul className="m-0 list-none p-0">
            {ex.periods.map((p) => (
              <li key={p.id}>
                <b className="font-semibold">{p.id}</b>　{formatMonthDayJa(p.start_date)}〜{formatMonthDayJa(p.end_date)}
              </li>
            ))}
          </ul>
        ),
    },
  ];
  if (ex.admission) rows.push({ label: "観覧料", value: ex.admission });

  return (
    <div data-status={status}>
      <ExhibitTable rows={rows} caption="展示情報" />
      {ex.confidence === "unverified" ? (
        <Warn>
          この展覧会の情報は、公式サイトでの確認がまだ済んでいません。お出かけ前に
          <a href={ex.official_url} rel="noopener noreferrer" target="_blank">
            展覧会の公式ページ
          </a>
          をご確認ください。（最終確認日：{formatFullDate(ex.verified_at)}）
        </Warn>
      ) : (
        <p className="note-line">
          最終確認日：{formatFullDate(ex.verified_at)}。お出かけ前に
          <a href={ex.official_url} rel="noopener noreferrer" target="_blank">
            展覧会の公式ページ
          </a>
          もご確認ください。
        </p>
      )}
    </div>
  );
}

export default function ExhibitionInfo({ exhibition, buildToday }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);
  return <ExhibitionInfoView exhibition={exhibition} today={today} />;
}
