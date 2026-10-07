// 筆の書体（Yuji Syuku）に字形がある文字の一覧を作り、src/lib/fude-glyphs.generated.ts に書き出す（docs/design/system.md §2）。
// Google Fonts の CSS API から書体の全体（TTF）を取得して、cmap 表を読む。
// 書体の版が変わったときだけ実行すればよい（ビルドでは実行しない）。
//   npm run fonts:fude-glyphs                 （Google Fonts から取得する）
//   npx tsx scripts/fonts/fude-glyphs.ts <TTFのパス>   （手元のファイルを使う）
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readCmapCodePoints } from "./cmap.ts";

const FAMILY = "Yuji Syuku";
const OUTPUT = resolve(import.meta.dirname, "..", "..", "src", "lib", "fude-glyphs.generated.ts");

async function loadFont(): Promise<{ bytes: Uint8Array; origin: string }> {
  const localPath = process.argv[2];
  if (localPath) return { bytes: readFileSync(resolve(localPath)), origin: localPath };

  // User-Agent を付けないと、文字の範囲で分割されていない TTF が1つだけ返る
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FAMILY).replace(/%20/g, "+")}`;
  const css = await (await fetch(cssUrl)).text();
  const fontUrl = /url\((https:[^)]+)\)/.exec(css)?.[1];
  if (!fontUrl) throw new Error(`書体のURLが CSS にありません: ${cssUrl}`);
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error(`書体を取得できませんでした: HTTP ${res.status} ${fontUrl}`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), origin: fontUrl };
}

const { bytes, origin } = await loadFont();
const codePoints = readCmapCodePoints(bytes);

// 基本多言語面（U+0000〜U+FFFF）は 1文字1ビットの表、それ以外は一覧で持つ
const bitmap = new Uint8Array(0x10000 / 8);
const astral: number[] = [];
for (const cp of codePoints) {
  if (cp <= 0xffff) bitmap[cp >> 3] |= 1 << (cp & 7);
  else astral.push(cp);
}
astral.sort((a, b) => a - b);

const source = `// このファイルは scripts/fonts/fude-glyphs.ts で自動生成している。手で編集しないこと。
// 筆の書体（${FAMILY}）に字形がある文字の一覧（${codePoints.size}字）。
// 取得元: ${origin}
// 基本多言語面は 1文字1ビットの表（Base64）、それ以外の面はコードポイントの一覧。

export const FUDE_FAMILY = ${JSON.stringify(FAMILY)};

export const FUDE_GLYPH_COUNT = ${codePoints.size};

export const FUDE_BMP_BITMAP_BASE64 =
  ${JSON.stringify(Buffer.from(bitmap).toString("base64"))};

export const FUDE_ASTRAL_CODE_POINTS: readonly number[] = ${JSON.stringify(astral)};
`;

writeFileSync(OUTPUT, source);
console.log(`${FAMILY}: ${codePoints.size}字（うち基本多言語面以外 ${astral.length}字）を ${OUTPUT} に書き出しました。`);
