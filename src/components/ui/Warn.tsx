// 「要確認」の注意欄（案Bの .warn：左に朱の線、薄い地）。
import type { ReactNode } from "react";
import UnverifiedBadge from "./UnverifiedBadge";

export default function Warn({ children }: { children: ReactNode }) {
  return (
    <div className="warn" role="note">
      <UnverifiedBadge />
      <p>{children}</p>
    </div>
  );
}
