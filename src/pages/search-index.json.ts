// 検索用のインデックス（data-model.md §10）。ビルド時に /search-index.json として出力する。
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildSearchIndex } from "../lib/search";

export const GET: APIRoute = async () => {
  const swords = (await getCollection("swords")).map((e) => e.data);
  const smiths = (await getCollection("smiths")).map((e) => e.data);
  return new Response(JSON.stringify(buildSearchIndex(swords, smiths)), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
