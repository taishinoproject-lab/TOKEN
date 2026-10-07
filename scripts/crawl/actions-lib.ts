// GitHub Actions の週1回の巡回（T-304）で使う、ネットワークに依存しない部分。
// 変化の有無の判定、ブランチ名、PR の題名・本文、実行ログの一覧を組み立てる。
import type { ChangesReport, PageResult } from "./crawl.ts";

/** 館ID → 館名。見つからない館は ID をそのまま表示する */
export type VenueNames = Record<string, string>;

export interface PrBodyOptions {
  /** PR のブランチ名（例: crawl/2026-10-12） */
  branch: string;
  /** GitHub Actions の実行ログの URL */
  runUrl?: string;
  venueNames?: VenueNames;
  /** 1ページあたりに載せる、増えた行・消えた行の上限 */
  maxDiffLines?: number;
}

/** PR 本文の上限（GitHub は 65,536 文字）。余裕を見てこれを超えたら差分の行を省く */
export const MAX_BODY_LENGTH = 60_000;
const MAX_LINE_LENGTH = 200;

/** 本文が新規・変化したページが1つでもあれば true。取得日だけの更新（すべて unchanged）は変化に含めない */
export function hasChanges(report: ChangesReport): boolean {
  return report.summary.new + report.summary.changed > 0;
}

export function changedPages(report: ChangesReport): PageResult[] {
  return report.pages.filter((p) => p.status === "new" || p.status === "changed");
}

export function failedPages(report: ChangesReport): PageResult[] {
  return report.pages.filter((p) => p.status === "error");
}

export function skippedPages(report: ChangesReport): PageResult[] {
  return report.pages.filter((p) => p.status === "skipped");
}

/** 巡回の結果を入れるブランチ名。同じ日のブランチがすでにあれば、末尾に suffix を付ける */
export function crawlBranchName(report: ChangesReport, existing: boolean, suffix: string): string {
  const base = `crawl/${report.date}`;
  return existing ? `${base}-${suffix}` : base;
}

function venueLabel(id: string, names: VenueNames | undefined): string {
  const name = names?.[id];
  return name ? `${name}（\`${id}\`）` : `\`${id}\``;
}

function changedVenueNames(report: ChangesReport, names: VenueNames | undefined): string[] {
  return report.changed_venues.map((id) => names?.[id] ?? id);
}

export function buildPrTitle(report: ChangesReport, names?: VenueNames): string {
  return `巡回 ${report.date}：公式ページの変化（${changedVenueNames(report, names).join("・")}）`;
}

export function buildCommitMessage(report: ChangesReport, names?: VenueNames): string {
  return `data: 巡回 ${report.date} のスナップショット（${changedVenueNames(report, names).join("・")}）`;
}

const STATUS_LABEL: Record<PageResult["status"], string> = {
  new: "新規",
  changed: "変化あり",
  unchanged: "変化なし",
  error: "失敗",
  skipped: "見送り",
};

function clip(line: string): string {
  const oneLine = line.replace(/`{3,}/g, "``");
  return oneLine.length > MAX_LINE_LENGTH ? `${oneLine.slice(0, MAX_LINE_LENGTH)}…` : oneLine;
}

function diffDetails(page: PageResult, maxLines: number): string[] {
  if (maxLines <= 0 || page.status !== "changed") return [];
  const out: string[] = [];
  const block = (label: string, lines: string[] | undefined, total: number | undefined) => {
    if (!lines || lines.length === 0) return;
    const shown = lines.slice(0, maxLines);
    const rest = (total ?? lines.length) - shown.length;
    out.push(`  ${label}`, "  ```text", ...shown.map((l) => `  ${clip(l)}`), "  ```");
    if (rest > 0) out.push(`  ほか ${rest}行`);
  };
  block("増えた行:", page.added, page.added_count);
  block("消えた行:", page.removed, page.removed_count);
  if (out.length === 0) return [];
  return ["  <details><summary>差分の一部</summary>", "", ...out, "", "  </details>"];
}

function pageLine(page: PageResult): string {
  const counts =
    page.status === "changed"
      ? `：増えた行 ${page.added_count ?? 0}・消えた行 ${page.removed_count ?? 0}`
      : page.status === "new"
        ? "：初回の取得"
        : "";
  const file = page.file ? `（\`crawl/snapshots/${page.file}\`）` : "";
  return `- ${STATUS_LABEL[page.status]}${counts} <${page.url}>${file}`;
}

function groupByVenue(pages: PageResult[]): Map<string, PageResult[]> {
  const m = new Map<string, PageResult[]>();
  for (const p of pages) m.set(p.venue_id, [...(m.get(p.venue_id) ?? []), p]);
  return m;
}

/** 失敗・見送りのページの一覧（PR 本文と実行ログで共通） */
export function buildProblemList(pages: PageResult[], names?: VenueNames): string[] {
  return pages.map((p) => `- ${venueLabel(p.venue_id, names)} <${p.url}>：${p.reason ?? "理由不明"}`);
}

export function buildPrBody(report: ChangesReport, options: PrBodyOptions): string {
  const body = renderPrBody(report, options, options.maxDiffLines ?? 20);
  return body.length > MAX_BODY_LENGTH ? renderPrBody(report, options, 0) : body;
}

function renderPrBody(report: ChangesReport, options: PrBodyOptions, maxDiffLines: number): string {
  const names = options.venueNames;
  const s = report.summary;
  const lines: string[] = [
    `## 週1回の巡回（${report.date}）`,
    "",
    "GitHub Actions が公式ページを巡回し、本文の変化を検出しました。**このPRには、スナップショット（`crawl/snapshots/`）と `crawl/changes.json` だけが入っています。展覧会データ（`data/`）はまだ更新されていません。**",
    "",
    `新規 ${s.new} / 変化あり ${s.changed} / 変化なし ${s.unchanged} / 失敗 ${s.error} / 見送り ${s.skipped}`,
    "",
    "### 変化のあった館とページ",
    "",
  ];
  for (const [venueId, pages] of groupByVenue(changedPages(report))) {
    lines.push(`#### ${venueLabel(venueId, names)}`, "");
    for (const p of pages) lines.push(pageLine(p), ...diffDetails(p, maxDiffLines));
    lines.push("");
  }

  const failed = failedPages(report);
  lines.push("### 取得に失敗したページ", "");
  if (failed.length === 0) lines.push("なし");
  else {
    lines.push(...buildProblemList(failed, names), "", "失敗したページは、前回のスナップショットのままです。続けて作業してよいですが、報告の「要確認」に書いてください。");
  }
  lines.push("");

  const skipped = skippedPages(report);
  if (skipped.length > 0) lines.push("### 見送ったページ", "", ...buildProblemList(skipped, names), "");

  lines.push(
    "### 次の作業",
    "",
    `- [ ] 次の作業：docs/crawler-runbook.md に従って抽出し、このブランチ（\`${options.branch}\`）に push する（手順は「8. GitHub Actions が作った PR を起点にする」）。`,
    "- [ ] `crawl/report.md` の内容で、このPRの本文を書き換える（または追記する）。",
    "- [ ] オーナーが内容を確認して、マージする。",
    "",
    "このPRは GitHub Actions が作成したため、作成時点では CI が実行されていません。抽出の結果を push すると実行されます。",
  );
  if (options.runUrl) lines.push("", `実行ログ: ${options.runUrl}`);
  return `${lines.join("\n")}\n`;
}

/** 変化がなかったときの、実行ログ（ジョブの概要）用の文章 */
export function buildNoChangeSummary(report: ChangesReport, names?: VenueNames): string {
  const s = report.summary;
  const lines = [
    `## 週1回の巡回（${report.date}）：変化なし`,
    "",
    `新規 ${s.new} / 変化あり ${s.changed} / 変化なし ${s.unchanged} / 失敗 ${s.error} / 見送り ${s.skipped}`,
    "",
    "本文の変化がなかったため、ブランチと PR は作成していません。",
  ];
  const failed = failedPages(report);
  if (failed.length > 0) lines.push("", "### 取得に失敗したページ", "", ...buildProblemList(failed, names));
  const skipped = skippedPages(report);
  if (skipped.length > 0) lines.push("", "### 見送ったページ", "", ...buildProblemList(skipped, names));
  return `${lines.join("\n")}\n`;
}
