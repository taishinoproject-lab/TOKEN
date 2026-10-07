import { describe, expect, it } from "vitest";
import { canUseFude, hasFudeGlyph, missingFudeGlyphs } from "./fude";
import { FUDE_ASTRAL_CODE_POINTS, FUDE_GLYPH_COUNT } from "./fude-glyphs.generated";

describe("筆の書体の字形の判定", () => {
  it("生成した字形の一覧が読み込める", () => {
    expect(FUDE_GLYPH_COUNT).toBeGreaterThan(7000);
  });

  it("号でよく使う字と旧字体には字形がある", () => {
    for (const char of "三日月宗近國廣藏眞與髙") expect(hasFudeGlyph(char)).toBe(true);
    expect(canUseFude("童子切安綱")).toBe(true);
  });

  it("字形がない字を一覧にする（重複なし）", () => {
    // 「鎺（はばき）」は Yuji Syuku に字形がない
    expect(hasFudeGlyph("鎺")).toBe(false);
    expect(missingFudeGlyphs("鎺鎺切")).toEqual(["鎺"]);
    expect(canUseFude("鎺切")).toBe(false);
  });

  it("空白は数えない", () => {
    expect(missingFudeGlyphs("三日月　宗近 ")).toEqual([]);
  });

  it("基本多言語面以外の字も判定できる", () => {
    for (const cp of FUDE_ASTRAL_CODE_POINTS) expect(hasFudeGlyph(String.fromCodePoint(cp))).toBe(true);
    expect(hasFudeGlyph("😀")).toBe(false);
  });
});
