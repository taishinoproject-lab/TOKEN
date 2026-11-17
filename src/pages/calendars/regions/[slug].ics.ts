// 地域ごとのカレンダー（D-023）。地方（8地方区分）ごとに、その地域の館の刀剣の展覧会を、ビルド時に静的に出力する（D-008）。
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { allAreaCalendars, type AreaCalendar } from "../../../lib/area-calendars";
import { buildAreaIcs } from "../../../lib/ics";

export const getStaticPaths = (async () => {
  const venues = (await getCollection("venues")).map((e) => e.data);
  return allAreaCalendars(venues)
    .filter((area) => area.kind === "region")
    .map((area) => ({ params: { slug: area.slug }, props: { area } }));
}) satisfies GetStaticPaths;

// ビルドした時刻（DTSTAMP に使う）。全ファイルで同じ値にする
const buildTime = new Date();

export const GET: APIRoute<{ area: AreaCalendar }> = async ({ props, site }) => {
  const { area } = props;
  const venueIds = new Set(area.venueIds);
  const venues = (await getCollection("venues")).map((e) => e.data).filter((v) => venueIds.has(v.id));
  const exhibitions = (await getCollection("exhibitions")).map((e) => e.data).filter((ex) => venueIds.has(ex.venue_id));
  const body = buildAreaIcs({
    areaName: area.name,
    uidPrefix: area.uidPrefix,
    exhibitions,
    venues,
    dtstamp: buildTime,
    // 公開先（astro.config.mjs の site）が未設定のときは、展覧会ページのURLを入れない
    exhibitionPageUrl: site ? (id) => new URL(`/exhibitions/${id}`, site).href : undefined,
  });
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
};
