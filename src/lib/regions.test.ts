import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PREFECTURES, REGIONS, findPrefecture, prefectureOrder } from "./regions";

describe("regions", () => {
  it("47都道府県がそろい、名前と slug が重ならない", () => {
    expect(PREFECTURES).toHaveLength(47);
    expect(new Set(PREFECTURES.map((p) => p.name)).size).toBe(47);
    expect(new Set(PREFECTURES.map((p) => p.slug)).size).toBe(47);
  });

  it("どの都道府県も、8地方のどれかに属する", () => {
    const regions = new Set(REGIONS.map((r) => r.slug));
    expect(regions.size).toBe(8);
    for (const p of PREFECTURES) expect(regions.has(p.region)).toBe(true);
  });

  it("都道府県コードの順に並べられる", () => {
    expect(prefectureOrder("北海道")).toBe(0);
    expect(prefectureOrder("東京都")).toBeLessThan(prefectureOrder("愛知県"));
    expect(prefectureOrder("存在しない県")).toBe(47);
  });

  it("data/venues.json の都道府県が、すべて一覧にある", () => {
    const venues = JSON.parse(readFileSync("data/venues.json", "utf-8")) as { id: string; prefecture: string }[];
    for (const v of venues) expect(findPrefecture(v.prefecture), v.id).toBeDefined();
  });
});
