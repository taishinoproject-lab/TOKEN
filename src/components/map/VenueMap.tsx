// 1つの館の位置に1本のピンを立てる地図（館ページ・展覧会ページ）。Astro では client:only="react" で読み込む。
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { MapVenue } from "../../lib/map-data";
import { createBaseMap, el, isTouchFirst, pinIcon } from "./leaflet-setup";

interface Props {
  venue: MapVenue;
}

const VENUE_ZOOM = 15;

export default function VenueMap({ venue }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchFirst, setTouchFirst] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setTouchFirst(isTouchFirst());

    const map = createBaseMap(container);
    map.setView([venue.lat, venue.lng], VENUE_ZOOM);

    const popup = el(
      "div",
      {},
      el("strong", {}, venue.name),
      ...(venue.unverified ? [el("br"), el("span", { class: "token-unverified" }, "位置は要確認")] : []),
    );
    L.marker([venue.lat, venue.lng], {
      icon: pinIcon("venue"),
      title: venue.unverified ? `${venue.name}（位置は要確認）` : venue.name,
      alt: venue.name,
    })
      .bindPopup(popup)
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [venue]);

  return (
    <figure className="token-map">
      <div
        ref={containerRef}
        className="h-64 w-full border border-mokume sm:h-80"
        role="region"
        aria-label={`${venue.name}の位置を示す地図`}
      />
      <figcaption className="gothic mt-1 text-xs text-usuzumi">
        {venue.unverified && <span className="font-bold text-shu">位置は要確認。</span>}
        {touchFirst ? "地図は2本の指で動かせます。" : null}
      </figcaption>
    </figure>
  );
}
