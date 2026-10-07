import { describe, expect, it } from "vitest";
import { bladeAndMei, catalogSwordName, meiHead, smithDisplayName, swordDisplayName } from "./display-name";
import type { Sword } from "./schema";

const smiths = [
  { id: "sanjo-munechika", name: "三条宗近" },
  { id: "nobufusa", name: "信房" },
  { id: "masamune", name: "正宗" },
];

const base: Pick<Sword, "go" | "blade_type" | "mei" | "mei_kind" | "attributions"> = {
  go: null,
  blade_type: "太刀",
  mei: "",
  mei_kind: undefined,
  attributions: [],
};

describe("swordDisplayName（data-model.md §6.1）", () => {
  it("号がある刀は、見出しが号、副題が「種別＋銘」", () => {
    const name = swordDisplayName(
      { ...base, go: "三日月宗近", mei: "三条", mei_kind: "銘", attributions: [{ smith_id: "sanjo-munechika", basis: "在銘" }] },
      smiths,
    );
    expect(name).toEqual({ heading: "三日月宗近", subtitle: "太刀 銘 三条" });
  });

  it("号がない刀は、見出しが「種別＋銘」、副題が刀匠名", () => {
    const name = swordDisplayName(
      { ...base, mei: "信房作", mei_kind: "銘", attributions: [{ smith_id: "nobufusa", basis: "在銘" }] },
      smiths,
    );
    expect(name).toEqual({ heading: "太刀 銘 信房作", subtitle: "信房" });
  });

  it("無銘の刀は「種別 無銘」とし、刀匠名に帰属の根拠を添える", () => {
    const name = swordDisplayName(
      { ...base, blade_type: "刀", mei: "無銘", mei_kind: "無銘", attributions: [{ smith_id: "masamune", basis: "伝" }] },
      smiths,
    );
    expect(name).toEqual({ heading: "刀 無銘", subtitle: "伝 正宗" });
  });

  it("極めの刀匠には（極め）を付け、複数の帰属は「・」でつなぐ", () => {
    const name = swordDisplayName(
      {
        ...base,
        blade_type: "刀",
        mei: "正宗",
        mei_kind: "金象嵌銘",
        attributions: [
          { smith_id: "masamune", basis: "極め" },
          { smith_id: "nobufusa", basis: "在銘" },
        ],
      },
      smiths,
    );
    expect(name).toEqual({ heading: "刀 金象嵌銘 正宗", subtitle: "正宗（極め）・信房" });
  });

  it("号が空白だけなら、号がないものとして扱う", () => {
    expect(swordDisplayName({ ...base, go: "  ", mei: "安綱", mei_kind: "銘" }, smiths).heading).toBe("太刀 銘 安綱");
  });

  it("存在しない刀匠IDは副題に出さない", () => {
    const name = swordDisplayName({ ...base, mei: "安綱", attributions: [{ smith_id: "unknown", basis: "在銘" }] }, smiths);
    expect(name.subtitle).toBe("");
  });
});

describe("bladeAndMei", () => {
  it("mei_kind がなければ、種別と銘だけを並べる", () => {
    expect(bladeAndMei({ blade_type: "短刀", mei: "吉光" })).toBe("短刀 吉光");
  });
});

describe("smithDisplayName（D-012）", () => {
  it("流派単位の登録には「（流派）」を付け、個人はそのまま", () => {
    expect(smithDisplayName({ name: "架空一文字派", kind: "school" })).toBe("架空一文字派（流派）");
    expect(smithDisplayName({ name: "信房", kind: "person" })).toBe("信房");
    expect(smithDisplayName({ name: "信房" })).toBe("信房");
  });

  it("号がない刀の副題でも、流派であることが分かる", () => {
    const name = swordDisplayName(
      { ...base, mei: "一", mei_kind: "銘", attributions: [{ smith_id: "fx-school", basis: "在銘" }] },
      [{ id: "fx-school", name: "架空一文字派", kind: "school" }],
    );
    expect(name).toEqual({ heading: "太刀 銘 一", subtitle: "架空一文字派（流派）" });
  });
});

describe("meiHead（目録の見出しの銘）", () => {
  it("短い銘はそのまま", () => {
    expect(meiHead("三条")).toBe("三条");
    expect(meiHead("無銘")).toBe("無銘");
    expect(meiHead(" 信房作 ")).toBe("信房作");
  });

  it("「／」（表と裏の区切り）の前までにして、「…」を付ける", () => {
    expect(meiHead("来孫太郎作／（花押）正応五□辰八月十三日以下不明")).toBe("来孫太郎作…");
  });

  it("空白（全角・半角）の前までにする。年紀や追記は詳細で見せる", () => {
    expect(meiHead("備州長船盛光 応永十二年八月日")).toBe("備州長船盛光…");
    expect(meiHead("尻懸則長磨上之　本阿（花押）")).toBe("尻懸則長磨上之…");
  });

  it("区切りがなくても、12文字を超える部分は省略する", () => {
    expect(meiHead("一二三四五六七八九十一二")).toBe("一二三四五六七八九十一二");
    expect(meiHead("一二三四五六七八九十一二三")).toBe("一二三四五六七八九十一…");
  });
});

describe("catalogSwordName（目録の名前）", () => {
  it("号がない刀は、種別＋銘の先頭の部分だけを見出しにし、副題は空", () => {
    expect(
      catalogSwordName({ go: null, blade_type: "太刀", mei: "来孫太郎作／（花押）正応五□辰八月十三日以下不明", mei_kind: "銘" }),
    ).toEqual({ heading: "太刀 銘 来孫太郎作…", subtitle: "" });
    expect(catalogSwordName({ go: null, blade_type: "刀", mei: "無銘", mei_kind: "無銘" })).toEqual({
      heading: "刀 無銘",
      subtitle: "",
    });
  });

  it("号がある刀は、見出しが号、副題が種別＋銘（全文）", () => {
    expect(catalogSwordName({ go: "三日月宗近", blade_type: "太刀", mei: "三条", mei_kind: "銘" })).toEqual({
      heading: "三日月宗近",
      subtitle: "太刀 銘 三条",
    });
  });
});
