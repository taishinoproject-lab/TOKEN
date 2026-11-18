// 地域ごとのカレンダー（D-023）の一覧。地方（8地方区分）と都道府県の両方を作る。
// 館が1つもない地域は作らない（予定が永久に空のカレンダーを並べないため）。
import { PREFECTURES, REGIONS, findPrefecture } from "./regions";

export type AreaKind = "region" | "prefecture";

export interface AreaCalendar {
  kind: AreaKind;
  slug: string;
  name: string;
  /** この地域の館のID */
  venueIds: string[];
  /** .ics のパス（例：/calendars/regions/kanto.ics） */
  path: string;
  /** UID の先頭（例：region-kanto） */
  uidPrefix: string;
}

export interface RegionWithPrefectures {
  region: AreaCalendar;
  prefectures: AreaCalendar[];
}

interface VenueLike {
  id: string;
  prefecture: string;
}

export function areaCalendarPath(kind: AreaKind, slug: string): string {
  return `/calendars/${kind === "region" ? "regions" : "prefectures"}/${slug}.ics`;
}

/** 館の一覧から、地方ごと（その下に都道府県ごと）のカレンダーを作る。並びは都道府県コードの順。 */
export function buildAreaCalendars(venues: readonly VenueLike[]): RegionWithPrefectures[] {
  const result: RegionWithPrefectures[] = [];
  for (const region of REGIONS) {
    const prefectures: AreaCalendar[] = [];
    for (const pref of PREFECTURES.filter((p) => p.region === region.slug)) {
      const venueIds = venues.filter((v) => findPrefecture(v.prefecture)?.slug === pref.slug).map((v) => v.id);
      if (venueIds.length === 0) continue;
      prefectures.push({
        kind: "prefecture",
        slug: pref.slug,
        name: pref.name,
        venueIds,
        path: areaCalendarPath("prefecture", pref.slug),
        uidPrefix: `pref-${pref.slug}`,
      });
    }
    if (prefectures.length === 0) continue;
    result.push({
      region: {
        kind: "region",
        slug: region.slug,
        name: region.name,
        venueIds: prefectures.flatMap((p) => p.venueIds),
        path: areaCalendarPath("region", region.slug),
        uidPrefix: `region-${region.slug}`,
      },
      prefectures,
    });
  }
  return result;
}

/** すべての地域（地方と都道府県）を平らに並べる。 */
export function allAreaCalendars(venues: readonly VenueLike[]): AreaCalendar[] {
  return buildAreaCalendars(venues).flatMap((r) => [r.region, ...r.prefectures]);
}
