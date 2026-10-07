// 検索用の正規化（data-model.md §10.2）。検索語とデータの両方にかけてから照合する。
import { toShinjitai } from "./kanji-variants";

/** カタカナ（ァ〜ヶ、ヽヾ）をひらがなに変換する。長音記号「ー」はそのまま残す。 */
export function katakanaToHiragana(text: string): string {
  return text.replace(/[ァ-ヶヽヾ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * 検索用に文字列を正規化する。
 * 1. NFKC 正規化（全角英数・半角カナなどをそろえる）
 * 2. 空白を除く
 * 3. カタカナ → ひらがな
 * 4. 旧字体・異体字 → 新字体
 * 5. 英字を小文字にそろえる
 */
export function normalizeForSearch(text: string): string {
  const nfkc = text.normalize("NFKC").replace(/\s+/g, "");
  return toShinjitai(katakanaToHiragana(nfkc)).toLowerCase();
}
