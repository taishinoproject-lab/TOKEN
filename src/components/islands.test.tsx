import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EndingSoonView, type EndingExhibition } from "./EndingSoon";
import { NowOnDisplayView, type NowExhibition, type NowSword } from "./NowOnDisplay";
import { SwordExhibitView, type SwordExhibitionView } from "./SwordExhibit";

const base = {
  room: "本館13室",
  admission: "一般 1,000円",
  official_url: "https://example.com/ex",
  verified_at: "2026-10-07",
  venue: { name: "東京国立博物館", href: "/venues/tnm" },
};

const exhibitions: SwordExhibitionView[] = [
  {
    ...base,
    id: "now",
    title: "名刀展",
    start_date: "2026-09-01",
    end_date: "2026-10-25",
    periods: [
      { id: "前期", start_date: "2026-09-01", end_date: "2026-10-05" },
      { id: "後期", start_date: "2026-10-06", end_date: "2026-10-25" },
    ],
    exhibits: [{ sword_id: "s", period_ids: ["後期"] }],
    confidence: "confirmed",
  },
  {
    ...base,
    id: "next",
    title: "特別展",
    start_date: "2027-02-03",
    end_date: "2027-03-14",
    periods: [],
    exhibits: [{ sword_id: "s" }],
    confidence: "unverified",
    admission: undefined,
  },
];

const holder = { text: "東京国立博物館", href: "/venues/tnm" };
const render = (today: string, list = exhibitions) =>
  renderToStaticMarkup(<SwordExhibitView swordId="s" holder={holder} exhibitions={list} today={today} />);

describe("SwordExhibitView（刀剣詳細の展示欄）", () => {
  it("1. いま会えます：終了日・会場・展覧会・この刀の展示・観覧料を表に出す", () => {
    const out = render("2026-10-07");
    expect(out).toContain('data-status="on_display"');
    expect(out).toContain("いま会えます");
    expect(out).toContain("10月25日（日）まで");
    expect(out).toContain("本館13室");
    expect(out).toContain("2026年9月1日（火）〜10月25日（日）");
    expect(out).toContain("後期（10月6日〜10月25日）");
    expect(out).toContain("一般 1,000円");
    expect(out).toContain("展示情報の最終確認日：2026年10月7日");
    // 判定に使わなかった開催予定の展覧会は「ほかの展示の予定」に出す
    expect(out).toContain("ほかの展示の予定");
    expect(out).toContain("特別展");
  });

  it("2. 展覧会は開催中だが、この刀はこれから", () => {
    const out = render("2026-09-10");
    expect(out).toContain('data-status="coming_in_ongoing"');
    expect(out).toContain("10月6日から展示");
  });

  it("3. 開催予定：未確認の展示情報には要確認の注意欄を出す。観覧料がなければ行を出さない", () => {
    const out = render("2026-11-01");
    expect(out).toContain('data-status="upcoming_exhibition"');
    expect(out).toContain("開催予定");
    expect(out).toContain("2月3日（水）から展示");
    expect(out).toContain('class="warn"');
    expect(out).toContain("要確認");
    expect(out).not.toContain("観覧料");
  });

  it("4. どれでもない：所蔵先を出す", () => {
    const out = render("2027-04-01");
    expect(out).toContain('data-status="none"');
    expect(out).toContain("所蔵先");
    expect(out).toContain('<a href="/venues/tnm">東京国立博物館</a>');
    expect(out).toContain("登録されている展示の予定はありません。");
    expect(out).not.toContain("会場");
  });

  it("会期未定（D-012）の展示は「いま会えます・会期未定」", () => {
    const out = render("2026-10-07", [{ ...exhibitions[1], id: "open", start_date: "2026-07-01", end_date: null }]);
    expect(out).toContain("会期未定（公式サイトで確認）");
    expect(out).not.toContain("あと");
  });
});

describe("NowOnDisplayView（いま会える刀）", () => {
  const swords: NowSword[] = [
    { id: "s", heading: "三日月宗近", subtitle: "太刀 銘 三条", designation: "国宝", smiths: [{ name: "三条宗近", basis: "在銘" }] },
    { id: "t", heading: "童子切安綱", subtitle: "太刀 銘 安綱", designation: "国宝", smiths: [] },
  ];
  const nowExhibitions: NowExhibition[] = [
    { ...exhibitions[0], venueName: "東京国立博物館", exhibits: [...exhibitions[0].exhibits, { sword_id: "t", period_ids: ["前期"] }] },
  ];

  it("今日の日付で、展示中の刀だけを目録に出す", () => {
    const out = renderToStaticMarkup(<NowOnDisplayView swords={swords} exhibitions={nowExhibitions} today="2026-10-07" />);
    expect(out).toContain("10月7日 現在、展示中 ／ 1件");
    expect(out).toContain("三日月宗近");
    expect(out).not.toContain("童子切安綱");
    expect(out).toContain("「名刀展」");
  });

  it("展示中の刀がなければ、そう書く", () => {
    const out = renderToStaticMarkup(<NowOnDisplayView swords={swords} exhibitions={nowExhibitions} today="2027-01-01" />);
    expect(out).toContain("0件");
    expect(out).toContain("今日、展示されている刀は登録されていません。");
  });
});

describe("EndingSoonView（会期終了が近い展覧会）", () => {
  const list: EndingExhibition[] = [
    { id: "a", start_date: "2026-09-01", end_date: "2026-10-12", title: "展A", venueText: "刀剣博物館　東京都墨田区", confidence: "unverified" },
    { id: "b", start_date: "2026-09-01", end_date: "2026-12-31", title: "展B", venueText: "佐野美術館", confidence: "confirmed" },
  ];

  it("30日以内に終わるものだけを出す", () => {
    const out = renderToStaticMarkup(<EndingSoonView exhibitions={list} today="2026-10-07" />);
    expect(out).toContain("展A");
    expect(out).not.toContain("展B");
    expect(out).toContain("data-soon");
  });

  it("該当がなければ、そう書く", () => {
    const out = renderToStaticMarkup(<EndingSoonView exhibitions={list} today="2027-02-01" />);
    expect(out).toContain("登録されていません");
  });
});
