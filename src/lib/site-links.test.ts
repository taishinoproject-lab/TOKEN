import { describe, expect, it } from "vitest";
import { footerLinks, footerLinkText } from "./site-links";

describe("footerLinkText", () => {
  it("URL が未設定なら（準備中）を付ける", () => {
    expect(footerLinkText({ label: "運営を応援したい方へ", url: null })).toBe("運営を応援したい方へ（準備中）");
  });

  it("URL があればそのままの文字にする", () => {
    expect(footerLinkText({ label: "運営を応援したい方へ", url: "https://example.com/" })).toBe("運営を応援したい方へ");
  });
});

describe("footerLinks", () => {
  it("URL は https で始まるか、未設定である", () => {
    for (const link of footerLinks) {
      if (link.url !== null) expect(link.url).toMatch(/^https:\/\//);
    }
  });
});
