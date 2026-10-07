// 帰属の区別（在銘・極め・伝）。
// box：案Aの小さな枠（在銘は実線、極めは破線、伝は点線）。bracket：目録の〔在銘〕の亀甲括弧（system.md §4.2）。
import type { AttributionBasis } from "../../lib/schema";

interface Props {
  basis: AttributionBasis;
  variant?: "box" | "bracket";
}

export const ATTRIBUTION_LEGEND = "在銘＝本人の銘がある ／ 極め＝無銘だが鑑定で帰属 ／ 伝＝そう伝えられる";

export default function AttributionMark({ basis, variant = "box" }: Props) {
  if (variant === "bracket") return <span className="attr-bracket">〔{basis}〕</span>;
  return (
    <span className="attr-box" data-basis={basis}>
      {basis}
    </span>
  );
}
