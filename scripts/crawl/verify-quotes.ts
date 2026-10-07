// sources[].quote の照合（T-302、data-model.md §8）。
// 引用が、出典URLのスナップショット（crawl/snapshots/）の本文に実在するかを調べる。
import type { Manifest } from "./snapshot.ts";
import { containsQuote, normalizeForMatch } from "./text.ts";

export const MIN_QUOTE_LENGTH = 6;

export interface QuoteIssue {
  file: string;
  id: string;
  url: string;
  quote?: string;
  message: string;
}

export interface QuoteCheckResult {
  checked: number;
  errors: QuoteIssue[];
  warnings: QuoteIssue[];
}

interface SourceLike {
  url?: unknown;
  quote?: unknown;
}

interface RecordLike {
  id?: unknown;
  venue_id?: unknown;
  confidence?: unknown;
  sources?: unknown;
}

export interface DataFileInput {
  /** "exhibitions.json" など */
  file: string;
  records: unknown;
}

export interface VerifyOptions {
  /** 自動収集の対象館。これらの館の confirmed の展覧会に引用がなければ警告する */
  crawledVenueIds?: string[];
}

export function verifyQuotes(
  files: DataFileInput[],
  manifest: Manifest,
  readSnapshot: (file: string) => string | undefined,
  options: VerifyOptions = {},
): QuoteCheckResult {
  const result: QuoteCheckResult = { checked: 0, errors: [], warnings: [] };
  const byUrl = new Map(manifest.entries.map((e) => [e.url, e]));
  const textCache = new Map<string, string | undefined>();
  const crawled = new Set(options.crawledVenueIds ?? []);

  const textOf = (file: string) => {
    if (!textCache.has(file)) textCache.set(file, readSnapshot(file));
    return textCache.get(file);
  };

  for (const { file, records } of files) {
    if (!Array.isArray(records)) continue;
    for (const raw of records as RecordLike[]) {
      const id = typeof raw.id === "string" ? raw.id : "(id なし)";
      const sources = Array.isArray(raw.sources) ? (raw.sources as SourceLike[]) : [];
      let quoted = 0;

      for (const source of sources) {
        if (typeof source.quote !== "string") continue;
        const url = typeof source.url === "string" ? source.url : "";
        const quote = source.quote;
        const issue = { file, id, url, quote };
        result.checked++;
        quoted++;

        if (normalizeForMatch(quote).length < MIN_QUOTE_LENGTH) {
          result.errors.push({ ...issue, message: `引用が短すぎます（空白を除いて${MIN_QUOTE_LENGTH}文字以上にしてください）` });
          continue;
        }
        const entry = byUrl.get(url);
        if (!entry) {
          result.errors.push({ ...issue, message: "この URL のスナップショットがありません（crawl/targets.json に登録して crawl:fetch を実行してください）" });
          continue;
        }
        const text = textOf(entry.file);
        if (text === undefined) {
          result.errors.push({ ...issue, message: `スナップショットのファイルがありません: crawl/snapshots/${entry.file}` });
          continue;
        }
        if (!containsQuote(text, quote)) {
          result.errors.push({ ...issue, message: `引用が本文に見つかりません（crawl/snapshots/${entry.file}）` });
        }
      }

      if (
        file === "exhibitions.json" &&
        typeof raw.venue_id === "string" &&
        crawled.has(raw.venue_id) &&
        raw.confidence === "confirmed" &&
        quoted === 0
      ) {
        result.warnings.push({ file, id, url: "", message: "自動収集の対象館の展覧会ですが、照合できる引用（quote）がありません" });
      }
    }
  }
  return result;
}

export function formatQuoteIssue(issue: QuoteIssue): string {
  const lines = [`  - ${issue.file} ${issue.id}: ${issue.message}`];
  if (issue.url) lines.push(`      URL: ${issue.url}`);
  if (issue.quote !== undefined) lines.push(`      引用: ${issue.quote}`);
  return lines.join("\n");
}
