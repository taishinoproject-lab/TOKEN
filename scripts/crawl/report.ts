// npm run crawl:report [-- --base <git の参照>]
// 基準（既定は origin/main）と作業中の data/*.json を比べ、追加・変更点と根拠の引用・元URLを
// crawl/report.md の自動生成部分に書き出す。手で書いた部分（「要確認」など）は残す。
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import type { ChangesReport } from "./crawl.ts";
import { buildAutoSection, mergeReport, type FileDiffInput } from "./report-lib.ts";

const root = resolve(import.meta.dirname, "..", "..");
const { values } = parseArgs({ options: { base: { type: "string", default: "origin/main" } } });
const base = values.base ?? "origin/main";

function readAtBase(path: string): FileDiffInput["before"] {
  try {
    const text = execFileSync("git", ["show", `${base}:${path}`], { cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
    return JSON.parse(text) as FileDiffInput["before"];
  } catch {
    console.warn(`⚠ ${base}:${path} を読めませんでした。追加として扱います。`);
    return [];
  }
}

const diffs: FileDiffInput[] = ["exhibitions.json", "venues.json", "smiths.json", "swords.json"].map((file) => ({
  file: `data/${file}`,
  before: readAtBase(`data/${file}`),
  after: JSON.parse(readFileSync(resolve(root, "data", file), "utf-8")) as FileDiffInput["after"],
}));

const changesPath = resolve(root, "crawl", "changes.json");
const changes = existsSync(changesPath) ? (JSON.parse(readFileSync(changesPath, "utf-8")) as ChangesReport) : undefined;

const reportPath = resolve(root, "crawl", "report.md");
const existing = existsSync(reportPath) ? readFileSync(reportPath, "utf-8") : undefined;
const auto = buildAutoSection(diffs, changes);
writeFileSync(reportPath, mergeReport(existing, auto, `# 自動収集の報告（基準: ${base}）`));
console.log(`crawl/report.md を更新しました（基準: ${base}）`);
