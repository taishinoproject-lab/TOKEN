import { describe, expect, it } from "vitest";
import {
  addVisit,
  browserStorage,
  createVisit,
  isIsoDate,
  loadVisits,
  NOTE_MAX_LENGTH,
  newVisitId,
  parseVisits,
  removeVisit,
  saveVisits,
  searchExhibitionOptions,
  sortVisits,
  toVisit,
  validateVisitInput,
  visitedVenueIds,
  VISITS_MAX,
  VISITS_STORAGE_KEY,
  type StorageLike,
  type Visit,
  type VisitExhibitionOption,
} from "./visits";

const visit = (over: Partial<Visit> = {}): Visit => ({
  id: "v1",
  exhibitionId: "2026-tnm-honkan-13-0804",
  exhibitionTitle: "東博コレクション展 刀剣",
  venueId: "tnm",
  venueName: "東京国立博物館",
  date: "2026-09-10",
  note: "三日月宗近を見た",
  createdAt: "2026-09-10T10:00:00.000Z",
  ...over,
});

const options: VisitExhibitionOption[] = [
  {
    id: "2026-tnm-honkan-13-0804",
    title: "東博コレクション展 刀剣",
    venueId: "tnm",
    venueName: "東京国立博物館",
    start_date: "2026-08-04",
    end_date: "2026-10-25",
  },
  {
    id: "2026-touken-museum-kotetsu-to-sukehiro",
    title: "新刀・東西の巨匠 虎徹と助広",
    venueId: "touken-museum",
    venueName: "刀剣博物館",
    start_date: "2026-09-13",
    end_date: null,
  },
];

/** テスト用の localStorage。throwOn を指定すると、その操作で例外を出す */
function memoryStorage(initial: Record<string, string> = {}, throwOn?: "get" | "set"): StorageLike & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => {
      if (throwOn === "get") throw new Error("SecurityError");
      return key in data ? data[key] : null;
    },
    setItem: (key, value) => {
      if (throwOn === "set") throw new Error("QuotaExceededError");
      data[key] = value;
    },
  };
}

describe("isIsoDate", () => {
  it("実在する YYYY-MM-DD だけを通す", () => {
    expect(isIsoDate("2026-02-28")).toBe(true);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026/02/28")).toBe(false);
    expect(isIsoDate(20260228)).toBe(false);
  });
});

describe("toVisit / parseVisits（壊れた値への備え）", () => {
  it("正しい記録はそのまま読む", () => {
    expect(toVisit(visit())).toEqual(visit());
  });

  it("項目が欠けた・型が違う記録は null", () => {
    expect(toVisit({ ...visit(), date: "昨日" })).toBeNull();
    expect(toVisit({ ...visit(), venueId: "" })).toBeNull();
    expect(toVisit({ ...visit(), note: 1 })).toBeNull();
    expect(toVisit(null)).toBeNull();
    expect(toVisit([visit()])).toBeNull();
  });

  it("長すぎるひとことは切り詰める", () => {
    expect(toVisit(visit({ note: "あ".repeat(NOTE_MAX_LENGTH + 50) }))?.note).toHaveLength(NOTE_MAX_LENGTH);
  });

  it("値がない・空なら、記録なし", () => {
    expect(parseVisits(null)).toEqual({ visits: [], hadInvalid: false });
    expect(parseVisits("")).toEqual({ visits: [], hadInvalid: false });
  });

  it("JSON として読めない・配列でないなら、記録なしとして扱い、壊れていたことを返す", () => {
    expect(parseVisits("{not json")).toEqual({ visits: [], hadInvalid: true });
    expect(parseVisits('{"a":1}')).toEqual({ visits: [], hadInvalid: true });
    expect(parseVisits("null")).toEqual({ visits: [], hadInvalid: true });
  });

  it("壊れた記録と重複した記録だけを飛ばし、残りは新しい順に読む", () => {
    const raw = JSON.stringify([
      visit({ id: "a", date: "2026-08-01" }),
      { broken: true },
      visit({ id: "b", date: "2026-09-01" }),
      visit({ id: "a", date: "2026-07-01" }),
      "文字列",
    ]);
    const parsed = parseVisits(raw);
    expect(parsed.hadInvalid).toBe(true);
    expect(parsed.visits.map((v) => v.id)).toEqual(["b", "a"]);
  });
});

describe("sortVisits / addVisit / removeVisit", () => {
  it("訪問日の新しい順。同じ日なら記録した順の新しい順", () => {
    const list = sortVisits([
      visit({ id: "old", date: "2026-08-01" }),
      visit({ id: "same-early", date: "2026-09-01", createdAt: "2026-09-01T01:00:00.000Z" }),
      visit({ id: "same-late", date: "2026-09-01", createdAt: "2026-09-02T01:00:00.000Z" }),
    ]);
    expect(list.map((v) => v.id)).toEqual(["same-late", "same-early", "old"]);
  });

  it("追加すると並べ直し、最大件数を超えた古い記録は消す", () => {
    const many = Array.from({ length: VISITS_MAX }, (_, i) =>
      visit({ id: `v${i}`, date: "2026-01-01", createdAt: `2026-01-01T00:00:${String(i % 60).padStart(2, "0")}.000Z` }),
    );
    const next = addVisit(many, visit({ id: "new", date: "2026-10-01" }));
    expect(next).toHaveLength(VISITS_MAX);
    expect(next[0].id).toBe("new");
  });

  it("IDを指定して削除する", () => {
    expect(removeVisit([visit({ id: "a" }), visit({ id: "b" })], "a").map((v) => v.id)).toEqual(["b"]);
  });
});

describe("loadVisits / saveVisits（localStorage が使えない場合への備え）", () => {
  it("保存して読み戻せる", () => {
    const storage = memoryStorage();
    expect(saveVisits(storage, [visit()])).toBe(true);
    expect(loadVisits(storage)).toEqual({ visits: [visit()], hadInvalid: false, available: true });
  });

  it("localStorage がない環境では、使えないと返す", () => {
    expect(loadVisits(null)).toEqual({ visits: [], hadInvalid: false, available: false });
    expect(saveVisits(null, [visit()])).toBe(false);
  });

  it("読み出しで例外が出ても、画面が壊れないように空の記録を返す", () => {
    expect(loadVisits(memoryStorage({}, "get"))).toEqual({ visits: [], hadInvalid: false, available: false });
  });

  it("保存で例外が出たら（容量不足など）false を返す", () => {
    expect(saveVisits(memoryStorage({}, "set"), [visit()])).toBe(false);
  });

  it("壊れた値が入っていても読み込める", () => {
    const storage = memoryStorage({ [VISITS_STORAGE_KEY]: "[[[" });
    expect(loadVisits(storage)).toEqual({ visits: [], hadInvalid: true, available: true });
  });

  it("Node（テスト環境）には localStorage がないので null", () => {
    expect(browserStorage()).toBeNull();
  });
});

describe("validateVisitInput / createVisit", () => {
  const today = "2026-10-07";

  it("正しい入力なら誤りなし", () => {
    expect(validateVisitInput({ exhibitionId: options[0].id, date: "2026-10-07", note: "" }, options, today)).toEqual([]);
  });

  it("展覧会が未選択・存在しない、訪問日がない・未来、ひとことが長すぎる", () => {
    expect(
      validateVisitInput({ exhibitionId: "", date: "", note: "あ".repeat(NOTE_MAX_LENGTH + 1) }, options, today),
    ).toEqual(["展覧会を選んでください。", "訪問日を入れてください。", "ひとことは200文字までです。"]);
    expect(validateVisitInput({ exhibitionId: "nai", date: "2026-10-08", note: "" }, options, today)).toEqual([
      "展覧会を選んでください。",
      "訪問日に、今日より後の日付は入れられません。",
    ]);
  });

  it("記録には、その時点の展覧会名と館名を残す", () => {
    const v = createVisit(
      { exhibitionId: options[1].id, date: "2026-09-20", note: "  虎徹  " },
      options[1],
      new Date("2026-09-20T03:00:00Z"),
      "id-1",
    );
    expect(v).toEqual({
      id: "id-1",
      exhibitionId: "2026-touken-museum-kotetsu-to-sukehiro",
      exhibitionTitle: "新刀・東西の巨匠 虎徹と助広",
      venueId: "touken-museum",
      venueName: "刀剣博物館",
      date: "2026-09-20",
      note: "虎徹",
      createdAt: "2026-09-20T03:00:00.000Z",
    });
  });

  it("IDは毎回ちがう", () => {
    expect(newVisitId()).not.toBe(newVisitId());
  });
});

describe("visitedVenueIds / searchExhibitionOptions", () => {
  it("記録した館のIDを集める", () => {
    expect([...visitedVenueIds([visit(), visit({ id: "x", venueId: "touken-museum" }), visit({ id: "y" })])]).toEqual([
      "tnm",
      "touken-museum",
    ]);
  });

  it("展覧会名・館名で探せる（カタカナ・ひらがな、空白の違いを無視）。空なら全件を開始日の新しい順", () => {
    expect(searchExhibitionOptions(options, "").map((o) => o.id)).toEqual([options[1].id, options[0].id]);
    expect(searchExhibitionOptions(options, "東博 これくしょん").map((o) => o.id)).toEqual([options[0].id]);
    expect(searchExhibitionOptions(options, "刀剣博物館").map((o) => o.id)).toEqual([options[1].id]);
    expect(searchExhibitionOptions(options, "存在しない")).toEqual([]);
  });
});
