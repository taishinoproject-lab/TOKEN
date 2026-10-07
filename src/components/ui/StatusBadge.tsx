// 状態の札（いま会えます・開催予定など）。色だけでなく、必ず文字で状態を示す。
import type { ReactNode } from "react";
import type { StatusTone } from "../../lib/status-view";

interface Props {
  tone: StatusTone;
  /** sm：一覧の中の小さな札、md：展示情報の表の札（15px） */
  size?: "sm" | "md";
  children: ReactNode;
}

export default function StatusBadge({ tone, size = "md", children }: Props) {
  return (
    <span className="status-badge" data-tone={tone} data-size={size}>
      {children}
    </span>
  );
}
