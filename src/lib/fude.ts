// 筆の書体（Yuji Syuku）で表示できるかの判定（docs/design/system.md §2）。
// 字形がない字があると、その字だけ別の書体で表示されて見た目がそろわない。
// そのため、字形がない字を1つでも含む号は、全体を明朝で表示する。
import { FUDE_ASTRAL_CODE_POINTS, FUDE_BMP_BITMAP_BASE64 } from "./fude-glyphs.generated";

let bmp: Uint8Array | null = null;
const astral = new Set(FUDE_ASTRAL_CODE_POINTS);

function bitmap(): Uint8Array {
  if (!bmp) bmp = Uint8Array.from(atob(FUDE_BMP_BITMAP_BASE64), (c) => c.charCodeAt(0));
  return bmp;
}

/** 1文字（コードポイント1つ）について、筆の書体に字形があるか。 */
export function hasFudeGlyph(char: string): boolean {
  const cp = char.codePointAt(0);
  if (cp === undefined) return false;
  if (cp > 0xffff) return astral.has(cp);
  return (bitmap()[cp >> 3] & (1 << (cp & 7))) !== 0;
}

/** 字形がない文字の一覧（重複なし、出てきた順）。空白は見た目に影響しないので数えない。 */
export function missingFudeGlyphs(text: string): string[] {
  const missing = new Set<string>();
  for (const char of text) {
    if (/\s/u.test(char)) continue;
    if (!hasFudeGlyph(char)) missing.add(char);
  }
  return [...missing];
}

/** 全ての文字を筆の書体で表示できるか。 */
export function canUseFude(text: string): boolean {
  return missingFudeGlyphs(text).length === 0;
}
