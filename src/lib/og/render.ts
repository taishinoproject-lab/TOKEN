// シェア用画像（T-208、OGP）を 1200×630 の PNG に描画する。satori で SVG にし、resvg で PNG にする。
import { Resvg } from "@resvg/resvg-js";
import { createElement } from "react";
import satori from "satori";
import type { OgCard } from "./card";
import type { LoadedOgFont } from "./fonts";
import OgImage from "./OgImage";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export async function renderOgPng(card: OgCard, fonts: LoadedOgFont[]): Promise<Buffer> {
  const svg = await satori(createElement(OgImage, { card }), { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } }).render().asPng();
}
