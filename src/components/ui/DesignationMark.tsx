// 国の指定（国宝・重要文化財など）と、日本美術刀剣保存協会の認定（D-012）の印。
// 「未指定」「不明」は印を出さない。国宝は朱（system.md §1）。
import type { Designation, NbthkRank } from "../../lib/schema";
import { hasDesignationMark } from "../../lib/ui-format";

interface Props {
  designation?: Designation | null;
  nbthkRank?: NbthkRank;
}

export default function DesignationMark({ designation, nbthkRank }: Props) {
  return (
    <>
      {hasDesignationMark(designation) && (
        <span className="mark" data-kind={designation}>
          {designation}
        </span>
      )}
      {nbthkRank && (
        <span className="mark" data-kind="nbthk" title="日本美術刀剣保存協会の認定">
          {nbthkRank}
        </span>
      )}
    </>
  );
}
