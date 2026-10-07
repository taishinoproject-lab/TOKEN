// data/*.json の型定義（data-model.md §3〜§7）。
// Astro の content collections（src/content.config.ts）と、検証スクリプト（scripts/validate-data.ts）の両方から使う。
import { z } from "zod";

const isValidIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const isoDateSchema = z
  .string()
  .refine(isValidIsoDate, { error: "日付は YYYY-MM-DD の形式で、実在する日付にしてください" });

const httpUrl = z.url({
  protocol: /^https?$/,
  error: (issue) => (issue.input === undefined ? "必須の URL がありません" : "http(s) の URL を指定してください"),
});

// IDの書式の判定は検証スクリプトで行う（エラーの文言をそろえるため）。ここでは空文字だけを拒否する。
const idSchema = z.string().min(1, { error: "id がありません" });

// 動作確認用のサンプルデータの印。本番データでは使わない。
const sampleFlag = { _sample: z.literal(true).optional() };

export const sourceSchema = z.strictObject({
  url: httpUrl,
  title: z.string().optional(),
  retrieved_at: isoDateSchema,
  quote: z.string().optional(),
});

export const confidenceSchema = z.enum(["confirmed", "unverified"]);

export const venueSchema = z.strictObject({
  id: idSchema,
  name: z.string().min(1),
  short_name: z.string().min(1),
  prefecture: z.string().min(1),
  city: z.string().min(1),
  address: z.string().optional(),
  lat: z.number({ error: "緯度（lat）がありません" }).min(-90).max(90),
  lng: z.number({ error: "経度（lng）がありません" }).min(-180).max(180),
  official_url: httpUrl,
  exhibitions_page_url: httpUrl.optional(),
  crawl: z
    .strictObject({
      enabled: z.boolean(),
      notes: z.string().optional(),
    })
    .optional(),
  verified_at: isoDateSchema,
  sources: z.array(sourceSchema),
  confidence: confidenceSchema,
  ...sampleFlag,
});

// 刀匠の登録の単位（D-012）。個人を特定できない作の帰属先として、流派単位の登録を認める。省略時は個人。
export const smithKindSchema = z.enum(["person", "school"]);

export const smithSchema = z.strictObject({
  id: idSchema,
  kind: smithKindSchema.optional(),
  name: z.string().min(1),
  reading: z.string().min(1),
  aliases: z.array(z.string()),
  generation: z.string().optional(),
  school: z.string().optional(),
  province: z.string().optional(),
  era: z.string().optional(),
  description: z.string().optional(),
  teacher_ids: z.array(z.string()).optional(),
  sources: z.array(sourceSchema),
  confidence: confidenceSchema,
  ...sampleFlag,
});

export const bladeTypeSchema = z.enum([
  "太刀",
  "刀",
  "脇指",
  "短刀",
  "大太刀",
  "薙刀",
  "槍",
  "剣",
  "その他",
]);

export const designationSchema = z.enum(["国宝", "重要文化財", "重要美術品", "御物", "未指定", "不明"]);

// 日本美術刀剣保存協会の認定（D-012）。国の指定（designation）とは別に持つ。
export const nbthkRankSchema = z.enum(["特別重要刀剣", "重要刀剣", "特別保存刀剣", "保存刀剣"]);

export const attributionBasisSchema = z.enum(["在銘", "極め", "伝"]);

export const swordSchema = z.strictObject({
  id: idSchema,
  go: z.string().min(1).nullable(),
  go_reading: z.string().min(1).nullable(),
  aliases: z.array(z.string()),
  blade_type: bladeTypeSchema,
  mei: z.string().min(1),
  mei_kind: z.string().optional(),
  attributions: z.array(
    z.strictObject({
      smith_id: z.string(),
      basis: attributionBasisSchema,
    }),
  ),
  designation: designationSchema,
  nbthk_rank: nbthkRankSchema.optional(),
  era: z.string().optional(),
  blade_length_cm: z.number().positive().optional(),
  sori_cm: z.number().nonnegative().optional(),
  holder_venue_id: z.string().optional(),
  holder_text: z.string().min(1),
  story: z.string().optional(),
  provenance: z.string().optional(),
  official_image_url: httpUrl.optional(),
  sources: z.array(sourceSchema),
  confidence: confidenceSchema,
  ...sampleFlag,
});

export const periodSchema = z.strictObject({
  id: z.string().min(1),
  start_date: isoDateSchema,
  end_date: isoDateSchema,
});

export const exhibitSchema = z.strictObject({
  label: z.string().min(1),
  sword_id: z.string().optional(),
  smith_id: z.string().optional(),
  period_ids: z.array(z.string()).optional(),
  note: z.string().optional(),
});

export const exhibitionSchema = z.strictObject({
  id: idSchema,
  title: z.string().min(1),
  venue_id: z.string(),
  room: z.string().optional(),
  start_date: isoDateSchema,
  // 終了日が分からない展示は null（D-012）。"9999-12-31" のような代用の値は使わない
  end_date: isoDateSchema.nullable(),
  status: z.enum(["cancelled", "postponed"]).optional(),
  official_url: httpUrl,
  flyer_url: httpUrl.optional(),
  list_url: httpUrl.optional(),
  admission: z.string().optional(),
  periods: z.array(periodSchema),
  exhibits: z.array(exhibitSchema),
  sources: z.array(sourceSchema),
  verified_at: isoDateSchema,
  confidence: confidenceSchema,
  ...sampleFlag,
});

export type Source = z.infer<typeof sourceSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Venue = z.infer<typeof venueSchema>;
export type SmithKind = z.infer<typeof smithKindSchema>;
export type Smith = z.infer<typeof smithSchema>;
export type BladeType = z.infer<typeof bladeTypeSchema>;
export type Designation = z.infer<typeof designationSchema>;
export type NbthkRank = z.infer<typeof nbthkRankSchema>;
export type AttributionBasis = z.infer<typeof attributionBasisSchema>;
export type Sword = z.infer<typeof swordSchema>;
export type Period = z.infer<typeof periodSchema>;
export type Exhibit = z.infer<typeof exhibitSchema>;
export type Exhibition = z.infer<typeof exhibitionSchema>;
