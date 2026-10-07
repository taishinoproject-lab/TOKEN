// 検索のテスト（data-model.md §10.3 の例）。
// ここで使う刀剣・刀匠は、テスト用の架空データ（fixture）であり、史実を表すものではない。
import { describe, expect, it } from "vitest";
import type { Smith, Sword } from "./schema";
import { MatchLevel, attributionLabels, buildSearchIndex, searchIndex } from "./search";

type SmithFixture = Pick<Smith, "id" | "name" | "reading" | "aliases" | "generation" | "school">;
type SwordFixture = Pick<
  Sword,
  "id" | "go" | "go_reading" | "aliases" | "blade_type" | "mei" | "mei_kind" | "attributions"
>;

const smith = (id: string, name: string, reading: string, extra: Partial<SmithFixture> = {}): SmithFixture => ({
  id,
  name,
  reading,
  aliases: [],
  ...extra,
});

const sword = (id: string, fields: Partial<SwordFixture>): SwordFixture => ({
  id,
  go: null,
  go_reading: null,
  aliases: [],
  blade_type: "太刀",
  mei: "無銘",
  mei_kind: "銘",
  attributions: [],
  ...fields,
});

const smiths: SmithFixture[] = [
  smith("fx-masamune", "正宗", "まさむね", { aliases: ["相州正宗"], school: "相州伝" }),
  smith("fx-sadamune", "貞宗", "さだむね", { school: "相州伝" }),
  smith("fx-nobufusa", "信房", "のぶふさ"),
  smith("fx-yasutsuna", "安綱", "やすつな"),
  smith("fx-kunihiro", "国広", "くにひろ"),
  smith("fx-muramasa", "村正", "むらまさ"),
];

const swords: SwordFixture[] = [
  sword("fx-hocho", {
    go: "庖丁正宗",
    go_reading: "ほうちょうまさむね",
    blade_type: "短刀",
    mei: "無銘",
    mei_kind: "無銘",
    attributions: [{ smith_id: "fx-masamune", basis: "極め" }],
  }),
  sword("fx-fudo", {
    go: "不動正宗",
    go_reading: "ふどうまさむね",
    blade_type: "短刀",
    mei: "正宗",
    attributions: [{ smith_id: "fx-masamune", basis: "在銘" }],
  }),
  sword("fx-den-masamune", {
    blade_type: "刀",
    mei: "無銘",
    mei_kind: "無銘",
    attributions: [{ smith_id: "fx-masamune", basis: "伝" }],
  }),
  // 号に「正宗」を含むが、正宗に帰属しない刀（架空）
  sword("fx-other-masamune", {
    go: "架空正宗",
    go_reading: "かくうまさむね",
    blade_type: "刀",
    mei: "村正",
    attributions: [{ smith_id: "fx-muramasa", basis: "在銘" }],
  }),
  sword("fx-nobufusa-1", {
    mei: "信房作",
    attributions: [{ smith_id: "fx-nobufusa", basis: "在銘" }],
  }),
  sword("fx-nobufusa-2", {
    go: "架空丸",
    go_reading: "かくうまる",
    mei: "信房",
    attributions: [{ smith_id: "fx-nobufusa", basis: "在銘" }],
  }),
  sword("fx-onikirimaru", {
    go: "鬼切丸",
    go_reading: "おにきりまる",
    aliases: ["髭切"],
    mei: "安綱",
    attributions: [{ smith_id: "fx-yasutsuna", basis: "伝" }],
  }),
  sword("fx-kunihiro-1", {
    blade_type: "脇指",
    mei: "國廣",
    attributions: [{ smith_id: "fx-kunihiro", basis: "在銘" }],
  }),
];

const index = buildSearchIndex(swords, smiths);
const ids = (hits: { sword: { id: string } }[]) => hits.map((h) => h.sword.id);

describe("searchIndex（data-model.md §10.3 の例）", () => {
  it("庖丁正宗：号が完全一致した1振りを最上位に強調する", () => {
    const r = searchIndex(index, "庖丁正宗");
    expect(r.featured?.sword.id).toBe("fx-hocho");
    expect(r.featured?.level).toBe(MatchLevel.Exact);
    expect(ids(r.swords)).not.toContain("fx-hocho");
    expect(r.smiths).toEqual([]);
  });

  it("号の読みで検索しても、カタカナでも、その刀が強調される", () => {
    expect(searchIndex(index, "ほうちょうまさむね").featured?.sword.id).toBe("fx-hocho");
    expect(searchIndex(index, "ホウチョウマサムネ").featured?.sword.id).toBe("fx-hocho");
  });

  it("正宗：①刀匠「正宗」→ ②正宗に帰属する刀（在銘・極め・伝の順）→ ③号に「正宗」を含むその他の刀", () => {
    const r = searchIndex(index, "正宗");
    expect(r.featured).toBeNull();
    expect(r.smithsFirst).toBe(true);
    expect(r.smiths[0]).toMatchObject({ smith: { id: "fx-masamune" }, level: MatchLevel.Exact });
    expect(ids(r.swords)).toEqual(["fx-fudo", "fx-hocho", "fx-den-masamune", "fx-other-masamune"]);
    expect(r.swords.slice(0, 3).every((h) => h.viaSmith)).toBe(true);
    expect(r.swords[3]).toMatchObject({ viaSmith: false, level: MatchLevel.Partial });
    // 帰属の区別を添える
    expect(attributionLabels(r.swords[0].sword)).toEqual(["正宗（在銘）"]);
    expect(attributionLabels(r.swords[1].sword)).toEqual(["正宗（極め）"]);
    expect(attributionLabels(r.swords[2].sword)).toEqual(["正宗（伝）"]);
  });

  it("信房：①刀匠「信房」→ ②その刀匠の刀（号のない刀も含む）", () => {
    const r = searchIndex(index, "信房");
    expect(r.smiths.map((h) => h.smith.id)).toEqual(["fx-nobufusa"]);
    expect(r.smithsFirst).toBe(true);
    expect(ids(r.swords).sort()).toEqual(["fx-nobufusa-1", "fx-nobufusa-2"]);
    const noGo = r.swords.find((h) => h.sword.id === "fx-nobufusa-1");
    expect(noGo?.sword.heading).toBe("太刀 銘 信房作");
    expect(noGo?.level).toBe(MatchLevel.Exact);
  });

  it("髭切：別名が一致した刀（鬼切丸）を表示する", () => {
    const r = searchIndex(index, "髭切");
    expect(ids(r.swords)).toEqual(["fx-onikirimaru"]);
    expect(r.swords[0].level).toBe(MatchLevel.Exact);
    expect(r.swords[0].sword.heading).toBe("鬼切丸");
  });
});

describe("searchIndex（表記ゆれと順位）", () => {
  it("旧字体で検索しても見つかる（「國廣」で「国広」）", () => {
    const r = searchIndex(index, "國廣");
    expect(r.smiths.map((h) => h.smith.id)).toEqual(["fx-kunihiro"]);
    expect(r.smiths[0].level).toBe(MatchLevel.Exact);
    expect(ids(r.swords)).toEqual(["fx-kunihiro-1"]);
  });

  it("データ側が旧字体でも、新字体で検索して見つかる（銘「國廣」を「国広」で）", () => {
    const r = searchIndex(index, "国広");
    expect(ids(r.swords)).toEqual(["fx-kunihiro-1"]);
  });

  it("完全一致 ＞ 前方一致 ＞ 部分一致", () => {
    // 「まさ」は 正宗（まさむね）に前方一致、村正（むらまさ）に部分一致
    const r = searchIndex(index, "まさ");
    expect(r.smiths.map((h) => [h.smith.id, h.level])).toEqual([
      ["fx-masamune", MatchLevel.Prefix],
      ["fx-muramasa", MatchLevel.Partial],
    ]);
  });

  it("同じ順位では刀匠を刀剣より上に出す", () => {
    // 「村正」は刀匠の名前にも、刀の銘にも完全一致する
    const r = searchIndex(index, "村正");
    expect(r.smiths[0].level).toBe(MatchLevel.Exact);
    expect(r.swords[0].level).toBe(MatchLevel.Exact);
    expect(r.smithsFirst).toBe(true);
  });

  it("刀剣のほうが上位の一致なら、刀剣を先に出す", () => {
    // 「架空丸」は号に完全一致し、刀匠には一致しない
    const r = searchIndex(index, "架空丸");
    expect(r.featured?.sword.id).toBe("fx-nobufusa-2");
    expect(r.smiths).toEqual([]);
    expect(r.smithsFirst).toBe(false);
  });

  it("号の完全一致が2件以上あるときは強調しない", () => {
    const dup = buildSearchIndex(
      [sword("a", { go: "同名", go_reading: "どうめい" }), sword("b", { go: "同名", go_reading: "どうめい" })],
      [],
    );
    const r = searchIndex(dup, "同名");
    expect(r.featured).toBeNull();
    expect(ids(r.swords)).toEqual(["a", "b"]);
  });

  it("流派名でも刀匠が見つかる", () => {
    const r = searchIndex(index, "相州");
    expect(r.smiths.map((h) => h.smith.id).sort()).toEqual(["fx-masamune", "fx-sadamune"]);
  });

  it("空の検索語・空白だけの検索語では何も返さない", () => {
    for (const q of ["", "  ", "　"]) {
      const r = searchIndex(index, q);
      expect(r.smiths).toEqual([]);
      expect(r.swords).toEqual([]);
      expect(r.featured).toBeNull();
    }
  });

  it("インデックスは JSON にしても同じ結果になる", () => {
    const roundTrip = JSON.parse(JSON.stringify(index));
    expect(searchIndex(roundTrip, "正宗")).toEqual(searchIndex(index, "正宗"));
  });
});
