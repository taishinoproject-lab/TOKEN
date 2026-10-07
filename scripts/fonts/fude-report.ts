// data/swords.json の号（go）と別名（aliases）について、筆の書体に字形がない文字を一覧にする（docs/design/system.md §2）。
// 字形がない文字を含む号は、画面では明朝で表示される（src/lib/fude.ts）。
//   npm run fonts:fude-report
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FUDE_FAMILY } from "../../src/lib/fude-glyphs.generated.ts";
import { missingFudeGlyphs } from "../../src/lib/fude.ts";
import type { Sword } from "../../src/lib/schema.ts";

const swords = JSON.parse(readFileSync(resolve(import.meta.dirname, "..", "..", "data", "swords.json"), "utf-8")) as Sword[];

let checked = 0;
const missing: string[] = [];
for (const sword of swords) {
  for (const [field, text] of [["号", sword.go], ...sword.aliases.map((a) => ["別名", a] as const)] as const) {
    if (!text) continue;
    checked++;
    const chars = missingFudeGlyphs(text);
    if (chars.length > 0) missing.push(`  ${sword.id}　${field}「${text}」　字形なし: ${chars.join(" ")}`);
  }
}

console.log(`${FUDE_FAMILY} の字形の確認：号・別名 ${checked}件`);
if (missing.length === 0) {
  console.log("字形がない文字はありません。すべて筆の書体で表示できます。");
} else {
  console.log(`字形がない文字を含むもの ${missing.length}件（明朝で表示されます）`);
  for (const line of missing) console.log(line);
}
