// data/*.json を Astro の content collections として読み込む（data-model.md §2）。
// 型は src/lib/schema.ts で定義し、検証スクリプト（scripts/validate-data.ts）と共有する。
import { defineCollection } from "astro:content";
import { file } from "astro/loaders";
import { exhibitionSchema, smithSchema, swordSchema, venueSchema } from "./lib/schema";

const venues = defineCollection({ loader: file("data/venues.json"), schema: venueSchema });
const smiths = defineCollection({ loader: file("data/smiths.json"), schema: smithSchema });
const swords = defineCollection({ loader: file("data/swords.json"), schema: swordSchema });
const exhibitions = defineCollection({ loader: file("data/exhibitions.json"), schema: exhibitionSchema });

export const collections = { venues, smiths, swords, exhibitions };
