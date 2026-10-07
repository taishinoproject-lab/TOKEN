import { describe, expect, it } from "vitest";
import { katakanaToHiragana, normalizeForSearch } from "./normalize";
import { KANJI_VARIANTS, toShinjitai } from "./kanji-variants";

describe("normalizeForSearch（data-model.md §10.2）", () => {
  it("全角・半角をそろえ、空白を除く", () => {
    expect(normalizeForSearch("　正宗 ")).toBe("正宗");
    expect(normalizeForSearch("太刀 銘 信房作")).toBe("太刀銘信房作");
    expect(normalizeForSearch("ＡＢＣ１２３")).toBe("abc123");
    expect(normalizeForSearch("ﾏｻﾑﾈ")).toBe("まさむね");
  });

  it("カタカナをひらがなにする", () => {
    expect(katakanaToHiragana("ホウチョウマサムネ")).toBe("ほうちょうまさむね");
    expect(normalizeForSearch("ヒゲキリ")).toBe("ひげきり");
    // 長音記号はそのまま
    expect(katakanaToHiragana("ソード")).toBe("そーど");
  });

  it("旧字体・異体字を新字体にする", () => {
    expect(normalizeForSearch("國廣")).toBe("国広");
    expect(normalizeForSearch("來國俊")).toBe("来国俊");
    expect(normalizeForSearch("眞")).toBe("真");
    expect(normalizeForSearch("與")).toBe("与");
    expect(normalizeForSearch("藏")).toBe("蔵");
    expect(normalizeForSearch("兒")).toBe("児");
    expect(normalizeForSearch("劍・釼・劔・剱")).toBe("剣・剣・剣・剣");
  });

  it("正規化は何度かけても結果が変わらない", () => {
    const text = "  來國俊　ヒゲキリ ＡＢＣ ";
    expect(normalizeForSearch(normalizeForSearch(text))).toBe(normalizeForSearch(text));
  });
});

describe("KANJI_VARIANTS", () => {
  it("1文字 → 1文字の対応で、変換先が再び変換されない", () => {
    for (const [from, to] of Object.entries(KANJI_VARIANTS)) {
      expect([...from]).toHaveLength(1);
      expect([...to]).toHaveLength(1);
      expect(from).not.toBe(to);
      expect(KANJI_VARIANTS[to]).toBeUndefined();
    }
  });

  it("NFKC 正規化で変わってしまう字を含まない（正規化の順序に依存しないため）", () => {
    for (const from of Object.keys(KANJI_VARIANTS)) {
      expect(from.normalize("NFKC")).toBe(from);
    }
  });

  it("toShinjitai は表にない字をそのまま残す", () => {
    expect(toShinjitai("正宗")).toBe("正宗");
  });
});
