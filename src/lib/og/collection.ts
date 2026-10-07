// シェア用画像（T-208）の内容を、刀剣・刀匠・展覧会の全件ぶん組み立てる（ビルド中は1回だけ）。
// 画像の生成（build.ts）と、共通レイアウトの説明文の既定値の両方で使う。
import { getCollection } from "astro:content";
import { exhibitionCard, smithCard, swordCard, type OgCard, type OgKind } from "./card";

let cardsPromise: Promise<Record<OgKind, Map<string, OgCard>>> | null = null;

/** 全ページぶんの画像の内容（種類 → ID → 内容） */
export function allOgCards(): Promise<Record<OgKind, Map<string, OgCard>>> {
  cardsPromise ??= (async () => {
    const swords = (await getCollection("swords")).map((e) => e.data);
    const smiths = (await getCollection("smiths")).map((e) => e.data);
    const venues = (await getCollection("venues")).map((e) => e.data);
    const exhibitions = (await getCollection("exhibitions")).map((e) => e.data);
    return {
      swords: new Map(swords.map((s) => [s.id, swordCard(s, smiths)])),
      smiths: new Map(smiths.map((s) => [s.id, smithCard(s)])),
      exhibitions: new Map(
        exhibitions.map((ex) => [ex.id, exhibitionCard(ex, venues.find((v) => v.id === ex.venue_id), swords)]),
      ),
    };
  })();
  return cardsPromise;
}
