// シェア用画像（T-208）を、ビルド時に刀剣・刀匠・展覧会の全ページぶん作るための共通処理。
// 書体は、全ての画像に出る文字をまとめて1回だけ取得する（画像ごとに取得すると遅いため）。
import { cardText, OG_FIXED_TEXT, type OgKind } from "./card";
import { allOgCards } from "./collection";
import { loadOgFonts, type LoadedOgFont } from "./fonts";
import { renderOgPng } from "./render";

let fontsPromise: Promise<LoadedOgFont[]> | null = null;

function ogFonts(): Promise<LoadedOgFont[]> {
  fontsPromise ??= (async () => {
    const cards = await allOgCards();
    const text = Object.values(cards)
      .flatMap((m) => [...m.values()])
      .map(cardText)
      .join("");
    return loadOgFonts(OG_FIXED_TEXT + text);
  })();
  return fontsPromise;
}

/** getStaticPaths 用：その種類の全てのID */
export async function ogPaths(kind: OgKind) {
  const cards = await allOgCards();
  return [...cards[kind].keys()].map((id) => ({ params: { id } }));
}

/** 1枚の画像の応答 */
export async function ogResponse(kind: OgKind, id: string | undefined): Promise<Response> {
  const card = id ? (await allOgCards())[kind].get(id) : undefined;
  if (!card) return new Response("Not found", { status: 404 });
  const png = await renderOgPng(card, await ogFonts());
  return new Response(new Uint8Array(png), { headers: { "Content-Type": "image/png" } });
}
