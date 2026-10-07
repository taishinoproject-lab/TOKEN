// 刀匠のシェア用画像（/og/smiths/{id}.png、1200×630）。ビルド時に全刀匠ぶんを生成する（T-208）。
import type { APIRoute, GetStaticPaths } from "astro";
import { ogPaths, ogResponse } from "../../../lib/og/build";

export const getStaticPaths = (() => ogPaths("smiths")) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => ogResponse("smiths", params.id);
