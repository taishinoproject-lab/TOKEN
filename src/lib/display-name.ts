// 刀剣の表示名の組み立て（data-model.md §6.1）。表示名はデータとして持たず、ここで組み立てる。
import type { AttributionBasis, Smith, Sword } from "./schema";

export interface SwordDisplayName {
  /** 見出し。号があれば号、なければ「種別＋銘」 */
  heading: string;
  /** 副題。号があれば「種別＋銘」、なければ刀匠名 */
  subtitle: string;
}

type SwordNameFields = Pick<Sword, "go" | "blade_type" | "mei" | "mei_kind" | "attributions">;
type SmithNameFields = Pick<Smith, "id" | "name" | "kind">;

/** 刀匠の表示名。流派単位の登録（kind: "school"、D-012）は「福岡一文字派（流派）」のように示す。 */
export function smithDisplayName(smith: Pick<Smith, "name" | "kind">): string {
  return smith.kind === "school" ? `${smith.name}（流派）` : smith.name;
}

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
      return smith ? attributedSmithName(smithDisplayName(smith), a.basis) : null;
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

/** 目録の見出しに出す銘の最大の文字数（省略記号を含む） */
export const CATALOG_MEI_MAX = 12;

/**
 * 目録の見出しに出す、銘の先頭の部分。銘の全文は刀剣詳細で表示する。
 * 1. 最初の区切り（「／」または空白）より前だけを残す。区切りは、表と裏、行や面の変わり目を表すため。
 * 2. 残りが CATALOG_MEI_MAX 文字を超えるなら、先頭から CATALOG_MEI_MAX − 1 文字にして「…」を付ける。
 * 3. 1 で後ろを落としたときも「…」を付け、続きがあることを示す。
 */
export function meiHead(mei: string): string {
  const full = mei.trim();
  const head = full.split(/[／/\s]/u)[0] || full;
  const chars = [...head];
  if (chars.length > CATALOG_MEI_MAX) return `${chars.slice(0, CATALOG_MEI_MAX - 1).join("")}…`;
  return head.length < full.length ? `${head}…` : head;
}

/**
 * 目録（一覧）での刀の名前。号があれば号と「種別＋銘」（銘は全文）。
 * 号がなければ「種別＋銘の先頭の部分」（meiHead）だけにして、見出しが何行にもならないようにする。
 * 刀匠は目録の刀匠の列に出すので、号がない刀の副題は空にする。
 */
export function catalogSwordName(sword: Pick<Sword, "go" | "blade_type" | "mei" | "mei_kind">): SwordDisplayName {
  const go = sword.go?.trim();
  if (go) return { heading: go, subtitle: bladeAndMei(sword) };
  return { heading: bladeAndMei({ ...sword, mei: meiHead(sword.mei) }), subtitle: "" };
}
