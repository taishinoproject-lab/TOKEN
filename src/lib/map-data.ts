// 地図に渡すデータの組み立て（T-206）。
// ビルド時に必要な項目だけに絞って埋め込み（toMapData）、ブラウザで今日の日付を使ってピンを決め直す（mapPins）。
import type { IsoDate } from "./date";
import type { Exhibition, Venue } from "./schema";
import { exhibitionStatus } from "./status";

/** 地図に埋め込む館の項目。 */
export interface MapVenue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** 館の情報が未確認（confidence: "unverified"）。ピンの説明に「位置は要確認」と出す。 */
  unverified: boolean;
}

/** 地図に埋め込む展覧会の項目。 */
export type MapExhibition = Pick<Exhibition, "id" | "title" | "venue_id" | "start_date" | "end_date" | "status">;

export interface MapData {
  venues: MapVenue[];
  exhibitions: MapExhibition[];
}

export type PinStatus = "ongoing" | "upcoming";

export interface MapPin {
  venue: MapVenue;
  /** 開催中の展覧会が1つでもあれば "ongoing"、なければ "upcoming"。 */
  status: PinStatus;
  /** 開催中を先に、それぞれ開始日の早い順。status は今日の日付で判定した状態。 */
  exhibitions: (Omit<MapExhibition, "status"> & { status: PinStatus })[];
}

export function toMapVenue(venue: Pick<Venue, "id" | "name" | "lat" | "lng" | "confidence">): MapVenue {
  return {
    id: venue.id,
    name: venue.name,
    lat: venue.lat,
    lng: venue.lng,
    unverified: venue.confidence === "unverified",
  };
}

/**
 * ビルド時に、全国地図へ埋め込むデータを作る。
 * ビルドした日（buildToday）の時点で開催中・開催予定の展覧会と、その会場の館だけを残す。
 * ビルド時点で終了・中止・延期のものは、ブラウザで判定し直しても表示されないため、埋め込まない。
 */
export function toMapData(
  venues: readonly Venue[],
  exhibitions: readonly Exhibition[],
  buildToday: IsoDate,
): MapData {
  const venueIds = new Set(venues.map((v) => v.id));
  const mapExhibitions: MapExhibition[] = exhibitions
    .filter((ex) => venueIds.has(ex.venue_id))
    .filter((ex) => {
      const s = exhibitionStatus(ex, buildToday);
      return s === "ongoing" || s === "upcoming";
    })
    .map((ex) => ({
      id: ex.id,
      title: ex.title,
      venue_id: ex.venue_id,
      start_date: ex.start_date,
      end_date: ex.end_date,
      ...(ex.status ? { status: ex.status } : {}),
    }));
  const usedVenueIds = new Set(mapExhibitions.map((ex) => ex.venue_id));
  return {
    venues: venues.filter((v) => usedVenueIds.has(v.id)).map(toMapVenue),
    exhibitions: mapExhibitions,
  };
}

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** 今日の日付で、開催中・開催予定の展覧会がある館のピンを作る。 */
export function mapPins(data: MapData, today: IsoDate): MapPin[] {
  const byVenue = new Map<string, MapPin["exhibitions"]>();
  for (const ex of data.exhibitions) {
    const s = exhibitionStatus(ex, today);
    if (s !== "ongoing" && s !== "upcoming") continue;
    const list = byVenue.get(ex.venue_id) ?? [];
    list.push({ ...ex, status: s });
    byVenue.set(ex.venue_id, list);
  }

  const pins: MapPin[] = [];
  for (const venue of data.venues) {
    const list = byVenue.get(venue.id);
    if (!list) continue;
    list.sort(
      (a, b) =>
        (a.status === b.status ? 0 : a.status === "ongoing" ? -1 : 1) ||
        compareText(a.start_date, b.start_date) ||
        compareText(a.id, b.id),
    );
    pins.push({
      venue,
      status: list.some((ex) => ex.status === "ongoing") ? "ongoing" : "upcoming",
      exhibitions: list,
    });
  }
  return pins;
}
