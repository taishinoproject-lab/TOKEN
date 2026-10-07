import { describe, expect, it } from "vitest";
import { bladeAndMei, swordDisplayName } from "./display-name";
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
