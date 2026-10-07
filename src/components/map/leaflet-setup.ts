// 地図の共通設定（D-005、T-206）。国土地理院の淡色地図を Leaflet で表示する。
// Leaflet はブラウザでしか動かないので、この部品を使うコンポーネントは Astro で client:only="react" で読み込む。
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map.css";

const GSI_PALE_URL = "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png";

// 地理院タイルの利用条件に合わせた出典表記。地理院タイル一覧のページへリンクする。
const GSI_ATTRIBUTION =
  '出典：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院（地理院タイル）</a>';

/** 日本全体が収まる位置（ピンがないときに使う）。 */
export const JAPAN_CENTER: L.LatLngTuple = [36.5, 137.5];
export const JAPAN_ZOOM = 5;

/**
 * タッチ操作が主の端末か。
 * この場合は1本の指でのドラッグで地図を動かさず、ページのスクロールを優先する（地図は2本の指で動かす）。
 */
export function isTouchFirst(): boolean {
  return L.Browser.mobile || window.matchMedia("(pointer: coarse)").matches;
}

export function createBaseMap(element: HTMLElement): L.Map {
  const touchFirst = isTouchFirst();
  const map = L.map(element, {
    center: JAPAN_CENTER,
    zoom: JAPAN_ZOOM,
    minZoom: 5,
    maxZoom: 18,
    // タッチ端末では1本の指のドラッグを無効にする。2本の指での拡大縮小・移動（touchZoom）は有効のまま。
    dragging: !touchFirst,
    touchZoom: true,
    // ページのスクロール中に地図が拡大縮小されないよう、マウスホイールでの拡大縮小は使わない（＋−ボタンとダブルクリックで操作する）。
    scrollWheelZoom: false,
  });
  // Leaflet の名前の表記は残し、既定で付く国旗の図柄だけを外す（D-014）。
  map.attributionControl.setPrefix(
    '<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>',
  );
  L.tileLayer(GSI_PALE_URL, {
    attribution: GSI_ATTRIBUTION,
    minZoom: 5,
    maxZoom: 18,
  }).addTo(map);
  return map;
}

export type PinKind = "ongoing" | "upcoming" | "venue";

/** CSS だけで描くピン（画像ファイルを使わない）。 */
export function pinIcon(kind: PinKind): L.DivIcon {
  return L.divIcon({
    className: `token-pin token-pin--${kind}`,
    html: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

/** 要素を作る小さな関数。ポップアップの中身を、文字列の HTML ではなく DOM で組み立てるために使う。 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<Record<string, string>> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value !== undefined) node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}
