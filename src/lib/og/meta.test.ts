import { describe, expect, it } from "vitest";
import { cssUrl, uniqueChars } from "./fonts";
import { ogImagePath, ogPage, ogUrls } from "./meta";

describe("ogImagePath", () => {
  it("刀剣・刀匠・展覧会のページだけに画像がある", () => {
    expect(ogImagePath("/swords/mikazuki-munechika")).toBe("/og/swords/mikazuki-munechika.png");
    expect(ogImagePath("/smiths/masamune/")).toBe("/og/smiths/masamune.png");
    expect(ogImagePath("/exhibitions/2026-tnm-honkan-13-0804")).toBe("/og/exhibitions/2026-tnm-honkan-13-0804.png");
    expect(ogImagePath("/")).toBeNull();
    expect(ogImagePath("/venues/tnm")).toBeNull();
    expect(ogImagePath("/swords/mikazuki-munechika.ics")).toBeNull();
    expect(ogPage("/map")).toBeNull();
  });
});

describe("ogUrls", () => {
  it("公開先があれば、絶対URLにする", () => {
    expect(ogUrls("/swords/okanehira", new URL("https://token.example.jp"))).toEqual({
      url: "https://token.example.jp/swords/okanehira",
      image: "https://token.example.jp/og/swords/okanehira.png",
    });
    expect(ogUrls("/about", new URL("https://token.example.jp"))).toEqual({
      url: "https://token.example.jp/about",
      image: null,
    });
  });

  it("公開先が未設定なら、og:url は入れず、画像はサイト内のパス", () => {
    expect(ogUrls("/swords/okanehira", undefined)).toEqual({ url: null, image: "/og/swords/okanehira.png" });
  });
});

describe("書体の取得", () => {
  it("文字は重複を除いて並びを固定し、空白を必ず含める", () => {
    expect(uniqueChars("宗近\n三日月宗")).toBe(uniqueChars("三日月宗近"));
    expect(uniqueChars("刀")).toContain(" ");
    expect(uniqueChars("刀")).toContain("　");
  });

  it("Google Fonts の CSS API の URL に、太さと文字を入れる", () => {
    expect(cssUrl({ name: "mincho", family: "Shippori Mincho", weight: 800 }, "刀")).toBe(
      "https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@800&text=%E5%88%80",
    );
  });
});
