import { describe, expect, it } from "vitest";
import { allAreaCalendars, buildAreaCalendars } from "./area-calendars";

const venues = [
  { id: "a", prefecture: "愛知県" },
  { id: "b", prefecture: "東京都" },
  { id: "c", prefecture: "静岡県" },
  { id: "d", prefecture: "東京都" },
];

describe("buildAreaCalendars", () => {
  const areas = buildAreaCalendars(venues);

  it("館のある地方と都道府県だけを、都道府県コードの順に作る", () => {
    expect(areas.map((r) => r.region.slug)).toEqual(["kanto", "chubu"]);
    expect(areas[1].prefectures.map((p) => p.slug)).toEqual(["shizuoka", "aichi"]);
  });

  it("地方のカレンダーには、配下の都道府県の館がすべて入る", () => {
    expect(areas[0].region.venueIds).toEqual(["b", "d"]);
    expect(areas[1].region.venueIds).toEqual(["c", "a"]);
  });

  it("パスと UID の先頭が、地方と都道府県で重ならない", () => {
    const all = allAreaCalendars(venues);
    expect(all.find((a) => a.kind === "region" && a.slug === "kanto")?.path).toBe("/calendars/regions/kanto.ics");
    expect(all.find((a) => a.kind === "prefecture" && a.slug === "tokyo")?.path).toBe("/calendars/prefectures/tokyo.ics");
    expect(new Set(all.map((a) => a.path)).size).toBe(all.length);
    expect(new Set(all.map((a) => a.uidPrefix)).size).toBe(all.length);
  });
});
