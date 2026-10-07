// 目録（一覧）。案Bの .cat の形式を、案Aの色と書体で使う（docs/design/system.md §4.2）。
// 列：No.／指定／名称（号を大きく、その下に種別と銘）／刀匠〔帰属〕／会場／展示。
// スマホ（767px 以下）では、CSS で2段組のカードに組み替える（項目名は data-label から行頭に付ける）。
// トップの「いま会える刀」、刀匠ページの作品一覧、展覧会ページの出品リストで使う。
import type { ReactNode } from "react";
import type { AttributionBasis, Designation, NbthkRank } from "../../lib/schema";
import { catalogNumber } from "../../lib/ui-format";
import AttributionMark from "./AttributionMark";
import DesignationMark from "./DesignationMark";

export interface CatalogSmith {
  name: string;
  href?: string;
  basis?: AttributionBasis;
}

export interface CatalogRow {
  key: string;
  /** 名称の大きな文字（号、号がなければ種別＋銘） */
  heading: string;
  /** 名称の下の小さな文字（種別と銘など） */
  subtitle?: string;
  /** 名称のリンク先。刀剣データがない出品物は省略する */
  href?: string;
  designation?: Designation | null;
  nbthkRank?: NbthkRank;
  smiths?: CatalogSmith[];
  /** 会場の列（所蔵などに変えるときは columns.venue で項目名を変える） */
  venue?: ReactNode;
  /** 展示の列 */
  display?: ReactNode;
  /** 展示の列の下に添える注記（出品物の備考など） */
  displayNote?: string;
}

export interface CatalogColumns {
  /** 列の項目名。false にすると列を出さない */
  designation?: string | false;
  smith?: string | false;
  venue?: string | false;
  display?: string | false;
}

const DEFAULT_COLUMNS: Required<CatalogColumns> = {
  designation: "指定",
  smith: "刀匠",
  venue: "会場",
  display: "展示",
};

interface Props {
  rows: CatalogRow[];
  columns?: CatalogColumns;
  /** 表の説明（読み上げ用） */
  caption?: string;
}

function SmithList({ smiths }: { smiths: CatalogSmith[] }) {
  return (
    <>
      {smiths.map((s, i) => (
        <span key={`${s.name}-${i}`}>
          {i > 0 && "・"}
          {s.href ? <a href={s.href}>{s.name}</a> : s.name}
          {s.basis && <AttributionMark basis={s.basis} variant="bracket" />}
        </span>
      ))}
    </>
  );
}

export default function Catalog({ rows, columns, caption }: Props) {
  const cols = { ...DEFAULT_COLUMNS, ...columns };
  return (
    <table className="cat">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">No.</th>
          {cols.designation && <th scope="col">{cols.designation}</th>}
          <th scope="col">名称</th>
          {cols.smith && <th scope="col">{cols.smith}〔帰属〕</th>}
          {cols.venue && <th scope="col">{cols.venue}</th>}
          {cols.display && <th scope="col">{cols.display}</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.key}>
            <td className="c-no">{catalogNumber(i)}</td>
            {cols.designation && (
              <td className="c-desig">
                <DesignationMark designation={row.designation} nbthkRank={row.nbthkRank} />
              </td>
            )}
            <td className="c-name">
              {row.href ? (
                <a className="name" href={row.href}>
                  {row.heading}
                </a>
              ) : (
                <span className="name">{row.heading}</span>
              )}
              {row.subtitle && <small>{row.subtitle}</small>}
            </td>
            {cols.smith && (
              <td className="c-smith" data-label={cols.smith}>
                {row.smiths && row.smiths.length > 0 ? <SmithList smiths={row.smiths} /> : "—"}
              </td>
            )}
            {cols.venue && (
              <td className="c-venue" data-label={cols.venue}>
                {row.venue ?? "—"}
              </td>
            )}
            {cols.display && (
              <td className="c-display" data-label={cols.display}>
                {row.display ?? "—"}
                {row.displayNote && <span className="note">{row.displayNote}</span>}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
