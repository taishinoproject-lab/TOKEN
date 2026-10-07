import { describe, expect, it } from "vitest";
import { ALLOW_ALL, DISALLOW_ALL, isAllowed, parseRobots, policyFromResponse } from "./robots.ts";

const UA = "TOKEN-crawler/0.1 (+https://github.com/taishinoproject-lab/token)";

describe("parseRobots / isAllowed", () => {
  it("連続する User-agent 行を1つのグループとして読む（東京国立博物館の robots.txt と同じ形）", () => {
    const policy = parseRobots(
      "User-agent: * #Applies to all robots\nUser-agent: *\nAllow: /\nDisallow: /admin.php\nDisallow: /userinfo.php\n",
      UA,
    );
    expect(isAllowed(policy, "/modules/r_exhibition/index.php?controller=hall&hid=12")).toBe(true);
    expect(isAllowed(policy, "/admin.php")).toBe(false);
    expect(isAllowed(policy, "/admin.php?x=1")).toBe(false);
  });

  it("自分の名前のグループがあれば、* より優先する", () => {
    const policy = parseRobots("User-agent: *\nDisallow: /\n\nUser-agent: TOKEN-crawler\nDisallow: /private/\n", UA);
    expect(isAllowed(policy, "/exhibition/")).toBe(true);
    expect(isAllowed(policy, "/private/a.html")).toBe(false);
  });

  it("最も長く一致した規則を採用し、同じ長さなら Allow を優先する", () => {
    const policy = parseRobots("User-agent: *\nDisallow: /site/\nAllow: /site/token/\n", UA);
    expect(isAllowed(policy, "/site/token/111308.html")).toBe(true);
    expect(isAllowed(policy, "/site/other/")).toBe(false);
    const tie = parseRobots("User-agent: *\nDisallow: /a\nAllow: /a\n", UA);
    expect(isAllowed(tie, "/a")).toBe(true);
  });

  it("* と $ に対応する", () => {
    const policy = parseRobots("User-agent: *\nDisallow: /*.pdf$\nDisallow: /*?print=\n", UA);
    expect(isAllowed(policy, "/uploaded/attachment/1.pdf")).toBe(false);
    expect(isAllowed(policy, "/uploaded/attachment/1.pdf?x")).toBe(true);
    expect(isAllowed(policy, "/page.html?print=1")).toBe(false);
  });

  it("空の Disallow はすべて許可。Crawl-delay を読む", () => {
    const policy = parseRobots("User-agent: *\nDisallow:\nCrawl-delay: 5\n", UA);
    expect(isAllowed(policy, "/anything")).toBe(true);
    expect(policy.crawlDelaySeconds).toBe(5);
  });

  it("該当するグループがなければすべて許可", () => {
    expect(isAllowed(parseRobots("User-agent: OtherBot\nDisallow: /\n", UA), "/")).toBe(true);
  });
});

describe("policyFromResponse", () => {
  it("404 などの 4xx は robots.txt なしとしてすべて許可", () => {
    expect(policyFromResponse(404, "<html>見つかりません</html>", UA)).toEqual(ALLOW_ALL);
  });

  it("5xx と通信エラーはすべて不許可", () => {
    expect(policyFromResponse(503, "", UA)).toEqual(DISALLOW_ALL);
    expect(policyFromResponse(undefined, "", UA)).toEqual(DISALLOW_ALL);
    expect(isAllowed(DISALLOW_ALL, "/index.html")).toBe(false);
  });

  it("2xx は本文を解釈する", () => {
    expect(isAllowed(policyFromResponse(200, "User-agent: *\nDisallow: /x\n", UA), "/x/1")).toBe(false);
  });
});
