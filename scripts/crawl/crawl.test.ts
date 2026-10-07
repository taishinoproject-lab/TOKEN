// 巡回の本体を、偽の fetch で動かす（ネットワークには接続しない）。
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decodeHtml, readManifest, runCrawl, type CrawlDeps } from "./crawl.ts";
import type { CrawlConfig } from "./targets.ts";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "token-crawl-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

type Pages = Record<string, { status?: number; body: string | Uint8Array; contentType?: string }>;

function fakeDeps(pages: Pages) {
  let clock = Date.parse("2026-10-07T00:00:00Z");
  const requested: string[] = [];
  const sleeps: number[] = [];
  const headersSeen: Record<string, string>[] = [];
  const deps: CrawlDeps = {
    fetch: (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      requested.push(url);
      headersSeen.push(init?.headers as Record<string, string>);
      const page = pages[url];
      if (!page) return new Response("not found", { status: 404 });
      return new Response(page.body as BodyInit, {
        status: page.status ?? 200,
        headers: { "content-type": page.contentType ?? "text/html; charset=utf-8" },
      });
    }) as typeof fetch,
    sleep: async (ms) => {
      sleeps.push(ms);
      clock += ms;
    },
    now: () => new Date(clock),
    pdfToText: async (data) => `PDF ${data.length}バイト\n出品目録`,
    log: () => {},
  };
  return { deps, requested, sleeps, headersSeen, advance: (ms: number) => (clock += ms) };
}

function config(targets: CrawlConfig["targets"], extra: Partial<CrawlConfig> = {}): CrawlConfig {
  return {
    user_agent: "TOKEN-crawler/0.1 (+https://example.jp)",
    request_interval_ms: 1500,
    max_pages_per_venue: 5,
    targets,
    ...extra,
  };
}

const A = "https://museum.example.jp/exhibition/";
const B = "https://museum.example.jp/list.pdf";

describe("runCrawl", () => {
  it("初回は new、同じ内容なら unchanged、内容が変われば changed になり、差分の行を返す", async () => {
    const pages: Pages = {
      "https://museum.example.jp/robots.txt": { body: "User-agent: *\nDisallow: /admin/\n", contentType: "text/plain" },
      [A]: { body: "<h1>展示</h1><p>10月 刀剣展「西海道と南海道」</p>" },
      [B]: { body: new Uint8Array([1, 2, 3]), contentType: "application/pdf" },
    };
    const cfg = config([
      { venue_id: "museum", url: A, type: "html" },
      { venue_id: "museum", url: B, type: "pdf" },
    ]);

    const first = await runCrawl({ config: cfg, snapshotDir: dir }, fakeDeps(pages).deps);
    expect(first.pages.map((p) => p.status)).toEqual(["new", "new"]);
    expect(first.changed_venues).toEqual(["museum"]);
    const manifest = readManifest(dir);
    expect(manifest.entries).toHaveLength(2);
    const htmlEntry = manifest.entries.find((e) => e.url === A);
    expect(readFileSync(join(dir, htmlEntry?.file ?? ""), "utf-8")).toBe("展示\n10月 刀剣展「西海道と南海道」\n");
    const pdfEntry = manifest.entries.find((e) => e.url === B);
    expect(readFileSync(join(dir, pdfEntry?.file ?? ""), "utf-8")).toBe("PDF 3バイト\n出品目録\n");

    const second = await runCrawl({ config: cfg, snapshotDir: dir }, fakeDeps(pages).deps);
    expect(second.pages.map((p) => p.status)).toEqual(["unchanged", "unchanged"]);
    expect(second.changed_venues).toEqual([]);

    pages[A] = { body: "<h1>展示</h1><p>11月 刀剣展「村正」</p>" };
    const third = await runCrawl({ config: cfg, snapshotDir: dir }, fakeDeps(pages).deps);
    expect(third.pages[0]).toMatchObject({
      status: "changed",
      added: ["11月 刀剣展「村正」"],
      removed: ["10月 刀剣展「西海道と南海道」"],
    });
    expect(third.summary).toMatchObject({ changed: 1, unchanged: 1 });
  });

  it("robots.txt で禁止されたページは取得しない", async () => {
    const pages: Pages = {
      "https://museum.example.jp/robots.txt": { body: "User-agent: *\nDisallow: /exhibition/\n" },
      [A]: { body: "<p>x</p>" },
    };
    const { deps, requested } = fakeDeps(pages);
    const report = await runCrawl({ config: config([{ venue_id: "museum", url: A, type: "html" }]), snapshotDir: dir }, deps);
    expect(report.pages[0]).toMatchObject({ status: "skipped", reason: "robots.txt で禁止されています" });
    expect(requested).toEqual(["https://museum.example.jp/robots.txt"]);
  });

  it("robots.txt が 5xx のときは、その館のページを取得しない", async () => {
    const pages: Pages = {
      "https://museum.example.jp/robots.txt": { status: 503, body: "" },
      [A]: { body: "<p>x</p>" },
    };
    const { deps, requested } = fakeDeps(pages);
    const report = await runCrawl({ config: config([{ venue_id: "museum", url: A, type: "html" }]), snapshotDir: dir }, deps);
    expect(report.pages[0].status).toBe("skipped");
    expect(requested).not.toContain(A);
  });

  it("robots.txt は館（オリジン）ごとに1回だけ取得し、User-Agent を付ける", async () => {
    const pages: Pages = { [A]: { body: "<p>a</p>" }, [B]: { body: new Uint8Array([1]) } };
    const { deps, requested, headersSeen } = fakeDeps(pages);
    await runCrawl(
      {
        config: config([
          { venue_id: "museum", url: A, type: "html" },
          { venue_id: "museum", url: B, type: "pdf" },
        ]),
        snapshotDir: dir,
      },
      deps,
    );
    expect(requested.filter((u) => u.endsWith("/robots.txt"))).toHaveLength(1);
    expect(headersSeen.every((h) => h["User-Agent"] === "TOKEN-crawler/0.1 (+https://example.jp)")).toBe(true);
  });

  it("リクエストの間隔を空ける（robots.txt の Crawl-delay が長ければそれに従う）", async () => {
    const pages: Pages = {
      "https://museum.example.jp/robots.txt": { body: "User-agent: *\nCrawl-delay: 3\n" },
      [A]: { body: "<p>a</p>" },
      [B]: { body: new Uint8Array([1]) },
    };
    const { deps, sleeps } = fakeDeps(pages);
    await runCrawl(
      {
        config: config([
          { venue_id: "museum", url: A, type: "html" },
          { venue_id: "museum", url: B, type: "pdf" },
        ]),
        snapshotDir: dir,
      },
      deps,
    );
    // robots.txt → A（Crawl-delay 3秒）→ B（3秒）
    expect(sleeps).toEqual([3000, 3000]);
  });

  it("取得に失敗したページは error とし、前回のスナップショットを残す", async () => {
    const pages: Pages = { [A]: { body: "<p>前回の本文</p>" } };
    await runCrawl({ config: config([{ venue_id: "museum", url: A, type: "html" }]), snapshotDir: dir }, fakeDeps(pages).deps);
    pages[A] = { status: 500, body: "error" };
    const report = await runCrawl(
      { config: config([{ venue_id: "museum", url: A, type: "html" }]), snapshotDir: dir },
      fakeDeps(pages).deps,
    );
    expect(report.pages[0]).toMatchObject({ status: "error", reason: "HTTP 500" });
    const entry = readManifest(dir).entries[0];
    expect(readFileSync(join(dir, entry.file), "utf-8")).toBe("前回の本文\n");
  });

  it("expect_text が本文になければ error にし、前回のスナップショットを書き換えない", async () => {
    const target = { venue_id: "museum", url: A, type: "html" as const, expect_text: "観覧料" };
    const pages: Pages = { [A]: { body: "<title>料金</title><p>東博コレクション展 観覧料 一般 1,000円</p>" } };
    await runCrawl({ config: config([target]), snapshotDir: dir }, fakeDeps(pages).deps);
    pages[A] = { body: "<title>票价</title><p>东京国立博物馆</p>" };
    const report = await runCrawl({ config: config([target]), snapshotDir: dir }, fakeDeps(pages).deps);
    expect(report.pages[0].status).toBe("error");
    expect(report.pages[0].reason).toContain("観覧料");
    const entry = readManifest(dir).entries[0];
    expect(readFileSync(join(dir, entry.file), "utf-8")).toContain("観覧料");
  });

  it("本文が空のページは error にする", async () => {
    const pages: Pages = { [A]: { body: "<div id='app'></div><script>render()</script>" } };
    const report = await runCrawl({ config: config([{ venue_id: "museum", url: A, type: "html" }]), snapshotDir: dir }, fakeDeps(pages).deps);
    expect(report.pages[0].status).toBe("error");
  });

  it("1館あたりの上限を超えたページは取得しない", async () => {
    const urls = [1, 2, 3].map((n) => `https://museum.example.jp/p${n}.html`);
    const pages: Pages = Object.fromEntries(urls.map((u) => [u, { body: `<p>${u}</p>` }]));
    const report = await runCrawl(
      {
        config: config(
          urls.map((url) => ({ venue_id: "museum", url, type: "html" as const })),
          { max_pages_per_venue: 2 },
        ),
        snapshotDir: dir,
      },
      fakeDeps(pages).deps,
    );
    expect(report.pages.map((p) => p.status)).toEqual(["new", "new", "skipped"]);
  });

  it("--venue で指定した館だけを巡回する", async () => {
    const other = "https://other.example.jp/";
    const pages: Pages = { [A]: { body: "<p>a</p>" }, [other]: { body: "<p>b</p>" } };
    const { deps, requested } = fakeDeps(pages);
    const report = await runCrawl(
      {
        config: config([
          { venue_id: "museum", url: A, type: "html" },
          { venue_id: "other", url: other, type: "html" },
        ]),
        snapshotDir: dir,
        venueIds: ["other"],
      },
      deps,
    );
    expect(report.pages.map((p) => p.venue_id)).toEqual(["other"]);
    expect(requested).not.toContain(A);
  });

  it("JSON は「キー: 値」の行にして保存する", async () => {
    const url = "https://museum.example.jp/data/schedule.json";
    const pages: Pages = { [url]: { body: '﻿[{"name":"太刀（名物 三日月宗近）","room":"本館3室"}]', contentType: "application/json" } };
    await runCrawl({ config: config([{ venue_id: "museum", url, type: "json" }]), snapshotDir: dir }, fakeDeps(pages).deps);
    const entry = readManifest(dir).entries[0];
    expect(readFileSync(join(dir, entry.file), "utf-8")).toBe("---\nname: 太刀（名物 三日月宗近）\nroom: 本館3室\n");
  });
});

describe("decodeHtml", () => {
  it("Content-Type の charset に従う", () => {
    const sjis = new Uint8Array([0x93, 0x81, 0x8c, 0x95]); // 「刀剣」の Shift_JIS
    expect(decodeHtml(sjis, "text/html; charset=Shift_JIS")).toBe("刀剣");
  });

  it("ヘッダーになければ meta 要素の charset に従い、どちらもなければ UTF-8", () => {
    const head = new TextEncoder().encode('<meta charset="shift_jis">');
    const bytes = new Uint8Array([...head, 0x93, 0x81, 0x8c, 0x95]);
    expect(decodeHtml(bytes, "text/html")).toBe('<meta charset="shift_jis">刀剣');
    expect(decodeHtml(new TextEncoder().encode("刀剣"), null)).toBe("刀剣");
  });
});
