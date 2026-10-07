// 刀剣詳細の「展示」欄（data-model.md §9、docs/design/system.md §4.1）。
// 展示情報の表（状態・会場・展覧会・この刀の展示・観覧料）と、要確認の注意欄。
// ビルド時の日付で描画したあと、ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useState } from "react";
import { formatFullDate, todayJst } from "../lib/date";
import type { Confidence } from "../lib/schema";
import { exhibitionStatus, swordStatus, type ExhibitionForStatus } from "../lib/status";
import { exhibitPeriodText, exhibitionStatusView, formatSession, swordStatusView } from "../lib/status-view";
import ExhibitTable, { type InfoRow } from "./ui/ExhibitTable";
import StatusBadge from "./ui/StatusBadge";
import Warn from "./ui/Warn";

export interface SwordExhibitionView extends ExhibitionForStatus {
  title: string;
  venue: { name: string; href?: string } | null;
  room?: string;
  admission?: string;
  official_url: string;
  verified_at: string;
  confidence: Confidence;
}

interface Props {
  swordId: string;
  holder: { text: string; href?: string };
  /** この刀が出品される展覧会（exhibits はこの刀の行だけ） */
  exhibitions: SwordExhibitionView[];
  /** ビルド時の今日の日付（日本時間） */
  buildToday: string;
}

const exhibitionHref = (id: string) => `/exhibitions/${id}`;

function LinkOrText({ text, href }: { text: string; href?: string }) {
  return href ? <a href={href}>{text}</a> : <>{text}</>;
}

export function SwordExhibitView({ swordId, holder, exhibitions, today }: Omit<Props, "buildToday"> & { today: string }) {
  const status = swordStatus(swordId, exhibitions, today);
  const view = swordStatusView(status);
  const exhibition = status.kind === "none" ? undefined : exhibitions.find((e) => e.id === status.exhibitionId);

  const rows: InfoRow[] = [
    {
      label: "状態",
      value: (
        <>
          <StatusBadge tone={view.tone}>{view.badge}</StatusBadge>
          {view.detail && <span className="until">{view.detail}</span>}
          {status.kind === "none" && (
            <span className="until">
              <LinkOrText text={holder.text} href={holder.href} />
            </span>
          )}
          {status.kind === "none" && <span className="sub">登録されている展示の予定はありません。</span>}
        </>
      ),
    },
  ];
  if (exhibition) {
    rows.push(
      {
        label: "会場",
        value: exhibition.venue ? (
          <>
            <LinkOrText text={exhibition.venue.name} href={exhibition.venue.href} />
            {exhibition.room && `　${exhibition.room}`}
          </>
        ) : (
          (exhibition.room ?? "—")
        ),
      },
      {
        label: "展覧会",
        value: (
          <>
            <a href={exhibitionHref(exhibition.id)}>{exhibition.title}</a>
            <span className="sub">{formatSession(exhibition.start_date, exhibition.end_date)}</span>
          </>
        ),
      },
      { label: "この刀の展示", value: exhibitPeriodText(exhibition, exhibition.exhibits) },
    );
    if (exhibition.admission) rows.push({ label: "観覧料", value: exhibition.admission });
  }

  // 判定に使わなかった、開催中・開催予定の展覧会
  const others = exhibitions
    .filter((ex) => ex.id !== exhibition?.id)
    .map((ex) => ({ ex, exStatus: exhibitionStatus(ex, today) }))
    .filter(({ exStatus }) => exStatus === "ongoing" || exStatus === "upcoming")
    .sort((a, b) => (a.ex.start_date < b.ex.start_date ? -1 : a.ex.start_date > b.ex.start_date ? 1 : 0));

  return (
    <div data-status={status.kind}>
      <ExhibitTable rows={rows} caption="この刀の展示情報" />
      {exhibition &&
        (exhibition.confidence === "unverified" ? (
          <Warn>
            この展示情報は、公式サイトでの確認がまだ済んでいません。お出かけ前に
            <a href={exhibition.official_url} rel="noopener noreferrer" target="_blank">
              展覧会の公式ページ
            </a>
            をご確認ください。（最終確認日：{formatFullDate(exhibition.verified_at)}）
          </Warn>
        ) : (
          <p className="note-line">
            展示情報の最終確認日：{formatFullDate(exhibition.verified_at)}。お出かけ前に
            <a href={exhibition.official_url} rel="noopener noreferrer" target="_blank">
              展覧会の公式ページ
            </a>
            もご確認ください。
          </p>
        ))}
      {others.length > 0 && (
        <div className="mt-5">
          <h3 className="gothic text-xs text-usuzumi">ほかの展示の予定</h3>
          <ul className="mt-1 text-sm">
            {others.map(({ ex, exStatus }) => {
              const exView = exhibitionStatusView(exStatus);
              return (
                <li key={ex.id} className="border-b border-mokume py-2">
                  <StatusBadge tone={exView.tone} size="sm">
                    {exView.badge}
                  </StatusBadge>{" "}
                  <a href={exhibitionHref(ex.id)}>{ex.title}</a>
                  {ex.venue && `（${ex.venue.name}）`}
                  <span className="gothic block text-xs text-usuzumi">{formatSession(ex.start_date, ex.end_date)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function SwordExhibit({ buildToday, ...rest }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);
  return <SwordExhibitView {...rest} today={today} />;
}
