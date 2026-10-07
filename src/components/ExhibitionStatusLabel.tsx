// 展覧会の状態（開催中・開催予定・終了など）の札。ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useState } from "react";
import { todayJst } from "../lib/date";
import type { Exhibition } from "../lib/schema";
import { exhibitionStatus } from "../lib/status";
import { exhibitionStatusView } from "../lib/status-view";
import StatusBadge from "./ui/StatusBadge";

interface Props {
  exhibition: Pick<Exhibition, "start_date" | "end_date" | "status">;
  buildToday: string;
}

export default function ExhibitionStatusLabel({ exhibition, buildToday }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);

  const status = exhibitionStatus(exhibition, today);
  const view = exhibitionStatusView(status);
  return (
    <span data-status={status} className="mr-2">
      <StatusBadge tone={view.tone} size="sm">
        {view.badge}
      </StatusBadge>
    </span>
  );
}
