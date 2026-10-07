import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EndingSoonView, type EndingExhibition } from "./EndingSoon";
import { ExhibitionIndexView, type IndexExhibition } from "./ExhibitionIndex";
import { ExhibitionInfoView, type ExhibitionInfoData } from "./ExhibitionInfo";
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

describe("ExhibitionIndexView（展覧会の一覧）", () => {
  const list: IndexExhibition[] = [
    { id: "on", title: "開催中の展", start_date: "2026-09-01", end_date: "2026-10-10", venueText: "館A", confidence: "confirmed" },
    { id: "open", title: "会期未定の展", start_date: "2026-07-02", end_date: null, venueText: "館B", confidence: "unverified" },
    { id: "up", title: "これからの展", start_date: "2026-10-24", end_date: "2026-12-20", venueText: "館C", confidence: "confirmed", notes: ["出品：太刀"] },
    { id: "old", title: "終わった展", start_date: "2026-01-01", end_date: "2026-02-01", venueText: "館D", confidence: "confirmed" },
    { id: "older", title: "前に終わった展", start_date: "2025-01-01", end_date: "2025-02-01", venueText: "館E", confidence: "confirmed" },
  ];

  it("開催中・開催予定・終了に分け、開催予定は開始日を「から」で出す", () => {
    const out = renderToStaticMarkup(<ExhibitionIndexView exhibitions={list} today="2026-10-07" endedLimit={1} />);
    expect(out.indexOf("開催中の展")).toBeLessThan(out.indexOf("これからの展"));
    expect(out.indexOf("これからの展")).toBeLessThan(out.indexOf("終わった展"));
    expect(out).toContain("<b>10.24</b><small>（土）から</small>");
    expect(out).toContain("出品：太刀");
    expect(out).not.toContain("前に終わった展");
    expect(out).not.toContain("あと");
  });

  it("終了日が近い開催中の展覧会は朱、終了日が未定なら開始日と会期未定を出す", () => {
    const out = renderToStaticMarkup(<ExhibitionIndexView exhibitions={list} today="2026-10-07" groups={["ongoing"]} />);
    expect(out).toContain('<div class="date" data-soon=""><b>10.10</b>');
    expect(out).toContain("<b>7.02</b><small>（木）から</small>");
    expect(out).toContain("会期未定（公式サイトで確認）");
    expect(out).not.toContain("これからの展");
  });
});

describe("ExhibitionInfoView（展覧会の展示情報）", () => {
  const info: ExhibitionInfoData = {
    start_date: "2027-01-24",
    end_date: "2027-03-22",
    periods: [
      { id: "前期", start_date: "2027-01-24", end_date: "2027-02-21" },
      { id: "後期", start_date: "2027-02-23", end_date: "2027-03-22" },
    ],
    venue: { name: "ふくやま美術館", href: "/venues/x" },
    official_url: "https://example.com/",
    verified_at: "2026-10-07",
    confidence: "confirmed",
  };

  it("状態・会期・展示期間の区分を出す", () => {
    const out = renderToStaticMarkup(<ExhibitionInfoView exhibition={info} today="2026-10-07" />);
    expect(out).toContain(">開催予定</span>");
    expect(out).toContain("1月24日（日）から");
    expect(out).toContain("<b class=\"font-semibold\">後期</b>　2月23日〜3月22日");
    expect(out).not.toContain("要確認");
  });

  it("未確認の情報には注意欄を出す", () => {
    const out = renderToStaticMarkup(<ExhibitionInfoView exhibition={{ ...info, confidence: "unverified", periods: [] }} today="2027-02-01" />);
    expect(out).toContain(">開催中</span>");
    expect(out).toContain("区分の登録なし");
    expect(out).toContain('class="warn"');
  });
});
