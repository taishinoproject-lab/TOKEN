// 白鞘の号表示（docs/design/system.md §3）の文字の大きさと書体を決める。
// 縦書きは文字数で高さが変わるため、文字数が多いほど小さくする（白鞘の高さに収める）。
import { canUseFude } from "./fude";

export type SayaSize = "l" | "m" | "s" | "xs";

/** 文字数（空白を除く）から大きさを決める。5文字までは最大、6文字、7〜9文字、10文字以上の4段階。 */
export function sayaSize(text: string): SayaSize {
  const length = [...text.replace(/\s/gu, "")].length;
  if (length <= 5) return "l";
  if (length === 6) return "m";
  if (length <= 9) return "s";
  return "xs";
}

/**
 * 白鞘に大きく出す文字の書体。号は筆の書体、号がない刀（種別＋銘を出す）は明朝。
 * 号でも、筆の書体に字形がない字を含むときは明朝にする（一部の字だけ別の書体になるのを避ける）。
 */
export function sayaFont(text: string, isGo: boolean): "fude" | "mincho" {
  return isGo && canUseFude(text) ? "fude" : "mincho";
}
