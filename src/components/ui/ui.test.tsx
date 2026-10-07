import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AttributionMark from "./AttributionMark";
import Catalog from "./Catalog";
import DesignationMark from "./DesignationMark";
import ExhibitTable from "./ExhibitTable";
import ExList from "./ExList";
import Saya from "./Saya";
import SourceList from "./SourceList";
import SpecTable from "./SpecTable";
import StatusBadge from "./StatusBadge";
import UnverifiedBadge from "./UnverifiedBadge";

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe("札・印", () => {
  it("要確認の札", () => {
    expect(html(<UnverifiedBadge />)).toContain(">要確認</span>");
  });

  it("帰属の区別：枠（極めは破線になるよう data-basis を付ける）と亀甲括弧", () => {
    expect(html(<AttributionMark basis="極め" />)).toBe('<span class="attr-box" data-basis="極め">極め</span>');
    expect(html(<AttributionMark basis="在銘" variant="bracket" />)).toBe('<span class="attr-bracket">〔在銘〕</span>');
  });

  it("状態の札は文字でも状態を示す", () => {
    expect(html(<StatusBadge tone="ok">いま会えます</StatusBadge>)).toBe(
      '<span class="status-badge" data-tone="ok" data-size="md">いま会えます</span>',
    );
  });

  it("未指定・不明には指定の印を出さない。認定は国の指定とは別の印", () => {
    expect(html(<DesignationMark designation="未指定" />)).toBe("");
    expect(html(<DesignationMark designation="国宝" />)).toContain('data-kind="国宝"');
    expect(html(<DesignationMark designation="未指定" nbthkRank="特別重要刀剣" />)).toContain("特別重要刀剣");
  });
});

describe("Catalog（目録）", () => {
  const rows = [
    {
      key: "a",
      heading: "三日月宗近",
      subtitle: "太刀 銘 三条",
      href: "/swords/mikazuki-munechika",
      designation: "国宝" as const,
      smiths: [{ name: "三条宗近", href: "/smiths/sanjo-munechika", basis: "在銘" as const }],
      venue: "東京国立博物館",
      display: "10月25日（日）まで",
    },
    { key: "b", heading: "新作日本刀", designation: "未指定" as const },
  ];

  it("列見出し・番号・帰属の亀甲括弧を出す", () => {
    const out = html(<Catalog rows={rows} />);
    expect(out).toContain("<th scope=\"col\">刀匠〔帰属〕</th>");
    expect(out).toContain('<td class="c-no">01</td>');
    expect(out).toContain('<td class="c-no">02</td>');
    expect(out).toContain('<a class="name" href="/swords/mikazuki-munechika">三日月宗近</a><small>太刀 銘 三条</small>');
    expect(out).toContain('<span class="attr-bracket">〔在銘〕</span>');
  });

  it("スマホのカード表示で使う項目名を data-label に入れる", () => {
    const out = html(<Catalog rows={rows} />);
    expect(out).toContain('data-label="刀匠"');
    expect(out).toContain('data-label="会場"');
    expect(out).toContain('data-label="展示"');
  });

  it("リンク先のない行は文字だけにし、空の欄は「—」にする", () => {
    const out = html(<Catalog rows={rows} />);
    expect(out).toContain('<span class="name">新作日本刀</span>');
    expect(out).toContain('<td class="c-desig"></td>');
    expect(out).toContain('<td class="c-venue" data-label="会場">—</td>');
  });

  it("列の項目名を変えたり、列を外したりできる", () => {
    const out = html(<Catalog rows={rows} columns={{ venue: "所蔵", display: false }} />);
    expect(out).toContain("<th scope=\"col\">所蔵</th>");
    expect(out).not.toContain("c-display");
  });
});

describe("表", () => {
  it("展示情報の表は項目名を th（行の見出し）にする", () => {
    const out = html(<ExhibitTable rows={[{ label: "観覧料", value: "一般 1,000円" }]} />);
    expect(out).toBe('<table class="exhibit"><tbody><tr><th scope="row">観覧料</th><td>一般 1,000円</td></tr></tbody></table>');
  });

  it("作品データの表は、数字の行に num を付ける", () => {
    const out = html(
      <SpecTable
        rows={[
          { label: "刃長", value: "80 cm", numeric: true },
          { label: "種別", value: "太刀" },
        ]}
      />,
    );
    expect(out).toContain('<td class="num">80 cm</td>');
    expect(out).toContain("<td>太刀</td>");
  });
});

describe("Saya（白鞘の号表示）", () => {
  it("号は筆の書体、読み上げからは外す", () => {
    const out = html(<Saya text="三日月宗近" isGo reading="みかづきむねちか" side="太刀 銘 三条" />);
    expect(out).toContain('aria-hidden="true"');
    expect(out).toContain('data-size="l"');
    expect(out).toContain('<span class="go" data-font="fude">三日月宗近</span>');
    expect(out).toContain('<span class="yomi">みかづきむねちか</span>');
  });

  it("筆の書体に字形がない字を含む号は明朝", () => {
    expect(html(<Saya text="鎺切" isGo />)).toContain('data-font="mincho"');
  });
});

describe("SourceList（出典と最終確認日）", () => {
  const sources = [
    { url: "https://a.example/", title: "公式", retrieved_at: "2026-10-07" },
    { url: "https://a.example/", title: "公式", retrieved_at: "2026-10-01" },
  ];

  it("同じ出典は1つにまとめ、最終確認日を出す", () => {
    const out = html(<SourceList groups={[{ sources, confidence: "confirmed" }]} verifiedAt="2026-10-07" />);
    expect(out.match(/<li>/g)).toHaveLength(1);
    expect(out).toContain("（取得 2026年10月7日）");
    expect(out).toContain("最終確認日：2026年10月7日");
    expect(out).not.toContain("要確認");
  });

  it("未確認の情報には要確認を付け、対象の名前を前に置く", () => {
    const out = html(<SourceList groups={[{ label: "展示情報", sources, confidence: "unverified" }]} />);
    expect(out).toContain("展示情報：");
    expect(out).toContain("要確認");
  });

  it("出典がなければ、そう書く", () => {
    expect(html(<SourceList groups={[{ sources: [] }]} />)).toContain("出典は登録されていません。");
  });
});

describe("ExList（会期終了が近い展覧会）", () => {
  it("終了日と曜日を出し、近いものだけ強調する", () => {
    const out = html(
      <ExList
        items={[
          { key: "a", end: "2026-10-12", emphasis: true, title: "展A", href: "/exhibitions/a", venue: "刀剣博物館", unverified: true },
          { key: "b", end: "2026-10-25", title: "展B", href: "/exhibitions/b", venue: "東京国立博物館" },
        ]}
      />,
    );
    expect(out).toContain('<div class="date" data-soon=""><b>10.12</b><small>（月）まで</small></div>');
    expect(out).toContain('<div class="date"><b>10.25</b><small>（日）まで</small></div>');
    expect(out.match(/要確認/g)).toHaveLength(1);
    expect(out).not.toContain("あと");
  });
});
