// 出典と最終確認日の欄（案A）。情報ごとに、出典へのリンクと最終確認日を表示する。
import { formatFullDate } from "../../lib/date";
import type { Confidence, Source } from "../../lib/schema";
import { uniqueSources } from "../../lib/ui-format";
import UnverifiedBadge from "./UnverifiedBadge";

export interface SourceGroup {
  /** 「展示情報」など、出典の対象。省略時は付けない */
  label?: string;
  sources: Source[];
  confidence?: Confidence;
}

interface Props {
  groups: SourceGroup[];
  /** 最終確認日（展覧会・館の verified_at など） */
  verifiedAt?: string;
  heading?: string;
}

export default function SourceList({ groups, verifiedAt, heading = "出典" }: Props) {
  const items = groups.flatMap((g, gi) =>
    uniqueSources(g.sources).map((s, si) => ({ key: `${gi}-${si}`, source: s, label: g.label, unverified: g.confidence === "unverified" })),
  );
  return (
    <section className="sources" aria-label={heading}>
      <h2>{heading}</h2>
      {items.length === 0 ? (
        <p>出典は登録されていません。</p>
      ) : (
        <ol>
          {items.map(({ key, source, label, unverified }) => (
            <li key={key}>
              {label && `${label}：`}
              <a href={source.url} rel="noopener noreferrer" target="_blank">
                {source.title ?? source.url}
              </a>
              （取得 {formatFullDate(source.retrieved_at)}）{unverified && <UnverifiedBadge />}
            </li>
          ))}
        </ol>
      )}
      {groups.some((g) => g.confidence === "unverified") && (
        <p>〔要確認〕の付いた情報は、公式の情報源での確認がまだ済んでいません。</p>
      )}
      {verifiedAt && <p className="checked">最終確認日：{formatFullDate(verifiedAt)}</p>}
    </section>
  );
}
