import { describe, expect, it } from "vitest";
import { sayaFont, sayaSize } from "./saya";

describe("sayaSize", () => {
  it("文字数で4段階に分ける（空白は数えない）", () => {
    expect(sayaSize("三日月宗近")).toBe("l");
    expect(sayaSize("津田遠江長光")).toBe("m");
    expect(sayaSize("太刀 銘 信濃守国広造")).toBe("s");
    expect(sayaSize("太刀 銘 備州長船盛光 応永十二年八月日")).toBe("xs");
  });
});

describe("sayaFont", () => {
  it("号は筆の書体、号でないものは明朝", () => {
    expect(sayaFont("三日月宗近", true)).toBe("fude");
    expect(sayaFont("太刀 銘 信房作", false)).toBe("mincho");
  });

  it("筆の書体に字形がない字を含む号は、全体を明朝にする", () => {
    expect(sayaFont("鎺切", true)).toBe("mincho");
  });
});
