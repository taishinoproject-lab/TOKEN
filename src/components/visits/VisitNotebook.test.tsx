import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import VisitNotebook from "./VisitNotebook";

describe("VisitNotebook", () => {
  it("記録を読み込む前でも、追加の欄と展覧会の候補を表示できる（写真の欄はない）", () => {
    const html = renderToStaticMarkup(
      <VisitNotebook
        buildToday="2026-10-07"
        exhibitions={[
          {
            id: "ex1",
            title: "東博コレクション展 刀剣",
            venueId: "tnm",
            venueName: "東京国立博物館",
            start_date: "2026-08-04",
            end_date: "2026-10-25",
          },
        ]}
      />,
    );
    expect(html).toContain("訪剣帖");
    expect(html).toContain("東博コレクション展 刀剣");
    expect(html).toContain('max="2026-10-07"');
    expect(html).toContain("読み込んでいます");
    expect(html).not.toMatch(/写真|<img|type="file"/);
  });
});
