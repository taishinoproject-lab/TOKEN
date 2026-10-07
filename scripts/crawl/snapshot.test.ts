import { describe, expect, it } from "vitest";
import { diffText, snapshotFileName } from "./snapshot.ts";

describe("snapshotFileName", () => {
  it("同じ URL からは同じ名前、異なる URL からは異なる名前になる", () => {
    const a = "https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8466";
    const b = "https://www.tnm.jp/modules/r_exhibition/index.php?controller=item&id=8467";
    expect(snapshotFileName(a)).toBe(snapshotFileName(a));
    expect(snapshotFileName(a)).not.toBe(snapshotFileName(b));
  });

  it("英数字・ピリオド・下線とハッシュだけからなる .txt の名前になる", () => {
    const name = snapshotFileName("https://www.atsutajingu.or.jp/houmotukan_kusanagi/kusanagi/");
    expect(name).toMatch(/^[A-Za-z0-9._]+-[0-9a-f]{8}\.txt$/);
    expect(name.startsWith("www.atsutajingu.or.jp_houmotukan_kusanagi_kusanagi-")).toBe(true);
  });

  it("長い URL でも名前の長さを抑える", () => {
    const name = snapshotFileName(`https://example.jp/${"a".repeat(300)}`);
    expect(name.length).toBeLessThanOrEqual(80 + 1 + 8 + 4);
  });
});

describe("diffText", () => {
  it("前回がなければ new", () => {
    expect(diffText(undefined, "a\nb\n")).toEqual({ status: "new", added: ["a", "b"], removed: [] });
  });

  it("同じなら unchanged", () => {
    expect(diffText("a\nb\n", "a\nb\n").status).toBe("unchanged");
  });

  it("増えた行と消えた行を返す（重複行も数える）", () => {
    const d = diffText("会期\n10月 刀剣展「西海道と南海道」\n太刀\n", "会期\n11月 刀剣展「村正」\n太刀\n太刀\n");
    expect(d.status).toBe("changed");
    expect(d.added).toEqual(["11月 刀剣展「村正」", "太刀"]);
    expect(d.removed).toEqual(["10月 刀剣展「西海道と南海道」"]);
  });

  it("並び替えだけでも changed とする", () => {
    expect(diffText("a\nb\n", "b\na\n")).toEqual({ status: "changed", added: [], removed: [] });
  });
});
