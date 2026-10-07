// 全国地図（/map）。開催中・開催予定の展覧会がある館すべてにピンを立てる。Astro では client:only="react" で読み込む。
// ビルド時に埋め込んだデータを、ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { formatDateRange, todayJst, type IsoDate } from "../../lib/date";
import { mapPins, type MapData, type MapPin } from "../../lib/map-data";
import { exhibitionStatusLabel } from "../../lib/status";
import { exhibitionStatusView, formatSession } from "../../lib/status-view";
import StatusBadge from "../ui/StatusBadge";
import UnverifiedBadge from "../ui/UnverifiedBadge";
import { createBaseMap, el, isTouchFirst, JAPAN_CENTER, JAPAN_ZOOM, pinIcon } from "./leaflet-setup";

interface Props {
  data: MapData;
  buildToday: IsoDate;
}

const period = (ex: { start_date: IsoDate; end_date: IsoDate | null }) => formatDateRange(ex.start_date, ex.end_date);

function popupContent(pin: MapPin): HTMLElement {
  return el(
    "div",
    {},
    el("a", { href: `/venues/${pin.venue.id}` }, el("strong", {}, pin.venue.name)),
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

  // ピンは今日の日付が決まるたびに置き直す
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    for (const pin of pins) {
      const label = `${pin.venue.name}（${exhibitionStatusLabel[pin.status]}${pin.venue.unverified ? "・位置は要確認" : ""}）`;
      L.marker([pin.venue.lat, pin.venue.lng], {
        icon: pinIcon(pin.status),
        title: label,
        alt: label,
        // 開催中のピンを開催予定のピンより手前に出す
        zIndexOffset: pin.status === "ongoing" ? 1000 : 0,
      })
        .bindPopup(popupContent(pin), { maxWidth: 260, autoPanPadding: [16, 16] })
        .addTo(layer);
    }
    if (pins.length > 0) {
      map.fitBounds(L.latLngBounds(pins.map((p) => [p.venue.lat, p.venue.lng])), { padding: [24, 24], maxZoom: 12 });
    } else {
      map.setView(JAPAN_CENTER, JAPAN_ZOOM);
    }
  }, [pins]);

  return (
    <div className="token-map">
      <div
        ref={containerRef}
        className="h-[70vh] max-h-[640px] min-h-80 w-full border border-mokume"
        role="region"
        aria-label="開催中・開催予定の展覧会がある館の地図"
      />
      <ul className="map-legend" aria-label="ピンの凡例">
        <li>
          <span className="token-pin-swatch token-pin--ongoing" aria-hidden="true" /> 開催中の展覧会がある館
        </li>
        <li>
          <span className="token-pin-swatch token-pin--upcoming" aria-hidden="true" /> 開催予定の展覧会だけがある館
        </li>
      </ul>
      {touchFirst && <p className="note-line">地図は2本の指で動かせます。ピンを押すと展覧会が表示されます。</p>}

      <section className="sec" aria-labelledby="h-map-venues">
        <div className="sec-h">
          <h2 id="h-map-venues">館の一覧</h2>
          <span className="aside">
            {pins.length}館 ／ 開催中・開催予定の展覧会
          </span>
        </div>
        {pins.length === 0 ? (
          <p className="gothic mt-4 text-sm">開催中・開催予定の展覧会はありません。</p>
        ) : (
          <ul className="map-venues">
            {pins.map((pin) => (
              <li key={pin.venue.id}>
                <h3>
                  <a href={`/venues/${pin.venue.id}`}>{pin.venue.name}</a>
                  {pin.venue.unverified && <UnverifiedBadge title="館の位置は、出典での確認がまだ済んでいません" />}
                </h3>
                <ul>
                  {pin.exhibitions.map((ex) => (
                    <li key={ex.id} data-status={ex.status}>
                      <StatusBadge tone={exhibitionStatusView(ex.status).tone} size="sm">
                        {exhibitionStatusLabel[ex.status]}
                      </StatusBadge>{" "}
                      <a href={`/exhibitions/${ex.id}`}>{ex.title}</a>
                      <span className="map-session">{formatSession(ex.start_date, ex.end_date)}</span>
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
