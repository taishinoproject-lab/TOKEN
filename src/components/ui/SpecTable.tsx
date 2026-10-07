// 作品データの表。案Bの .spec の形式（項目名 12px の列＋値。docs/design/system.md §4.3）。
// numeric の行（刃長・反り）は、明朝 16px で数字の幅をそろえる。
import type { InfoRow } from "./ExhibitTable";

interface Props {
  rows: InfoRow[];
  caption?: string;
}

export default function SpecTable({ rows, caption }: Props) {
  return (
    <table className="spec">
      {caption && <caption className="sr-only">{caption}</caption>}
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td className={row.numeric ? "num" : undefined}>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
