// 全国地図（/map）。開催中・開催予定の展覧会がある館すべてにピンを立てる。Astro では client:only="react" で読み込む。
// ビルド時に埋め込んだデータを、ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { formatDateRange, todayJst, type IsoDate } from "../../lib/date";
import { mapPins, type MapData, type MapPin } from "../../lib/map-data";
import { exhibitionStatusLabel } from "../../lib/status";
import { visitedVenueIds } from "../../lib/visits";
import { useVisits } from "../visits/useVisits";
import { createBaseMap, el, isTouchFirst, JAPAN_CENTER, JAPAN_ZOOM, pinIcon } from "./leaflet-setup";

interface Props {
  data: MapData;
  buildToday: IsoDate;
}

const period = (ex: { start_date: IsoDate; end_date: IsoDate | null }) => formatDateRange(ex.start_date, ex.end_date);

function popupContent(pin: MapPin, visited: boolean): HTMLElement {
  return el(
    "div",
    {},
    el("a", { href: `/venues/${pin.venue.id}` }, el("strong", {}, pin.venue.name)),
    // 訪剣帖（T-210）に記録がある館
    ...(visited ? [" ", el("span", { class: "token-visited" }, "訪問済み")] : []),
    ...(pin.venue.unverified ? [el("br"), el("span", { class: "token-unverified" }, "位置は要確認")] : []),
    el(
      "ul",
      { class: "mt-1 list-disc pl-4" },
      ...pin.exhibitions.map((ex) =>
        el(
          "li",
          {},
          `［${exhibitionStatusLabel[ex.status]}］`,
          el("a", { href: `/exhibitions/${ex.id}` }, ex.title),
          `（${period(ex)}）`,
        ),
      ),
    ),
  );
}

export default function ExhibitionMap({ data, buildToday }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [today, setToday] = useState(buildToday);
  const [touchFirst, setTouchFirst] = useState(false);
  const pins = useMemo(() => mapPins(data, today), [data, today]);
  const { visits } = useVisits();
  const visited = useMemo(() => visitedVenueIds(visits), [visits]);
  // 訪剣帖の記録が変わっただけのときは、地図の表示範囲を動かさない
  const fittedPinsRef = useRef<MapPin[] | null>(null);

  useEffect(() => {
    setToday(todayJst());
    setTouchFirst(isTouchFirst());
  }, []);

  // 地図は1回だけ作る
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = createBaseMap(container);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // ピンは、今日の日付が決まったときと、訪剣帖の記録が変わったときに置き直す
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    for (const pin of pins) {
      const isVisited = visited.has(pin.venue.id);
      const label = `${pin.venue.name}（${exhibitionStatusLabel[pin.status]}${isVisited ? "・訪問済み" : ""}${pin.venue.unverified ? "・位置は要確認" : ""}）`;
      L.marker([pin.venue.lat, pin.venue.lng], {
        icon: pinIcon(pin.status),
        title: label,
        alt: label,
        // 開催中のピンを開催予定のピンより手前に出す
        zIndexOffset: pin.status === "ongoing" ? 1000 : 0,
      })
        .bindPopup(popupContent(pin, isVisited), { maxWidth: 260, autoPanPadding: [16, 16] })
        .addTo(layer);
    }
    if (fittedPinsRef.current === pins) return;
    fittedPinsRef.current = pins;
    if (pins.length > 0) {
      map.fitBounds(L.latLngBounds(pins.map((p) => [p.venue.lat, p.venue.lng])), { padding: [24, 24], maxZoom: 12 });
    } else {
      map.setView(JAPAN_CENTER, JAPAN_ZOOM);
    }
  }, [pins, visited]);

  return (
    <div className="token-map">
      <div
        ref={containerRef}
        className="h-[70vh] max-h-[640px] min-h-80 w-full border border-brand-text/20"
        role="region"
        aria-label="開催中・開催予定の展覧会がある館の地図"
      />
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>
          <span className="token-pin-swatch bg-brand-accent" aria-hidden="true" /> 開催中の展覧会がある館
        </span>
        <span>
          <span className="token-pin-swatch bg-brand-primary" aria-hidden="true" /> 開催予定の展覧会だけがある館
        </span>
      </p>
      {touchFirst && <p className="mt-1 text-sm">地図は2本の指で動かせます。ピンを押すと展覧会が表示されます。</p>}

      <section className="mt-6">
        <h2 className="mb-2 text-lg">館の一覧</h2>
        {pins.length === 0 ? (
          <p>開催中・開催予定の展覧会はありません。</p>
        ) : (
          <ul className="space-y-3">
            {pins.map((pin) => (
              <li key={pin.venue.id}>
                <a href={`/venues/${pin.venue.id}`} className="font-serif font-semibold underline">
                  {pin.venue.name}
                </a>
                {pin.venue.unverified && <span className="ml-2 text-sm font-bold text-brand-accent">位置は要確認</span>}
                <ul className="list-disc pl-5">
                  {pin.exhibitions.map((ex) => (
                    <li key={ex.id}>
                      <span data-status={ex.status}>［{exhibitionStatusLabel[ex.status]}］</span>
                      <a href={`/exhibitions/${ex.id}`} className="underline">
                        {ex.title}
                      </a>
                      （{period(ex)}）
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
