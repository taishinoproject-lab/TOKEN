// 会期終了が近い展覧会の一覧（案Bの .ex-list）。左に終了日を大きく、右に展覧会名と会場。
// 終了日が近いもの（emphasis）は日付を朱にする（docs/design/system.md §4.2）。
import { formatDotDate, weekdayJa } from "../../lib/date";
import UnverifiedBadge from "./UnverifiedBadge";

export interface ExListItem {
  key: string;
  end: string;
  emphasis?: boolean;
  /** 残り日数の表示（「あと○日」など。D-020）。省略時は出さない */
  remaining?: string;
  title: string;
  href: string;
  /** 会場（館名と所在地など） */
  venue: string;
  unverified?: boolean;
}

export default function ExList({ items }: { items: ExListItem[] }) {
  return (
    <ul className="ex-list">
      {items.map((item) => (
        <li key={item.key}>
          <div className="date" data-soon={item.emphasis ? "" : undefined}>
            <b>{formatDotDate(item.end)}</b>
            <small>（{weekdayJa(item.end)}）まで</small>
            {item.remaining && <small className="remaining">{item.remaining}</small>}
          </div>
          <div className="t">
            <a href={item.href}>{item.title}</a> {item.unverified && <UnverifiedBadge />}
          </div>
          <div className="v">{item.venue}</div>
        </li>
      ))}
    </ul>
  );
}
