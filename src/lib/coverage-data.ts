// 収録範囲（D-024）を、ビルド時に data/venues.json と巡回の結果から組み立てる。
import { getCollection } from "astro:content";
import manifest from "../../crawl/snapshots/manifest.json";
import { buildCoverage, type Coverage } from "./coverage";

let cache: Promise<Coverage> | undefined;

export function loadCoverage(): Promise<Coverage> {
  cache ??= getCollection("venues").then((items) =>
    buildCoverage(
      items.map((e) => e.data),
      manifest.entries,
    ),
  );
  return cache;
}
