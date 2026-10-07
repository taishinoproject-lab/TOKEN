// 巡回先の設定（crawl/targets.json）の型と読み込み。
import { readFileSync } from "node:fs";
import { z } from "zod";

export const targetSchema = z.strictObject({
  venue_id: z.string().regex(/^[a-z0-9-]+$/),
  url: z.url({ protocol: /^https?$/ }),
  type: z.enum(["html", "pdf", "json"]),
  note: z.string().optional(),
  /** 本文に必ず含まれるはずの文字列。含まれなければ、言語や構成の違うページが返ったとみなして error にする */
  expect_text: z.string().min(1).optional(),
});

export const crawlConfigSchema = z.strictObject({
  $comment: z.string().optional(),
  /** User-Agent。サービス名と連絡先URLを入れる */
  user_agent: z.string().min(1),
  /** リクエストの最小間隔（ミリ秒）。1000 未満は許さない */
  request_interval_ms: z.number().int().min(1000),
  /** 1館あたりの巡回ページ数の上限 */
  max_pages_per_venue: z.number().int().min(1).max(20),
  targets: z.array(targetSchema),
});

export type CrawlTarget = z.infer<typeof targetSchema>;
export type CrawlConfig = z.infer<typeof crawlConfigSchema>;

export function loadCrawlConfig(path: string): CrawlConfig {
  const raw: unknown = JSON.parse(readFileSync(path, "utf-8"));
  const config = crawlConfigSchema.parse(raw);
  const seen = new Set<string>();
  for (const t of config.targets) {
    if (seen.has(t.url)) throw new Error(`crawl/targets.json に同じ URL が2回あります: ${t.url}`);
    seen.add(t.url);
  }
  return config;
}
