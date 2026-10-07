import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { Manifest } from "./snapshot.ts";
import { verifyQuotes } from "./verify-quotes.ts";

const URL_A = "https://museum.example.jp/schedule/";

const manifest: Manifest = {
  entries: [
    {
      venue_id: "museum",
      url: URL_A,
      type: "html",
      file: "museum/schedule.txt",
      changed_at: "2026-10-07",
      fetched_at: "2026-10-07",
      sha256: "x",
    },
  ],
};
const snapshots: Record<string, string> = {
  "museum/schedule.txt": "令和8年度 展覧予定表\n令和9年1月1日～1月25日\nもののふ(武士)と熱田\n",
};
const read = (file: string) => snapshots[file];

function exhibition(quote: string | undefined, url = URL_A, extra: Record<string, unknown> = {}) {
  return {
    id: "2027-museum-a",
    venue_id: "museum",
    confidence: "confirmed",
    sources: [{ url, retrieved_at: "2026-10-07", ...(quote === undefined ? {} : { quote }) }],
    ...extra,
  };
}

describe("verifyQuotes", () => {
  it("全角・半角や改行・空白の違いがあっても、本文にある引用は通る", () => {
    const r = verifyQuotes(
      [{ file: "exhibitions.json", records: [exhibition("令和９年１月１日〜１月２５日　もののふ（武士）と熱田")] }],
      manifest,
      read,
    );
    expect(r.checked).toBe(1);
    expect(r.errors).toEqual([]);
  });

  it("本文にない引用はエラー", () => {
    const r = verifyQuotes([{ file: "exhibitions.json", records: [exhibition("令和9年1月1日～1月26日")] }], manifest, read);
    expect(r.errors).toHaveLength(1);
    expect(r.errors[0].message).toContain("本文に見つかりません");
  });

  it("スナップショットのない URL の引用はエラー", () => {
    const r = verifyQuotes(
      [{ file: "exhibitions.json", records: [exhibition("令和9年1月1日～1月25日", "https://other.example.jp/")] }],
      manifest,
      read,
    );
    expect(r.errors[0].message).toContain("スナップショットがありません");
  });

  it("manifest にあってもファイルがなければエラー", () => {
    const r = verifyQuotes([{ file: "exhibitions.json", records: [exhibition("令和9年1月1日～1月25日")] }], manifest, () => undefined);
    expect(r.errors[0].message).toContain("ファイルがありません");
  });

  it("短すぎる引用はエラー", () => {
    const r = verifyQuotes([{ file: "exhibitions.json", records: [exhibition("熱田")] }], manifest, read);
    expect(r.errors[0].message).toContain("短すぎます");
  });

  it("quote のない出典は照合しない。対象館の confirmed の展覧会に引用がなければ警告する", () => {
    const r = verifyQuotes([{ file: "exhibitions.json", records: [exhibition(undefined)] }], manifest, read, {
      crawledVenueIds: ["museum"],
    });
    expect(r.checked).toBe(0);
    expect(r.errors).toEqual([]);
    expect(r.warnings).toHaveLength(1);
  });

  it("展覧会以外（刀剣・刀匠・館）の引用も照合する", () => {
    const r = verifyQuotes([{ file: "swords.json", records: [{ id: "s", sources: [{ url: URL_A, quote: "存在しない文" }] }] }], manifest, read);
    expect(r.errors).toHaveLength(1);
  });
});

describe("scripts/crawl/verify.ts", () => {
  const root = resolve(import.meta.dirname, "..", "..");
  const script = join(root, "scripts", "crawl", "verify.ts");
  let workDir: string | undefined;

  afterEach(() => {
    if (workDir) rmSync(workDir, { recursive: true, force: true });
    workDir = undefined;
  });

  function run(dataDir?: string) {
    const args = ["--import", "tsx", script, ...(dataDir ? [dataDir] : [])];
    const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf-8" });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  }

  it("リポジトリの data/ の引用は、すべて crawl/snapshots/ で照合できる", () => {
    const { status, output } = run();
    expect(output).toContain("すべての引用を本文で確認しました");
    expect(status).toBe(0);
  });

  it("本文にない引用があると終了コード 1 で失敗する", () => {
    workDir = mkdtempSync(join(tmpdir(), "token-verify-"));
    cpSync(join(root, "data"), workDir, { recursive: true });
    const path = join(workDir, "exhibitions.json");
    const data = JSON.parse(readFileSync(path, "utf-8")) as { sources: { url: string; quote?: string }[] }[];
    data[0].sources.push({ url: "https://www.tnm.jp/modules/r_exhibition/index.php?controller=hall&hid=12", quote: "架空の展覧会のための架空の引用" });
    writeFileSync(path, JSON.stringify(data));
    const { status, output } = run(workDir);
    expect(output).toContain("照合できない引用 1件");
    expect(status).toBe(1);
  });
});
