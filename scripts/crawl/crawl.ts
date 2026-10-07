// 巡回の本体（T-301）。ネットワークとファイルの読み書きを引数で差し替えられるようにして、
// 単体テストではネットワークに接続せずに動かす。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { todayJst } from "../../src/lib/date.ts";
import { isAllowed, policyFromResponse, type RobotsPolicy } from "./robots.ts";
import { diffText, sha256, snapshotFileName, type Manifest, type ManifestEntry } from "./snapshot.ts";
import type { CrawlConfig, CrawlTarget } from "./targets.ts";
import { containsQuote, htmlToText, jsonToText, tidyText } from "./text.ts";

export type PageStatus = "new" | "changed" | "unchanged" | "error" | "skipped";

export interface PageResult {
  venue_id: string;
  url: string;
  type: CrawlTarget["type"];
  status: PageStatus;
  /** crawl/snapshots/ からの相対パス */
  file?: string;
  /** error / skipped の理由 */
  reason?: string;
  /** 前回から増えた行・消えた行（多い場合は先頭だけ） */
  added?: string[];
  removed?: string[];
  added_count?: number;
  removed_count?: number;
}

export interface ChangesReport {
  date: string;
  generated_at: string;
  user_agent: string;
  summary: Record<PageStatus, number>;
  /** 本文が新規・変化したページのある館 */
  changed_venues: string[];
  robots: { origin: string; status: string }[];
  pages: PageResult[];
}

export interface CrawlDeps {
  fetch: typeof fetch;
  sleep: (ms: number) => Promise<void>;
  now: () => Date;
  /** PDF のバイト列から本文テキストを取り出す */
  pdfToText: (data: Uint8Array) => Promise<string>;
  log: (message: string) => void;
}

export interface CrawlOptions {
  config: CrawlConfig;
  /** crawl/snapshots/ の絶対パス */
  snapshotDir: string;
  /** 指定した館だけを巡回する（省略時はすべて） */
  venueIds?: string[];
}

const MAX_LISTED_LINES = 200;
const FETCH_TIMEOUT_MS = 30_000;
/** 通信エラー・タイムアウト・5xx・429 のときの試行回数（初回を含む） */
const MAX_ATTEMPTS = 2;
/** 再試行の前に空ける時間 */
const RETRY_DELAY_MS = 10_000;

export function manifestPath(snapshotDir: string): string {
  return join(snapshotDir, "manifest.json");
}

export function readManifest(snapshotDir: string): Manifest {
  const path = manifestPath(snapshotDir);
  if (!existsSync(path)) return { entries: [] };
  return JSON.parse(readFileSync(path, "utf-8")) as Manifest;
}

function writeManifest(snapshotDir: string, manifest: Manifest): void {
  const entries = [...manifest.entries].sort((a, b) =>
    a.venue_id === b.venue_id ? a.url.localeCompare(b.url) : a.venue_id.localeCompare(b.venue_id),
  );
  writeFileSync(manifestPath(snapshotDir), `${JSON.stringify({ entries }, null, 2)}\n`);
}

/** Content-Type ヘッダーと meta 要素から文字コードを決めて、HTML を文字列にする。 */
export function decodeHtml(bytes: Uint8Array, contentType: string | null): string {
  const fromHeader = /charset=["']?([\w-]+)/i.exec(contentType ?? "")?.[1];
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, 4096));
  const fromMeta = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1];
  const label = (fromHeader ?? fromMeta ?? "utf-8").toLowerCase();
  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

class Throttle {
  private last = 0;
  constructor(
    private readonly deps: Pick<CrawlDeps, "sleep" | "now">,
    private readonly minIntervalMs: number,
  ) {}

  async wait(extraDelayMs = 0): Promise<void> {
    const interval = Math.max(this.minIntervalMs, extraDelayMs);
    const elapsed = this.deps.now().getTime() - this.last;
    if (this.last > 0 && elapsed < interval) await this.deps.sleep(interval - elapsed);
    this.last = this.deps.now().getTime();
  }
}

export async function runCrawl(options: CrawlOptions, deps: CrawlDeps): Promise<ChangesReport> {
  const { config, snapshotDir } = options;
  const today = todayJst(deps.now());
  const manifest = readManifest(snapshotDir);
  const throttle = new Throttle(deps, config.request_interval_ms);
  const robotsCache = new Map<string, RobotsPolicy>();
  const robotsStatus: { origin: string; status: string }[] = [];
  const pages: PageResult[] = [];
  const headers = { "User-Agent": config.user_agent, "Accept-Language": "ja" };

  async function getOnce(url: string, extraDelayMs: number): Promise<Response> {
    await throttle.wait(extraDelayMs);
    return deps.fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  }

  /** 一時的な失敗（通信エラー・タイムアウト・5xx・429）のときだけ、間隔を空けて1回だけやり直す。 */
  async function get(url: string, extraDelayMs = 0): Promise<Response> {
    for (let attempt = 1; ; attempt++) {
      const delay = attempt === 1 ? extraDelayMs : Math.max(extraDelayMs, RETRY_DELAY_MS);
      try {
        const res = await getOnce(url, delay);
        if (attempt < MAX_ATTEMPTS && (res.status >= 500 || res.status === 429)) {
          deps.log(`  HTTP ${res.status} のため、やり直します: ${url}`);
          await res.body?.cancel();
          continue;
        }
        return res;
      } catch (error) {
        if (attempt >= MAX_ATTEMPTS) throw error;
        deps.log(`  ${(error as Error).message} のため、やり直します: ${url}`);
      }
    }
  }

  async function robotsFor(origin: string): Promise<RobotsPolicy> {
    const cached = robotsCache.get(origin);
    if (cached) return cached;
    let status: number | undefined;
    let body = "";
    try {
      const res = await get(`${origin}/robots.txt`);
      status = res.status;
      body = await res.text();
    } catch (error) {
      deps.log(`  robots.txt を取得できませんでした（${origin}）: ${(error as Error).message}`);
    }
    const policy = policyFromResponse(status, body, config.user_agent);
    robotsCache.set(origin, policy);
    robotsStatus.push({
      origin,
      status:
        status === undefined
          ? "取得失敗（巡回を見送り）"
          : status >= 200 && status < 300
            ? `HTTP ${status}（規則 ${policy.rules.length}件${policy.crawlDelaySeconds !== undefined ? `、Crawl-delay ${policy.crawlDelaySeconds}秒` : ""}）`
            : status >= 400 && status < 500
              ? `HTTP ${status}（robots.txt なし：すべて許可として扱う）`
              : `HTTP ${status}（巡回を見送り）`,
    });
    return policy;
  }

  const selected = config.targets.filter((t) => !options.venueIds || options.venueIds.includes(t.venue_id));
  const perVenue = new Map<string, number>();

  for (const target of selected) {
    const count = (perVenue.get(target.venue_id) ?? 0) + 1;
    perVenue.set(target.venue_id, count);
    const base: PageResult = { venue_id: target.venue_id, url: target.url, type: target.type, status: "skipped" };

    if (count > config.max_pages_per_venue) {
      pages.push({ ...base, reason: `1館あたりの上限（${config.max_pages_per_venue}ページ）を超えています` });
      continue;
    }

    const url = new URL(target.url);
    const policy = await robotsFor(url.origin);
    if (!isAllowed(policy, `${url.pathname}${url.search}`)) {
      pages.push({ ...base, reason: "robots.txt で禁止されています" });
      continue;
    }

    deps.log(`取得: ${target.url}`);
    let text: string;
    try {
      const res = await get(target.url, (policy.crawlDelaySeconds ?? 0) * 1000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      text =
        target.type === "pdf"
          ? tidyText(await deps.pdfToText(bytes))
          : target.type === "json"
            ? jsonToText(JSON.parse(new TextDecoder("utf-8").decode(bytes)))
            : htmlToText(decodeHtml(bytes, res.headers.get("content-type")));
      if (text.trim().length === 0) throw new Error("本文が空です（JavaScript で描画しているページの可能性があります）");
      if (target.expect_text && !containsQuote(text, target.expect_text)) {
        throw new Error(`本文に「${target.expect_text}」がありません（別の言語や構成のページが返った可能性があります）`);
      }
    } catch (error) {
      pages.push({ ...base, status: "error", reason: (error as Error).message });
      continue;
    }

    const file = `${target.venue_id}/${snapshotFileName(target.url)}`;
    const absPath = join(snapshotDir, file);
    const previous = existsSync(absPath) ? readFileSync(absPath, "utf-8") : undefined;
    const diff = diffText(previous, text);
    if (diff.status !== "unchanged") {
      mkdirSync(dirname(absPath), { recursive: true });
      writeFileSync(absPath, text);
    }

    const old = manifest.entries.find((e) => e.url === target.url);
    const entry: ManifestEntry = {
      venue_id: target.venue_id,
      url: target.url,
      type: target.type,
      file,
      changed_at: diff.status === "unchanged" && old ? old.changed_at : today,
      fetched_at: today,
      sha256: sha256(text),
    };
    manifest.entries = manifest.entries.filter((e) => e.url !== target.url).concat(entry);

    pages.push({
      ...base,
      status: diff.status,
      file,
      ...(diff.status === "unchanged"
        ? {}
        : {
            added: diff.added.slice(0, MAX_LISTED_LINES),
            removed: diff.removed.slice(0, MAX_LISTED_LINES),
            added_count: diff.added.length,
            removed_count: diff.removed.length,
          }),
    });
  }

  writeManifest(snapshotDir, manifest);

  const summary: Record<PageStatus, number> = { new: 0, changed: 0, unchanged: 0, error: 0, skipped: 0 };
  for (const p of pages) summary[p.status]++;
  const changedVenues = [...new Set(pages.filter((p) => p.status === "new" || p.status === "changed").map((p) => p.venue_id))];

  return {
    date: today,
    generated_at: deps.now().toISOString(),
    user_agent: config.user_agent,
    summary,
    changed_venues: changedVenues,
    robots: robotsStatus,
    pages,
  };
}
