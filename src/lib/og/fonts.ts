// シェア用画像（T-208）に使う書体を、Google Fonts から必要な文字だけ取得する。
// 書体の全体は 1つ数MB あるため、リポジトリには置かない。Google Fonts の CSS API に text= を付けると、
// 指定した文字だけを含む TTF が返る（https://developers.google.com/fonts/docs/css2#optimizing_your_font_requests）。
// 取得した TTF は node_modules/.cache/ に保存し、同じ文字の組み合わせなら2回目からは通信しない。
// 書体はすべて SIL Open Font License 1.1（google/fonts の ofl/yujisyuku、ofl/shipporimincho、ofl/zenkakugothicnew の OFL.txt で確認）。
// 書体のファイルはリポジトリにも公開するサイトにも置かず、画像の中の文字の形として使うだけ。ライセンスの表記は /about に載せる。
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

export type OgFontRole = "fude" | "mincho" | "gothic";

export interface OgFontSpec {
  /** satori に渡す名前（画像の部品からはこの名前で指定する） */
  name: OgFontRole;
  /** Google Fonts の書体名 */
  family: string;
  weight: 400 | 600 | 700 | 800;
}

/** docs/design/system.md §2 の書体と、画像で使う太さ */
export const OG_FONTS: readonly OgFontSpec[] = [
  { name: "fude", family: "Yuji Syuku", weight: 400 },
  { name: "mincho", family: "Shippori Mincho", weight: 400 },
  { name: "mincho", family: "Shippori Mincho", weight: 600 },
  { name: "mincho", family: "Shippori Mincho", weight: 800 },
  { name: "gothic", family: "Zen Kaku Gothic New", weight: 400 },
  { name: "gothic", family: "Zen Kaku Gothic New", weight: 700 },
];

export interface LoadedOgFont {
  name: OgFontRole;
  data: Buffer;
  weight: OgFontSpec["weight"];
  style: "normal";
}

const CACHE_DIR = resolve(process.cwd(), "node_modules", ".cache", "token-og-fonts");

/**
 * 重複を除き、並びを固定した文字列（キャッシュのキーを安定させるため）。
 * 空白も字形が必要なので、半角・全角の空白は必ず含める（改行などの制御文字は除く）。
 */
export function uniqueChars(text: string): string {
  const chars = new Set([..." \u3000" + text.replace(/[\n\r\t]/gu, "")]);
  return [...chars].sort().join("");
}

/** Google Fonts の CSS API の URL */
export function cssUrl(spec: OgFontSpec, chars: string): string {
  const family = encodeURIComponent(spec.family).replace(/%20/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${spec.weight}&text=${encodeURIComponent(chars)}`;
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
  throw new Error(`シェア用画像の書体を取得できませんでした（${url}）: ${String(lastError)}`);
}

async function loadOne(spec: OgFontSpec, chars: string): Promise<Buffer> {
  const key = createHash("sha256").update(`${spec.family}|${spec.weight}|${chars}`).digest("hex").slice(0, 24);
  const cachePath = resolve(CACHE_DIR, `${key}.ttf`);
  try {
    return await readFile(cachePath);
  } catch {
    // キャッシュがなければ取得する
  }
  const css = await (await fetchWithRetry(cssUrl(spec, chars))).text();
  const fontUrl = /src:\s*url\((https:[^)]+)\)\s*format\('(?:truetype|opentype)'\)/.exec(css)?.[1];
  if (!fontUrl) throw new Error(`書体のURLが CSS にありません: ${spec.family} ${spec.weight}`);
  const data = Buffer.from(await (await fetchWithRetry(fontUrl)).arrayBuffer());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(cachePath, data);
  return data;
}

/** 画像に出す全ての文字を含む書体を、役割・太さごとに用意する。 */
export async function loadOgFonts(text: string): Promise<LoadedOgFont[]> {
  const chars = uniqueChars(text);
  return Promise.all(
    OG_FONTS.map(async (spec) => ({
      name: spec.name,
      weight: spec.weight,
      style: "normal" as const,
      data: await loadOne(spec, chars),
    })),
  );
}
