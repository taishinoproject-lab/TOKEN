// robots.txt の解釈（RFC 9309 の基本部分）。
// - 自分の User-Agent の製品名に一致するグループがあればそれを、なければ「*」のグループを使う
// - Allow / Disallow は、最も長く一致した規則を採用する（同じ長さなら Allow を優先）
// - 「*」（任意の文字列）と末尾の「$」（終端）に対応する

export interface RobotsRule {
  allow: boolean;
  pattern: string;
}

export interface RobotsPolicy {
  rules: RobotsRule[];
  crawlDelaySeconds?: number;
}

/** robots.txt が使えないときの扱い。 */
export const ALLOW_ALL: RobotsPolicy = { rules: [] };
export const DISALLOW_ALL: RobotsPolicy = { rules: [{ allow: false, pattern: "/" }] };

interface Group {
  agents: string[];
  rules: RobotsRule[];
  crawlDelaySeconds?: number;
}

function parseGroups(text: string): Group[] {
  const groups: Group[] = [];
  let current: Group | undefined;
  let lastWasAgent = false;

  for (const rawLine of text.split(/\r\n|\r|\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (key === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current) continue;
    if (key === "allow" || key === "disallow") {
      // 空の Disallow は「すべて許可」なので規則を足さない
      if (value === "") continue;
      current.rules.push({ allow: key === "allow", pattern: value });
    } else if (key === "crawl-delay") {
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) current.crawlDelaySeconds = n;
    }
  }
  return groups;
}

/** robots.txt の本文から、指定した User-Agent に適用される方針を取り出す。 */
export function parseRobots(text: string, userAgent: string): RobotsPolicy {
  const product = userAgent.split("/")[0].trim().toLowerCase();
  const groups = parseGroups(text);
  const own = groups.filter((g) => g.agents.some((a) => a !== "*" && product.startsWith(a)));
  const chosen = own.length > 0 ? own : groups.filter((g) => g.agents.includes("*"));
  const policy: RobotsPolicy = { rules: chosen.flatMap((g) => g.rules) };
  const delays = chosen.map((g) => g.crawlDelaySeconds).filter((d): d is number => d !== undefined);
  if (delays.length > 0) policy.crawlDelaySeconds = Math.max(...delays);
  return policy;
}

function patternToRegExp(pattern: string): RegExp {
  const anchored = pattern.endsWith("$");
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const escaped = body
    .split("*")
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${escaped}${anchored ? "$" : ""}`);
}

/** パス（クエリ文字列を含む。例: "/modules/index.php?id=1"）を取得してよいか。 */
export function isAllowed(policy: RobotsPolicy, pathWithQuery: string): boolean {
  let best: RobotsRule | undefined;
  for (const rule of policy.rules) {
    if (!patternToRegExp(rule.pattern).test(pathWithQuery)) continue;
    if (
      !best ||
      rule.pattern.length > best.pattern.length ||
      (rule.pattern.length === best.pattern.length && rule.allow && !best.allow)
    ) {
      best = rule;
    }
  }
  return best ? best.allow : true;
}

/**
 * robots.txt の取得結果から方針を決める（RFC 9309 §2.3.1）。
 * - 2xx: 本文を解釈する
 * - 4xx（404 など）: robots.txt がないものとして、すべて許可
 * - 5xx・通信エラー: すべて不許可（取得を見送る）
 */
export function policyFromResponse(status: number | undefined, body: string, userAgent: string): RobotsPolicy {
  if (status === undefined) return DISALLOW_ALL;
  if (status >= 200 && status < 300) return parseRobots(body, userAgent);
  if (status >= 400 && status < 500) return ALLOW_ALL;
  return DISALLOW_ALL;
}
