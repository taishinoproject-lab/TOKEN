// 展覧会の一覧（案Bの .ex-list）。左に日付を大きく、右に展覧会名と会場。
// 終了日が近いもの（emphasis）は日付を朱にする（docs/design/system.md §4.2）。
// 既定は「会期終了が近い展覧会」の形（終了日＋「まで」）。開催予定の一覧などでは dateSuffix で「から」などに変える。
import type { ReactNode } from "react";
import { formatDotDate, weekdayJa } from "../../lib/date";
import UnverifiedBadge from "./UnverifiedBadge";

export interface ExListItem {
  key: string;
  /** 左に大きく出す日付（既定では終了日） */
  end: string;
  /** 日付の下の曜日に続ける言葉。既定は「まで」 */
  dateSuffix?: string;
  emphasis?: boolean;
  title: string;
  href: string;
  /** 会場（館名と所在地など） */
  venue: string;
  /** 会場の下に添える行（会期、出品物など） */
  notes?: string[];
  /** 展覧会名の後ろに付ける札（延期・中止など） */
  badge?: ReactNode;
  unverified?: boolean;
}

export default function ExList({ items }: { items: ExListItem[] }) {
  return (
    <ul className="ex-list">
      {items.map((item) => (
        <li key={item.key}>
          <div className="date" data-soon={item.emphasis ? "" : undefined}>
            <b>{formatDotDate(item.end)}</b>
            <small>
              （{weekdayJa(item.end)}）{item.dateSuffix ?? "まで"}
            </small>
          </div>
          <div className="t">
            <a href={item.href}>{item.title}</a> {item.badge}
            {item.unverified && <UnverifiedBadge />}
          </div>
          <div className="v">
            {item.venue}
            {item.notes?.map((note) => (
              <span key={note} className="block">
                {note}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
