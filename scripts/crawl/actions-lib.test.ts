import { describe, expect, it } from "vitest";
import {
  MAX_BODY_LENGTH,
  buildCommitMessage,
  buildNoChangeSummary,
  buildPrBody,
  buildPrTitle,
  crawlBranchName,
  hasChanges,
} from "./actions-lib.ts";
import type { ChangesReport, PageResult } from "./crawl.ts";

function report(pages: PageResult[]): ChangesReport {
  const summary = { new: 0, changed: 0, unchanged: 0, error: 0, skipped: 0 };
  for (const p of pages) summary[p.status]++;
  return {
    date: "2026-10-12",
    generated_at: "2026-10-11T23:50:00.000Z",
    user_agent: "TOKEN-crawler/0.1",
    summary,
    changed_venues: [...new Set(pages.filter((p) => p.status === "new" || p.status === "changed").map((p) => p.venue_id))],
    robots: [],
    pages,
  };
}

const unchanged: PageResult = { venue_id: "tnm", url: "https://www.tnm.jp/a", type: "html", status: "unchanged", file: "tnm/a.txt" };
const changed: PageResult = {
  venue_id: "atsuta-jingu",
  url: "https://www.atsutajingu.or.jp/k",
  type: "html",
  status: "changed",
  file: "atsuta-jingu/k.txt",
  added: ["11月 刀剣展「村正」"],
  removed: ["10月 刀剣展「西海道と南海道」"],
  added_count: 1,
  removed_count: 1,
};
const failed: PageResult = { venue_id: "tnm", url: "https://www.tnm.jp/b", type: "json", status: "error", reason: "HTTP 503" };
const names = { tnm: "東京国立博物館", "atsuta-jingu": "熱田神宮" };

describe("hasChanges", () => {
  it("すべて unchanged なら false（取得日だけの更新は変化に含めない）", () => {
    expect(hasChanges(report([unchanged]))).toBe(false);
  });

  it("失敗・見送りだけでも false", () => {
    expect(hasChanges(report([unchanged, failed, { ...unchanged, status: "skipped", reason: "robots.txt で禁止されています" }]))).toBe(false);
  });

  it("new または changed が1つでもあれば true", () => {
    expect(hasChanges(report([unchanged, changed]))).toBe(true);
    expect(hasChanges(report([{ ...unchanged, status: "new" }]))).toBe(true);
  });
});

describe("crawlBranchName", () => {
  it("crawl/YYYY-MM-DD。同じ名前のブランチがあれば末尾に付け足す", () => {
    expect(crawlBranchName(report([changed]), false, "123")).toBe("crawl/2026-10-12");
    expect(crawlBranchName(report([changed]), true, "123")).toBe("crawl/2026-10-12-123");
  });
});

describe("題名とコミットメッセージ", () => {
  it("日付と変化のあった館名を入れる", () => {
    const r = report([changed, { ...unchanged, status: "new" }]);
    expect(buildPrTitle(r, names)).toBe("巡回 2026-10-12：公式ページの変化（熱田神宮・東京国立博物館）");
    expect(buildCommitMessage(r, names)).toBe("data: 巡回 2026-10-12 のスナップショット（熱田神宮・東京国立博物館）");
  });

  it("館名が分からなければ ID を使う", () => {
    expect(buildPrTitle(report([changed]))).toBe("巡回 2026-10-12：公式ページの変化（atsuta-jingu）");
  });
});

describe("buildPrBody", () => {
  const body = buildPrBody(report([unchanged, changed, failed]), {
    branch: "crawl/2026-10-12",
    runUrl: "https://github.com/o/r/actions/runs/1",
    venueNames: names,
  });

  it("変化のあった館とページ、差分の一部を載せる", () => {
    expect(body).toContain("#### 熱田神宮（`atsuta-jingu`）");
    expect(body).toContain("- 変化あり：増えた行 1・消えた行 1 <https://www.atsutajingu.or.jp/k>（`crawl/snapshots/atsuta-jingu/k.txt`）");
    expect(body).toContain("11月 刀剣展「村正」");
    expect(body).not.toContain("https://www.tnm.jp/a");
  });

  it("失敗したページを一覧にする", () => {
    expect(body).toContain("- 東京国立博物館（`tnm`） <https://www.tnm.jp/b>：HTTP 503");
  });

  it("次の作業の案内と実行ログを載せる", () => {
    expect(body).toContain("次の作業：docs/crawler-runbook.md に従って抽出し、このブランチ（`crawl/2026-10-12`）に push する");
    expect(body).toContain("実行ログ: https://github.com/o/r/actions/runs/1");
  });

  it("失敗がなければ「なし」と書く", () => {
    const b = buildPrBody(report([changed]), { branch: "crawl/2026-10-12" });
    expect(b).toMatch(/### 取得に失敗したページ\n\nなし/);
  });

  it("差分の行の ``` は、コードブロックを壊さないように置き換える", () => {
    const b = buildPrBody(report([{ ...changed, added: ["```js"], added_count: 1 }]), { branch: "x" });
    expect(b).not.toContain("  ```js");
  });

  it("長すぎる場合は差分の行を省いて上限に収める", () => {
    const many = Array.from({ length: 200 }, (_, i) => `${"刀".repeat(190)}${i}`);
    const pages = Array.from({ length: 10 }, (_, i) => ({
      ...changed,
      url: `https://www.atsutajingu.or.jp/${i}`,
      added: many,
      added_count: many.length,
    }));
    const b = buildPrBody(report(pages), { branch: "x", maxDiffLines: 200 });
    expect(b.length).toBeLessThanOrEqual(MAX_BODY_LENGTH);
    expect(b).not.toContain("<details>");
    expect(b).toContain("https://www.atsutajingu.or.jp/9");
  });
});

describe("buildNoChangeSummary", () => {
  it("変化なしと、失敗したページを書く", () => {
    const s = buildNoChangeSummary(report([unchanged, failed]), names);
    expect(s).toContain("変化なし");
    expect(s).toContain("<https://www.tnm.jp/b>：HTTP 503");
  });
});
