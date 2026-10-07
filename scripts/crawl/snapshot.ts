// スナップショット（取得したページの本文テキスト）の命名と、前回との比較。
import { createHash } from "node:crypto";

/** スナップショットの一覧（crawl/snapshots/manifest.json）の1件。 */
export interface ManifestEntry {
  venue_id: string;
  url: string;
  type: "html" | "pdf" | "json";
  /** crawl/snapshots/ からの相対パス（例: "tnm/www.tnm.jp_modules_....txt"） */
  file: string;
  /** 本文が最後に変わったのを検出した日（日本時間） */
  changed_at: string;
  /** 最後に取得に成功した日（日本時間）。引用の照合では、これを sources[].retrieved_at の目安にする */
  fetched_at: string;
  sha256: string;
}

export interface Manifest {
  entries: ManifestEntry[];
}

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf-8").digest("hex");
}

/**
 * URL からスナップショットのファイル名を作る。
 * 読みやすさのためにホスト名・パス・クエリを英数字に置き換え、衝突を避けるために URL のハッシュの先頭8文字を付ける。
 */
export function snapshotFileName(url: string): string {
  const u = new URL(url);
  const readable = `${u.hostname}${u.pathname}${u.search}`
    .replace(/[^A-Za-z0-9.]+/g, "_")
    .replace(/_+$/g, "")
    .slice(0, 80);
  const hash = sha256(url).slice(0, 8);
  return `${readable}-${hash}.txt`;
}

export type ChangeStatus = "new" | "changed" | "unchanged";

export interface TextDiff {
  status: ChangeStatus;
  /** 今回だけにある行 */
  added: string[];
  /** 前回だけにある行 */
  removed: string[];
}

/**
 * 前回と今回の本文を行の単位で比べる。
 * 行の並び替えだけの変化も「changed」とするが、added / removed には現れない。
 */
export function diffText(previous: string | undefined, current: string): TextDiff {
  const currentLines = current.split("\n").filter((l) => l.length > 0);
  if (previous === undefined) return { status: "new", added: currentLines, removed: [] };
  if (previous === current) return { status: "unchanged", added: [], removed: [] };
  const previousLines = previous.split("\n").filter((l) => l.length > 0);
  const prevCount = countLines(previousLines);
  const currCount = countLines(currentLines);
  const added: string[] = [];
  const removed: string[] = [];
  for (const [line, n] of currCount) {
    const before = prevCount.get(line) ?? 0;
    for (let i = before; i < n; i++) added.push(line);
  }
  for (const [line, n] of prevCount) {
    const after = currCount.get(line) ?? 0;
    for (let i = after; i < n; i++) removed.push(line);
  }
  return { status: "changed", added, removed };
}

function countLines(lines: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const l of lines) m.set(l, (m.get(l) ?? 0) + 1);
  return m;
}
