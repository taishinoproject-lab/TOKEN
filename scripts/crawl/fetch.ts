// npm run crawl:fetch [-- --venue <館ID> ...]
// crawl/targets.json の巡回先を取得し、本文テキストを crawl/snapshots/ に保存して、
// 前回からの変化を crawl/changes.json に書き出す。ネットワークに接続するため、CI では実行しない。
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { extractText, getDocumentProxy } from "unpdf";
import { runCrawl } from "./crawl.ts";
import { loadCrawlConfig } from "./targets.ts";

const root = resolve(import.meta.dirname, "..", "..");
const { values } = parseArgs({ options: { venue: { type: "string", multiple: true } } });

async function pdfToText(data: Uint8Array): Promise<string> {
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: false });
  return text.join("\n");
}

const config = loadCrawlConfig(resolve(root, "crawl", "targets.json"));
const report = await runCrawl(
  { config, snapshotDir: resolve(root, "crawl", "snapshots"), venueIds: values.venue },
  {
    fetch,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
    now: () => new Date(),
    pdfToText,
    log: (m) => console.log(m),
  },
);

writeFileSync(resolve(root, "crawl", "changes.json"), `${JSON.stringify(report, null, 2)}\n`);

const s = report.summary;
console.log(
  `\n巡回の結果（${report.date}）: 新規 ${s.new} / 変化あり ${s.changed} / 変化なし ${s.unchanged} / 失敗 ${s.error} / 見送り ${s.skipped}`,
);
for (const r of report.robots) console.log(`  robots.txt ${r.origin}: ${r.status}`);
for (const p of report.pages.filter((p) => p.status === "error" || p.status === "skipped")) {
  console.log(`  ${p.status === "error" ? "✖ 失敗" : "− 見送り"} ${p.url}: ${p.reason}`);
}
if (report.changed_venues.length > 0) console.log(`変化のあった館: ${report.changed_venues.join(", ")}`);
console.log("詳細は crawl/changes.json を参照してください。");
if (s.error > 0) process.exitCode = 1;
