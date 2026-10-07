// 刀剣のシェア用画像（/og/swords/{id}.png、1200×630）。ビルド時に全刀剣ぶんを生成する（T-208）。
import type { APIRoute, GetStaticPaths } from "astro";
import { ogPaths, ogResponse } from "../../../lib/og/build";

export const getStaticPaths = (() => ogPaths("swords")) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => ogResponse("swords", params.id);
