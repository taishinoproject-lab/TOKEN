// 検証スクリプトをコマンドとして実行し、終了コードと出力を確かめる。
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const script = join(root, "scripts", "validate-data.ts");
const tsx = join(root, "node_modules", ".bin", "tsx");

let workDir: string | undefined;

function copyData(): string {
  workDir = mkdtempSync(join(tmpdir(), "token-validate-"));
  cpSync(join(root, "data"), workDir, { recursive: true });
  return workDir;
}

function runScript(dataDir?: string) {
  const result = spawnSync(tsx, dataDir ? [script, dataDir] : [script], { encoding: "utf-8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

afterEach(() => {
  if (workDir) rmSync(workDir, { recursive: true, force: true });
  workDir = undefined;
});

describe("scripts/validate-data.ts", () => {
  it("リポジトリの data/ はエラーなしで通る", () => {
    const { status, output } = runScript();
    expect(output).toContain("エラーはありません");
    expect(status).toBe(0);
  });

  it("参照切れがあると終了コード 1 で失敗する", () => {
    const dir = copyData();
    const path = join(dir, "exhibitions.json");
    const exhibitions = JSON.parse(readFileSync(path, "utf-8"));
    exhibitions[0].venue_id = "no-such-venue";
    writeFileSync(path, JSON.stringify(exhibitions));

    const { status, output } = runScript(dir);
    expect(status).toBe(1);
    expect(output).toContain('venue_id の館 "no-such-venue" が存在しません');
  });

  it("JSON として読めないファイルがあると失敗する", () => {
    const dir = copyData();
    writeFileSync(join(dir, "swords.json"), "[{");
    const { status, output } = runScript(dir);
    expect(status).toBe(1);
    expect(output).toContain("swords.json を読み込めませんでした");
  });
});
