// 収録範囲（D-024）。このサイトが展示情報を確認している館と、自動の巡回で最後に公式サイトを確認できた日。
// 巡回の結果は crawl/snapshots/manifest.json（巡回の PR を main に取り込むと更新される）から読む。
import type { Venue } from "./schema";
import { prefectureOrder } from "./regions";

export interface ManifestEntry {
  venue_id: string;
  fetched_at: string; // "YYYY-MM-DD"
}

export interface CoverageVenue {
  id: string;
  name: string;
  prefecture: string;
  /** 巡回で公式サイトを確認できた日。直近の巡回で確認できなかった館は null（「確認できていません」と表示する） */
  lastChecked: string | null;
}

export interface Coverage {
  /** 直近の巡回の日（取り込まれている巡回の結果のうち、最も新しい日）。巡回の結果がなければ null */
  lastCrawlDate: string | null;
  /** 自動で巡回している館 */
  crawled: CoverageVenue[];
  /** 自動の巡回の対象外の館（手作業で掲載している館） */
  manual: CoverageVenue[];
}

const byPrefecture = (a: CoverageVenue, b: CoverageVenue) =>
  prefectureOrder(a.prefecture) - prefectureOrder(b.prefecture);

export function buildCoverage(venues: readonly Venue[], entries: readonly ManifestEntry[]): Coverage {
  const lastByVenue = new Map<string, string>();
  for (const e of entries) {
    const prev = lastByVenue.get(e.venue_id);
    if (!prev || e.fetched_at > prev) lastByVenue.set(e.venue_id, e.fetched_at);
  }
  const lastCrawlDate = [...lastByVenue.values()].reduce<string | null>((max, d) => (!max || d > max ? d : max), null);

  const crawled: CoverageVenue[] = [];
  const manual: CoverageVenue[] = [];
  for (const v of venues) {
    const base = { id: v.id, name: v.name, prefecture: v.prefecture };
    if (v.crawl?.enabled) {
      const last = lastByVenue.get(v.id) ?? null;
      // 直近の巡回で取得できなかった館（robots.txt の取得失敗などで見送り）は、確認できていない扱いにする
      crawled.push({ ...base, lastChecked: last !== null && last === lastCrawlDate ? last : null });
    } else {
      manual.push({ ...base, lastChecked: null });
    }
  }
  return { lastCrawlDate, crawled: crawled.sort(byPrefecture), manual: manual.sort(byPrefecture) };
}
