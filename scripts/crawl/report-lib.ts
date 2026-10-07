// crawl/report.md（PR の本文用の要約）の組み立て。
import type { ChangesReport } from "./crawl.ts";

export const AUTO_START = "<!-- crawl:report:auto:start -->";
export const AUTO_END = "<!-- crawl:report:auto:end -->";

interface SourceLike {
  url: string;
  title?: string;
  quote?: string;
}

interface RecordLike {
  id: string;
  title?: string;
  sources?: SourceLike[];
  [key: string]: unknown;
}

export interface FileDiffInput {
  file: string;
  before: RecordLike[];
  after: RecordLike[];
}

function show(value: unknown): string {
  if (value === undefined) return "（なし）";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function short(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function cell(text: string): string {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ");
}

/** 変わった項目の一覧（sources と verified_at は別に扱う）。 */
export function changedFields(before: RecordLike, after: RecordLike): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter((k) => k !== "sources" && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
}

function quotesOf(record: RecordLike): string[] {
  return (record.sources ?? [])
    .filter((s) => s.quote)
    .map((s) => `  - 「${short(s.quote ?? "", 200)}」 — ${s.url}`);
}

function describeField(key: string, before: unknown, after: unknown): string {
  if (Array.isArray(before) || Array.isArray(after)) {
    const b = Array.isArray(before) ? before.length : 0;
    const a = Array.isArray(after) ? after.length : 0;
    return `  - \`${key}\`: ${b}件 → ${a}件${a === b ? "（内容を変更）" : ""}`;
  }
  return `  - \`${key}\`: ${short(show(before), 80)} → ${short(show(after), 80)}`;
}

export function buildAutoSection(diffs: FileDiffInput[], changes?: ChangesReport): string {
  const out: string[] = [AUTO_START, "", "## 自動生成の要約（npm run crawl:report）", ""];

  if (changes) {
    const s = changes.summary;
    out.push(
      `### 巡回の結果（${changes.date}）`,
      "",
      `新規 ${s.new} / 変化あり ${s.changed} / 変化なし ${s.unchanged} / 失敗 ${s.error} / 見送り ${s.skipped}`,
      "",
      "| 館 | URL | 結果 |",
      "|---|---|---|",
      ...changes.pages.map(
        (p) =>
          `| ${p.venue_id} | ${p.url} | ${p.status}${p.reason ? `（${cell(p.reason)}）` : ""}${
            p.added_count !== undefined ? `（+${p.added_count}行 / −${p.removed_count ?? 0}行）` : ""
          } |`,
      ),
      "",
    );
  }

  for (const { file, before, after } of diffs) {
    const beforeById = new Map(before.map((r) => [r.id, r]));
    const afterIds = new Set(after.map((r) => r.id));
    const added = after.filter((r) => !beforeById.has(r.id));
    const changed = after.filter((r) => {
      const b = beforeById.get(r.id);
      return b !== undefined && JSON.stringify(b) !== JSON.stringify(r);
    });
    const removed = before.filter((r) => !afterIds.has(r.id));

    out.push(`### ${file}`, "", `追加 ${added.length}件 / 変更 ${changed.length}件 / 削除 ${removed.length}件`, "");

    if (added.length > 0) {
      out.push("#### 追加", "");
      for (const r of added) {
        out.push(`- **${r.id}** ${r.title ?? ""}`);
        out.push(...quotesOf(r));
      }
      out.push("");
    }
    if (changed.length > 0) {
      out.push("#### 変更", "");
      for (const r of changed) {
        const b = beforeById.get(r.id) as RecordLike;
        out.push(`- **${r.id}** ${r.title ?? ""}`);
        for (const key of changedFields(b, r)) out.push(describeField(key, b[key], r[key]));
        const q = quotesOf(r);
        if (q.length > 0) out.push("  - 根拠の引用:", ...q.map((l) => `  ${l}`));
      }
      out.push("");
    }
    if (removed.length > 0) {
      out.push("#### 削除", "");
      for (const r of removed) out.push(`- **${r.id}** ${r.title ?? ""}`);
      out.push("");
    }
  }

  out.push(AUTO_END);
  return out.join("\n");
}

/** 既存の report.md の自動生成部分だけを差し替える（手で書いた部分は残す）。 */
export function mergeReport(existing: string | undefined, auto: string, heading: string): string {
  if (existing && existing.includes(AUTO_START) && existing.includes(AUTO_END)) {
    const start = existing.indexOf(AUTO_START);
    const end = existing.indexOf(AUTO_END) + AUTO_END.length;
    return `${existing.slice(0, start)}${auto}${existing.slice(end)}`;
  }
  return `${heading}\n\n${auto}\n\n## 要確認\n\n- （ここに、判断に迷ったデータや照合できなかった項目を書く）\n`;
}
