import { describe, expect, it } from "vitest";
import { catalogNumber, hasDesignationMark, latestRetrievedAt, meiText, uniqueSources } from "./ui-format";

describe("ui-format", () => {
  it("目録の番号を2桁にそろえる", () => {
    expect(catalogNumber(0)).toBe("01");
    expect(catalogNumber(11)).toBe("12");
    expect(catalogNumber(99)).toBe("100");
  });

  it("未指定・不明には指定の印を出さない", () => {
    expect(hasDesignationMark("国宝")).toBe(true);
    expect(hasDesignationMark("未指定")).toBe(false);
    expect(hasDesignationMark("不明")).toBe(false);
    expect(hasDesignationMark(null)).toBe(false);
  });

  it("銘の種類が「銘」なら銘文だけ、それ以外は前に付ける", () => {
    expect(meiText({ mei: "三条", mei_kind: "銘" })).toBe("三条");
    expect(meiText({ mei: "正宗磨上／本阿弥（花押）", mei_kind: "金象嵌銘" })).toBe("金象嵌銘 正宗磨上／本阿弥（花押）");
    expect(meiText({ mei: "無銘", mei_kind: "無銘" })).toBe("無銘");
    expect(meiText({ mei: "安綱" })).toBe("安綱");
  });

  it("出典の取得日のいちばん新しい日", () => {
    expect(latestRetrievedAt([{ retrieved_at: "2026-10-01" }, { retrieved_at: "2026-10-07" }, { retrieved_at: "2026-09-30" }])).toBe(
      "2026-10-07",
    );
    expect(latestRetrievedAt([])).toBeUndefined();
  });

  it("同じURLと名前の出典を1つにまとめ、新しい取得日を残す", () => {
    const result = uniqueSources([
      { url: "https://a.example/", title: "A", retrieved_at: "2026-10-01" },
      { url: "https://b.example/", retrieved_at: "2026-10-01" },
      { url: "https://a.example/", title: "A", retrieved_at: "2026-10-07" },
      { url: "https://a.example/", title: "別名", retrieved_at: "2026-10-01" },
    ]);
    expect(result).toEqual([
      { url: "https://a.example/", title: "A", retrieved_at: "2026-10-07" },
      { url: "https://b.example/", retrieved_at: "2026-10-01" },
      { url: "https://a.example/", title: "別名", retrieved_at: "2026-10-01" },
    ]);
  });
});
