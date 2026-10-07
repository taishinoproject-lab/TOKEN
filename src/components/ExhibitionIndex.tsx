// 展覧会の一覧を、開催中・開催予定・終了に分けて並べる（案Bの .ex-list。docs/design/system.md §4.2）。
// 展覧会の一覧（/exhibitions）、館ページ、刀匠ページで使う。
// ビルド時の日付で描画したあと、ブラウザで今日の日付（日本時間）を使って分け直す。
// 「あと○日」の表示は未決定のため出さない（system.md §5）。
import { useEffect, useState } from "react";
import { daysBetween, todayJst } from "../lib/date";
import { groupExhibitions, type ExhibitionGroupKey } from "../lib/listing";
import type { Confidence, Exhibition } from "../lib/schema";
import { exhibitionStatusView, formatSession } from "../lib/status-view";
import { ENDING_SOON_EMPHASIS_DAYS } from "../lib/top-page";
import type { ExhibitionStatus } from "../lib/status";
import ExList, { type ExListItem } from "./ui/ExList";
import StatusBadge from "./ui/StatusBadge";

export interface IndexExhibition extends Pick<Exhibition, "id" | "start_date" | "end_date" | "status"> {
  title: string;
  /** 「刀剣博物館　東京都墨田区」のような会場の表示 */
  venueText: string;
  confidence: Confidence;
  /** 会期の下に添える行（刀匠ページでの出品物など） */
  notes?: string[];
}

interface Props {
  exhibitions: IndexExhibition[];
  buildToday: string;
  /** 出す区分。既定は3つすべて */
  groups?: ExhibitionGroupKey[];
  /** 終了した展覧会を何件まで出すか（終了日の新しい順）。省略時はすべて */
  endedLimit?: number;
  /** 区分の見出しの id の接頭辞（同じページに2つ置くとき用） */
  idPrefix?: string;
}

const GROUP_LABELS: Record<ExhibitionGroupKey, string> = {
  ongoing: "開催中",
  upcoming: "開催予定",
  ended: "終了",
};

function toItem(ex: IndexExhibition, status: ExhibitionStatus, group: ExhibitionGroupKey, today: string): ExListItem {
  const notes = [formatSession(ex.start_date, ex.end_date), ...(ex.notes ?? [])];
  const badge =
    status === "postponed" || status === "cancelled" ? (
      <StatusBadge tone={exhibitionStatusView(status).tone} size="sm">
        {exhibitionStatusView(status).badge}
      </StatusBadge>
    ) : undefined;
  const base = {
    key: ex.id,
    title: ex.title,
    href: `/exhibitions/${ex.id}`,
    venue: ex.venueText,
    notes,
    badge,
    unverified: ex.confidence === "unverified",
  };
  if (group === "ongoing") {
    // 終了日が未定（D-012）なら開始日を出す。会期の行に「会期未定（公式サイトで確認）」が入る
    if (ex.end_date === null) return { ...base, end: ex.start_date, dateSuffix: "から" };
    return { ...base, end: ex.end_date, emphasis: daysBetween(today, ex.end_date) <= ENDING_SOON_EMPHASIS_DAYS };
  }
  if (group === "upcoming") return { ...base, end: ex.start_date, dateSuffix: "から" };
  return { ...base, end: ex.end_date ?? ex.start_date, dateSuffix: ex.end_date ? "まで" : "から" };
}

export function ExhibitionIndexView({
  exhibitions,
  today,
  groups = ["ongoing", "upcoming", "ended"],
  endedLimit,
  idPrefix = "ex",
}: Omit<Props, "buildToday"> & { today: string }) {
  const grouped = groupExhibitions(exhibitions, today, { endedLimit });
  return (
    <>
      {groups.map((key) => {
        const list = grouped[key];
        const headingId = `${idPrefix}-${key}`;
        return (
          <section key={key} className="mt-6" aria-labelledby={headingId} data-group={key}>
            <h3 id={headingId} className="cap">
              {GROUP_LABELS[key]}
              <span>
                {list.length}件{key === "ended" && endedLimit !== undefined && "（終了日の新しいものから）"}
              </span>
            </h3>
            {list.length === 0 ? (
              <p className="gothic mt-3 text-sm">{GROUP_LABELS[key]}の展覧会は登録されていません。</p>
            ) : (
              <ExList items={list.map(({ exhibition, status }) => toItem(exhibition, status, key, today))} />
            )}
          </section>
        );
      })}
    </>
  );
}

export default function ExhibitionIndex({ buildToday, ...rest }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);
  return <ExhibitionIndexView {...rest} today={today} />;
}
