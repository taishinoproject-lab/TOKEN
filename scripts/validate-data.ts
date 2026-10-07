// data/*.json を検証する（data-model.md §12）。
// エラーがあれば終了コード 1 で終わり、ビルドを止める。警告は一覧を表示するだけ。
//   npm run validate
//   npx tsx scripts/validate-data.ts <データのディレクトリ>   （テスト用。省略時は data/）
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { todayJst } from "../src/lib/date.ts";
import { formatIssue, validateData, type DataFile, type RawData } from "../src/lib/validate.ts";

const dataDir = process.argv[2] ? resolve(process.argv[2]) : resolve(import.meta.dirname, "..", "data");

function readJson(file: DataFile): unknown {
  const path = resolve(dataDir, file);
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (error) {
    console.error(`✖ ${file} を読み込めませんでした: ${(error as Error).message}`);
    process.exit(1);
  }
}

const raw: RawData = {
  venues: readJson("venues.json"),
  smiths: readJson("smiths.json"),
  swords: readJson("swords.json"),
  exhibitions: readJson("exhibitions.json"),
};

const today = todayJst();
const { errors, warnings } = validateData(raw, today);

console.log(`データ検証（基準日: ${today}・日本時間）`);

if (warnings.length > 0) {
  console.warn(`\n⚠ 警告 ${warnings.length}件`);
  for (const w of warnings) console.warn(formatIssue(w));
}

if (errors.length > 0) {
  console.error(`\n✖ エラー ${errors.length}件`);
  for (const e of errors) console.error(formatIssue(e));
  console.error("\nデータにエラーがあるため、検証に失敗しました。");
  process.exit(1);
}

console.log(`\n✔ エラーはありません（警告 ${warnings.length}件）`);
