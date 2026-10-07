import { describe, expect, it } from "vitest";
import type { Exhibit } from "./schema";
import { validateData, type RawData } from "./validate";

const today = "2026-10-07";

function validData() {
  return {
    venues: [
      {
        id: "museum-a",
        name: "A館",
        short_name: "A",
        prefecture: "東京都",
        city: "台東区",
        lat: 35.7,
        lng: 139.7,
        official_url: "https://example.com/a",
        verified_at: today,
        sources: [{ url: "https://example.com/a", retrieved_at: today }],
        confidence: "confirmed",
      },
    ],
    smiths: [
      {
        id: "smith-a",
        name: "甲",
        reading: "こう",
        aliases: [],
        sources: [{ url: "https://example.com/s", retrieved_at: today }],
        confidence: "confirmed",
      },
    ],
    swords: [
      {
        id: "sword-a",
        go: "見本丸",
        go_reading: "みほんまる",
        aliases: [],
        blade_type: "太刀",
        mei: "甲",
        mei_kind: "銘",
        attributions: [{ smith_id: "smith-a", basis: "在銘" }],
        designation: "未指定",
        holder_venue_id: "museum-a",
        holder_text: "A館",
        sources: [{ url: "https://example.com/w", retrieved_at: today }],
        confidence: "confirmed",
      },
    ],
    exhibitions: [
      {
        id: "2026-museum-a-ten",
        title: "名刀展",
        venue_id: "museum-a",
        start_date: "2026-09-01",
        end_date: "2026-12-20",
        official_url: "https://example.com/ten",
        periods: [
          { id: "前期", start_date: "2026-09-01", end_date: "2026-10-31" },
          { id: "後期", start_date: "2026-11-01", end_date: "2026-12-20" },
        ],
        exhibits: [{ label: "太刀 銘 甲", sword_id: "sword-a", period_ids: ["前期"] }] as Exhibit[],
        sources: [{ url: "https://example.com/ten", retrieved_at: today }],
        verified_at: today,
        confidence: "confirmed",
      },
    ],
  };
}

type Data = ReturnType<typeof validData>;

function run(mutate: (d: Data) => void) {
  const data = validData();
  mutate(data);
  return validateData(data as RawData, today);
}

const messages = (issues: { message: string }[]) => issues.map((i) => i.message);

describe("validateData（data-model.md §12）", () => {
  it("正しいデータではエラーも警告も出ない", () => {
    expect(validateData(validData(), today)).toEqual({ errors: [], warnings: [] });
  });

  describe("エラー", () => {
    it("IDの重複", () => {
      const { errors } = run((d) => d.smiths.push({ ...d.smiths[0] }));
      expect(errors).toContainEqual(expect.objectContaining({ file: "smiths.json", target: "smith-a", message: "IDが重複しています" }));
    });

    it("IDの書式違反", () => {
      const { errors } = run((d) => {
        d.venues[0].id = "Museum_A";
        d.swords[0].holder_venue_id = "Museum_A";
        d.exhibitions[0].venue_id = "Museum_A";
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("英小文字・数字・ハイフン以外");
    });

    it("参照切れ（venue_id・smith_id・sword_id・period_ids・teacher_ids・holder_venue_id）", () => {
      const { errors } = run((d) => {
        d.exhibitions[0].venue_id = "no-venue";
        d.swords[0].attributions[0].smith_id = "no-smith";
        d.swords[0].holder_venue_id = "no-venue";
        Object.assign(d.smiths[0], { teacher_ids: ["no-teacher"] });
        d.exhibitions[0].exhibits.push({ label: "x", sword_id: "no-sword", period_ids: ["中期"] });
        d.exhibitions[0].exhibits.push({ label: "y", smith_id: "no-smith" });
      });
      const msgs = messages(errors);
      expect(msgs).toContain('venue_id の館 "no-venue" が存在しません');
      expect(msgs).toContain('attributions の刀匠 "no-smith" が存在しません');
      expect(msgs).toContain('holder_venue_id の館 "no-venue" が存在しません');
      expect(msgs).toContain('teacher_ids の刀匠 "no-teacher" が存在しません');
      expect(msgs).toContain('sword_id の刀剣 "no-sword" が存在しません');
      expect(msgs).toContain('period_ids の展示期間 "中期" が存在しません');
      expect(msgs).toContain('smith_id の刀匠 "no-smith" が存在しません');
      expect(errors).toHaveLength(7);
    });

    it("会期の日付の逆転", () => {
      const { errors } = run((d) => {
        d.exhibitions[0].start_date = "2026-12-21";
      });
      expect(messages(errors)).toContain("会期の開始日（2026-12-21）が終了日（2026-12-20）より後です");
    });

    it("展示期間の日付の逆転", () => {
      const { errors } = run((d) => {
        d.exhibitions[0].periods[0] = { id: "前期", start_date: "2026-10-31", end_date: "2026-10-01" };
      });
      expect(messages(errors)).toContain("展示期間「前期」の開始日（2026-10-31）が終了日（2026-10-01）より後です");
    });

    it("展示期間が会期の外にはみ出している", () => {
      const { errors } = run((d) => {
        d.exhibitions[0].periods[1].end_date = "2026-12-25";
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain("展示期間「後期」（2026-11-01〜2026-12-25）が会期（2026-09-01〜2026-12-20）の外にはみ出しています");
    });

    it("館に lat / lng がない", () => {
      const { errors } = run((d) => {
        delete (d.venues[0] as Partial<Data["venues"][0]>).lat;
      });
      expect(errors).toEqual([{ file: "venues.json", target: "museum-a", message: "lat: 緯度（lat）がありません" }]);
    });

    it("展覧会に official_url がない", () => {
      const { errors } = run((d) => {
        delete (d.exhibitions[0] as Partial<Data["exhibitions"][0]>).official_url;
      });
      expect(errors).toEqual([
        { file: "exhibitions.json", target: "2026-museum-a-ten", message: "official_url: 必須の URL がありません" },
      ]);
    });

    it('confidence: "confirmed" なのに sources が空', () => {
      const { errors } = run((d) => {
        d.swords[0].sources = [];
      });
      expect(messages(errors)).toContain('confidence が "confirmed" なのに sources が空です');
    });

    it("定義にない項目や、存在しない日付はエラーにする", () => {
      const { errors } = run((d) => {
        Object.assign(d.swords[0], { media_appearance: "x" });
        d.exhibitions[0].verified_at = "2026-02-30";
      });
      expect(errors).toHaveLength(2);
    });

    it("_sample: true は許容する", () => {
      const { errors, warnings } = run((d) => {
        Object.assign(d.swords[0], { _sample: true });
      });
      expect(errors).toEqual([]);
      expect(messages(warnings)[0]).toContain("サンプルデータ");
    });

    it("ファイルが配列でない", () => {
      const { errors } = run((d) => {
        (d as unknown as { venues: unknown }).venues = {};
      });
      expect(messages(errors)).toContain("オブジェクトの配列ではありません");
    });
  });

  describe("終了日が未定の展覧会（D-012）", () => {
    const openEnded = (d: Data) => Object.assign(d.exhibitions[0], { end_date: null });

    it("end_date: null は受け付け、日付の逆転・はみ出しの判定をしない。未定であることを警告する", () => {
      const { errors, warnings } = run((d) => {
        openEnded(d);
        d.exhibitions[0].periods[1].end_date = "2027-06-30";
      });
      expect(errors).toEqual([]);
      expect(warnings).toEqual([
        {
          file: "exhibitions.json",
          target: "2026-museum-a-ten",
          message: "会期の終了日が未定です（end_date: null）。公式サイトで確認してください",
        },
      ]);
    });

    it("展示期間が会期の開始日より前なら、終了日が未定でもエラー", () => {
      const { errors } = run((d) => {
        openEnded(d);
        d.exhibitions[0].periods[0].start_date = "2026-08-01";
      });
      expect(messages(errors)).toContain(
        "展示期間「前期」（2026-08-01〜2026-10-31）が会期（2026-09-01〜終了日未定）の外にはみ出しています",
      );
    });

    it("開催中なら、終了日が未定でも verified_at の古さを警告する", () => {
      const { warnings } = run((d) => {
        openEnded(d);
        d.exhibitions[0].verified_at = "2026-09-01";
      });
      expect(messages(warnings)).toContain("開催中・開催予定の展覧会ですが、最終確認日（2026-09-01）が14日より前です");
    });

    it("end_date の省略はエラー（未定なら null と明示する）", () => {
      const { errors } = run((d) => {
        delete (d.exhibitions[0] as Partial<Data["exhibitions"][0]>).end_date;
      });
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/^end_date: /);
    });

    it("9999-12-31 のような代用の値はエラー", () => {
      const { errors } = run((d) => {
        d.exhibitions[0].end_date = "9999-12-31";
      });
      expect(messages(errors)).toEqual([
        "会期の終了日（9999-12-31）は代用の値と思われます。終了日が分からない場合は、会期の end_date を null にしてください",
      ]);
    });
  });

  describe("刀剣の認定・流派単位の刀匠（D-012）", () => {
    it("nbthk_rank は4つの値だけを受け付ける", () => {
      expect(run((d) => Object.assign(d.swords[0], { nbthk_rank: "特別重要刀剣" })).errors).toEqual([]);
      expect(run((d) => Object.assign(d.swords[0], { nbthk_rank: "保存刀剣" })).errors).toEqual([]);
      const { errors } = run((d) => Object.assign(d.swords[0], { nbthk_rank: "国宝" }));
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/^nbthk_rank: /);
    });

    it("刀匠の kind は person か school", () => {
      expect(run((d) => Object.assign(d.smiths[0], { kind: "school" })).errors).toEqual([]);
      expect(run((d) => Object.assign(d.smiths[0], { kind: "person" })).errors).toEqual([]);
      const { errors } = run((d) => Object.assign(d.smiths[0], { kind: "group" }));
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toMatch(/^kind: /);
    });
  });

  describe("警告", () => {
    it("開催中・開催予定の展覧会で verified_at が14日より古い", () => {
      expect(run((d) => (d.exhibitions[0].verified_at = "2026-09-23")).warnings).toEqual([]);
      const { errors, warnings } = run((d) => (d.exhibitions[0].verified_at = "2026-09-22"));
      expect(errors).toEqual([]);
      expect(messages(warnings)).toEqual(["開催中・開催予定の展覧会ですが、最終確認日（2026-09-22）が14日より前です"]);
    });

    it("終了した展覧会では verified_at の古さを警告しない", () => {
      const { warnings } = run((d) => {
        d.exhibitions[0].verified_at = "2026-01-01";
        d.exhibitions[0].start_date = "2026-01-01";
        d.exhibitions[0].end_date = "2026-01-31";
        d.exhibitions[0].periods = [];
        d.exhibitions[0].exhibits[0].period_ids = [];
      });
      expect(warnings).toEqual([]);
    });

    it("出品リストの半分を超える行が、刀剣にも刀匠にもリンクしていない", () => {
      const { warnings } = run((d) => {
        d.exhibitions[0].exhibits.push({ label: "刀装具" });
        d.exhibitions[0].exhibits.push({ label: "新作日本刀" });
      });
      expect(messages(warnings)).toEqual(["出品リスト3件のうち2件が、刀剣にも刀匠にもリンクしていません"]);
    });

    it('confidence: "unverified" のデータ', () => {
      const { errors, warnings } = run((d) => {
        d.smiths[0].confidence = "unverified";
        d.smiths[0].sources = [];
      });
      expect(errors).toEqual([]);
      expect(warnings).toEqual([{ file: "smiths.json", target: "smith-a", message: '未確認のデータです（confidence: "unverified"）' }]);
    });
  });
});
