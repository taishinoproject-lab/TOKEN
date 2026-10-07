// 刀剣の表示名の組み立て（data-model.md §6.1）。表示名はデータとして持たず、ここで組み立てる。
import type { AttributionBasis, Smith, Sword } from "./schema";

export interface SwordDisplayName {
  /** 見出し。号があれば号、なければ「種別＋銘」 */
  heading: string;
  /** 副題。号があれば「種別＋銘」、なければ刀匠名 */
  subtitle: string;
}

type SwordNameFields = Pick<Sword, "go" | "blade_type" | "mei" | "mei_kind" | "attributions">;
type SmithNameFields = Pick<Smith, "id" | "name">;

/** 「太刀 銘 三条」「刀 無銘」のような、種別＋銘の文字列。 */
export function bladeAndMei(sword: Pick<Sword, "blade_type" | "mei" | "mei_kind">): string {
  const mei = sword.mei.trim();
  if (mei === "無銘" || sword.mei_kind === "無銘") {
    return `${sword.blade_type} 無銘`;
  }
  const parts = [sword.blade_type, sword.mei_kind, mei].filter((p): p is string => Boolean(p && p.trim()));
  return parts.join(" ");
}

/** 帰属の根拠を添えた刀匠名。在銘はそのまま、極めは「（極め）」、伝は「伝 」を付ける。 */
export function attributedSmithName(name: string, basis: AttributionBasis): string {
  switch (basis) {
    case "在銘":
      return name;
    case "極め":
      return `${name}（極め）`;
    case "伝":
      return `伝 ${name}`;
  }
}

/** 帰属する刀匠名を並べた文字列。刀匠が見つからないIDは飛ばす。 */
export function smithNames(sword: Pick<Sword, "attributions">, smiths: readonly SmithNameFields[]): string {
  const byId = new Map(smiths.map((s) => [s.id, s]));
  return sword.attributions
    .map((a) => {
      const smith = byId.get(a.smith_id);
      return smith ? attributedSmithName(smith.name, a.basis) : null;
    })
    .filter((n): n is string => n !== null)
    .join("・");
}

export function swordDisplayName(sword: SwordNameFields, smiths: readonly SmithNameFields[]): SwordDisplayName {
  const bladeMei = bladeAndMei(sword);
  const go = sword.go?.trim();
  if (go) {
    return { heading: go, subtitle: bladeMei };
  }
  return { heading: bladeMei, subtitle: smithNames(sword, smiths) };
}
