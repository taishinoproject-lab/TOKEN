// npm run crawl:verify [-- <データのディレクトリ> <スナップショットのディレクトリ>]
// data/*.json の sources[].quote が、crawl/snapshots/ の本文に実在するかを照合する。
// 照合できない引用が1件でもあれば、終了コード 1 で終わる。ネットワークには接続しない。
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { readManifest } from "./crawl.ts";
import { loadCrawlConfig } from "./targets.ts";
import { formatQuoteIssue, verifyQuotes } from "./verify-quotes.ts";

const root = resolve(import.meta.dirname, "..", "..");
const dataDir = process.argv[2] ? resolve(process.argv[2]) : resolve(root, "data");
const snapshotDir = process.argv[3] ? resolve(process.argv[3]) : resolve(root, "crawl", "snapshots");

const files = ["exhibitions.json", "venues.json", "smiths.json", "swords.json"].map((file) => ({
  file,
  records: JSON.parse(readFileSync(resolve(dataDir, file), "utf-8")) as unknown,
}));

const config = loadCrawlConfig(resolve(root, "crawl", "targets.json"));
const result = verifyQuotes(
  files,
  readManifest(snapshotDir),
  (file) => {
    const path = resolve(snapshotDir, file);
    return existsSync(path) ? readFileSync(path, "utf-8") : undefined;
  },
  { crawledVenueIds: [...new Set(config.targets.map((t) => t.venue_id))] },
);

console.log(`引用の照合: ${result.checked}件`);
if (result.warnings.length > 0) {
  console.warn(`\n⚠ 警告 ${result.warnings.length}件`);
  for (const w of result.warnings) console.warn(formatQuoteIssue(w));
}
if (result.errors.length > 0) {
  console.error(`\n✖ 照合できない引用 ${result.errors.length}件`);
  for (const e of result.errors) console.error(formatQuoteIssue(e));
  console.error("\n照合できない項目は採用しないでください（docs/crawler-runbook.md）。");
  process.exit(1);
}
console.log(`\n✔ すべての引用を本文で確認しました（警告 ${result.warnings.length}件）`);
