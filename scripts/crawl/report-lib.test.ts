import { describe, expect, it } from "vitest";
import { AUTO_END, AUTO_START, buildAutoSection, changedFields, mergeReport } from "./report-lib.ts";

const before = [
  { id: "a", title: "秋季企画展", start_date: "2026-09-18", sources: [] },
  { id: "b", title: "削除される展覧会", sources: [] },
];
const after = [
  {
    id: "a",
    title: "秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」",
    start_date: "2026-09-18",
    sources: [{ url: "https://example.jp/s", quote: "令和8年9月18日～10月27日 秋季企画展" }],
  },
  { id: "c", title: "村正", sources: [{ url: "https://example.jp/k", quote: "令和8年10月28日～11月23日 村正" }] },
];

describe("changedFields", () => {
  it("sources 以外で値が変わった項目を返す", () => {
    expect(changedFields(before[0], after[0])).toEqual(["title"]);
  });
});

describe("buildAutoSection", () => {
  const md = buildAutoSection([{ file: "data/exhibitions.json", before, after }]);

  it("追加・変更・削除の件数と、根拠の引用・元URLを書く", () => {
    expect(md).toContain("追加 1件 / 変更 1件 / 削除 1件");
    expect(md).toContain("**c** 村正");
    expect(md).toContain("「令和8年10月28日～11月23日 村正」 — https://example.jp/k");
    expect(md).toContain("`title`: 秋季企画展 → 秋季企画展「館蔵 備前伝とゆかりの刀剣(仮称)」");
    expect(md).toContain("**b** 削除される展覧会");
  });

  it("自動生成の範囲を印で囲む", () => {
    expect(md.startsWith(AUTO_START)).toBe(true);
    expect(md.endsWith(AUTO_END)).toBe(true);
  });
});

describe("buildAutoSection（配列の項目）", () => {
  it("件数が同じでも内容が変われば、そう書く", () => {
    const md = buildAutoSection([
      {
        file: "data/exhibitions.json",
        before: [{ id: "x", exhibits: [{ label: "現代刀 お守り刀" }] }],
        after: [{ id: "x", exhibits: [{ label: "現代刀職が制作したお守り刀" }] }],
      },
    ]);
    expect(md).toContain("`exhibits`: 1件 → 1件（内容を変更）");
  });
});

describe("mergeReport", () => {
  it("初回は見出しと「要確認」の欄を付けて作る", () => {
    const out = mergeReport(undefined, `${AUTO_START}\n自動\n${AUTO_END}`, "# 報告");
    expect(out).toContain("# 報告");
    expect(out).toContain("## 要確認");
  });

  it("2回目以降は自動生成の部分だけを差し替え、手で書いた部分を残す", () => {
    const existing = `# 報告\n\n${AUTO_START}\n古い\n${AUTO_END}\n\n## 要確認\n\n- 手で書いたメモ\n`;
    const out = mergeReport(existing, `${AUTO_START}\n新しい\n${AUTO_END}`, "# 報告");
    expect(out).toContain("新しい");
    expect(out).not.toContain("古い");
    expect(out).toContain("- 手で書いたメモ");
  });
});
