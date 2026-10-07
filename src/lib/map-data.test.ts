import { describe, expect, it } from "vitest";
import { mapPins, toMapData, toMapVenue } from "./map-data";
import type { Exhibition, Venue } from "./schema";

const venue = (id: string, confidence: Venue["confidence"] = "confirmed"): Venue => ({
  id,
  name: `${id}館`,
  short_name: id,
  prefecture: "東京都",
  city: "台東区",
  lat: 35.7,
  lng: 139.7,
  official_url: `https://example.com/${id}`,
  verified_at: "2026-10-01",
  sources: [],
  confidence,
});

const exhibition = (
  id: string,
  venueId: string,
  start: string,
  end: string,
  status?: Exhibition["status"],
): Exhibition => ({
  id,
  title: `${id}展`,
  venue_id: venueId,
  start_date: start,
  end_date: end,
  ...(status ? { status } : {}),
  official_url: `https://example.com/${id}`,
  periods: [],
  exhibits: [{ label: "太刀 銘 安綱", sword_id: "doujikiri" }],
  sources: [],
  verified_at: "2026-10-01",
  confidence: "confirmed",
});

const venues = [venue("a"), venue("b", "unverified"), venue("c"), venue("d")];
const exhibitions = [
  exhibition("a-past", "a", "2026-01-01", "2026-03-01"),
  exhibition("a-now", "a", "2026-10-01", "2026-11-30"),
  exhibition("a-next", "a", "2026-12-05", "2027-01-31"),
  exhibition("b-next", "b", "2026-11-01", "2026-12-20"),
  exhibition("c-past", "c", "2026-01-01", "2026-03-01"),
  exhibition("d-cancelled", "d", "2026-10-01", "2026-11-30", "cancelled"),
  exhibition("x-unknown-venue", "x", "2026-10-01", "2026-11-30"),
];
const buildToday = "2026-10-07";

describe("toMapVenue", () => {
  it("必要な項目だけを残し、unverified を真偽値にする", () => {
    expect(toMapVenue(venue("b", "unverified"))).toEqual({
      id: "b",
      name: "b館",
      lat: 35.7,
      lng: 139.7,
      unverified: true,
    });
    expect(toMapVenue(venue("a")).unverified).toBe(false);
  });
});

describe("toMapData", () => {
  const data = toMapData(venues, exhibitions, buildToday);

  it("ビルド時点で開催中・開催予定の展覧会だけを残す", () => {
    expect(data.exhibitions.map((ex) => ex.id)).toEqual(["a-now", "a-next", "b-next"]);
  });

  it("展覧会の項目を絞る（出品リストや出典は埋め込まない）", () => {
    expect(data.exhibitions[0]).toEqual({
      id: "a-now",
      title: "a-now展",
      venue_id: "a",
      start_date: "2026-10-01",
      end_date: "2026-11-30",
    });
  });

  it("残った展覧会の会場の館だけを残す", () => {
    expect(data.venues.map((v) => v.id)).toEqual(["a", "b"]);
  });
});

describe("mapPins", () => {
  const data = toMapData(venues, exhibitions, buildToday);

  it("開催中の展覧会がある館は ongoing、開催予定だけの館は upcoming", () => {
    const pins = mapPins(data, buildToday);
    expect(pins.map((p) => [p.venue.id, p.status])).toEqual([
      ["a", "ongoing"],
      ["b", "upcoming"],
    ]);
  });

  it("ピンの展覧会は、開催中を先に、開始日の早い順に並べる", () => {
    const [pinA] = mapPins(data, buildToday);
    expect(pinA.exhibitions.map((ex) => [ex.id, ex.status])).toEqual([
      ["a-now", "ongoing"],
      ["a-next", "upcoming"],
    ]);
  });

  it("ブラウザ側の今日の日付で判定し直す（ビルド後に終了・開始したものを反映する）", () => {
    const pins = mapPins(data, "2026-12-10");
    expect(pins.map((p) => [p.venue.id, p.status, p.exhibitions.map((ex) => ex.id)])).toEqual([
      ["a", "ongoing", ["a-next"]],
      ["b", "ongoing", ["b-next"]],
    ]);
  });

  it("すべて終了した館のピンは出さない", () => {
    expect(mapPins(data, "2027-02-01")).toEqual([]);
  });

  it("中止・延期の展覧会はピンにしない", () => {
    const pins = mapPins(
      {
        venues: [toMapVenue(venue("d"))],
        exhibitions: [
          { id: "d1", title: "d1", venue_id: "d", start_date: "2026-10-01", end_date: "2026-11-30", status: "postponed" },
        ],
      },
      buildToday,
    );
    expect(pins).toEqual([]);
  });
});
