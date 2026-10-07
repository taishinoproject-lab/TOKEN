// 刀剣ごとのカレンダー（/swords/{id}.ics）。ビルド時に全刀剣ぶんを静的に出力する（decisions.md D-008）。
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { swordDisplayName } from "../../lib/display-name";
import { buildSwordIcs } from "../../lib/ics";
import type { Sword } from "../../lib/schema";

export const getStaticPaths = (async () => {
  const swords = await getCollection("swords");
  return swords.map((entry) => ({ params: { id: entry.id }, props: { sword: entry.data } }));
}) satisfies GetStaticPaths;

// ビルドした時刻（DTSTAMP に使う）。全ファイルで同じ値にする
const buildTime = new Date();

export const GET: APIRoute<{ sword: Sword }> = async ({ props, site }) => {
  const { sword } = props;
  const smiths = (await getCollection("smiths")).map((e) => e.data);
  const venues = (await getCollection("venues")).map((e) => e.data);
  const exhibitions = (await getCollection("exhibitions"))
    .map((e) => e.data)
    .filter((ex) => ex.exhibits.some((exhibit) => exhibit.sword_id === sword.id));

  const body = buildSwordIcs({
    sword: { id: sword.id, heading: swordDisplayName(sword, smiths).heading },
    exhibitions,
    venues,
    dtstamp: buildTime,
    // 公開先（astro.config.mjs の site）が未設定のときは、刀剣ページのURLを入れない
    swordPageUrl: site ? new URL(`/swords/${sword.id}`, site).href : undefined,
  });
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
};
