// 展覧会のシェア用画像（/og/exhibitions/{id}.png、1200×630）。ビルド時に全展覧会ぶんを生成する（T-208）。
import type { APIRoute, GetStaticPaths } from "astro";
import { ogPaths, ogResponse } from "../../../lib/og/build";

export const getStaticPaths = (() => ogPaths("exhibitions")) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => ogResponse("exhibitions", params.id);
