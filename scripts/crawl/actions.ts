// npm run crawl:actions -- --body-file <パス> [--run-url <URL>] [--suffix <実行ID>]
// GitHub Actions の週1回の巡回（.github/workflows/crawl.yml）から呼ぶ。
// crawl/changes.json を読み、変化の有無・ブランチ名・PR の題名・コミットメッセージを $GITHUB_OUTPUT に、
// PR の本文を --body-file に、概要を $GITHUB_STEP_SUMMARY に書き出す。失敗したページは実行ログにも一覧で出す。
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import {
  buildCommitMessage,
  buildNoChangeSummary,
  buildPrBody,
  buildPrTitle,
  buildProblemList,
  crawlBranchName,
  failedPages,
  hasChanges,
  skippedPages,
  type VenueNames,
} from "./actions-lib.ts";
import type { ChangesReport } from "./crawl.ts";

const root = resolve(import.meta.dirname, "..", "..");
const { values } = parseArgs({
  options: {
    suffix: { type: "string" },
    "body-file": { type: "string" },
    "run-url": { type: "string" },
  },
});
const bodyFile = values["body-file"];
if (!bodyFile) throw new Error("--body-file を指定してください");

const changesPath = resolve(root, "crawl", "changes.json");
if (!existsSync(changesPath)) {
  throw new Error("crawl/changes.json がありません。巡回（npm run crawl:fetch）が途中で止まった可能性があります");
}
const report = JSON.parse(readFileSync(changesPath, "utf-8")) as ChangesReport;

const venues = JSON.parse(readFileSync(resolve(root, "data", "venues.json"), "utf-8")) as { id: string; name: string }[];
const venueNames: VenueNames = Object.fromEntries(venues.map((v) => [v.id, v.name]));

/** origin に同じ名前のブランチがすでにあるか（同じ日に手動で再実行した場合など） */
function remoteBranchExists(name: string): boolean {
  const out = execFileSync("git", ["ls-remote", "--heads", "origin", name], { cwd: root, encoding: "utf-8" });
  return out.trim().length > 0;
}

const changed = hasChanges(report);
const branch = changed
  ? crawlBranchName(report, remoteBranchExists(`crawl/${report.date}`), values.suffix ?? String(Date.now()))
  : "";
const outputs: Record<string, string> = {
  has_changes: String(changed),
  has_errors: String(failedPages(report).length > 0),
};
let summary: string;
if (changed) {
  const body = buildPrBody(report, { branch, runUrl: values["run-url"], venueNames });
  writeFileSync(bodyFile, body);
  outputs.branch = branch;
  outputs.title = buildPrTitle(report, venueNames);
  outputs.commit_message = buildCommitMessage(report, venueNames);
  summary = body;
} else {
  summary = buildNoChangeSummary(report, venueNames);
}

console.log(changed ? `変化あり: ${report.changed_venues.join(", ")}` : "変化なし");
const failed = failedPages(report);
if (failed.length > 0) {
  console.log("取得に失敗したページ:");
  for (const line of buildProblemList(failed, venueNames)) console.log(line);
  // GitHub Actions の注釈（実行結果の画面に警告として出る）
  for (const p of failed) console.log(`::warning title=取得に失敗（${p.venue_id}）::${p.url} ${p.reason ?? ""}`);
}
const skipped = skippedPages(report);
if (skipped.length > 0) {
  console.log("見送ったページ:");
  for (const line of buildProblemList(skipped, venueNames)) console.log(line);
}

const outputFile = process.env.GITHUB_OUTPUT;
if (outputFile) {
  appendFileSync(outputFile, Object.entries(outputs).map(([k, v]) => `${k}=${v.replace(/\n/g, " ")}\n`).join(""));
} else {
  console.log(outputs);
}
const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile) appendFileSync(summaryFile, summary);
