// 展示情報の表。案Bの .exhibit の形式（項目名の列と値の列。docs/design/system.md §4.1）。
// 行：状態／会場／展覧会／この刀の展示／観覧料。行の中身は呼び出し側で決める。
import type { ReactNode } from "react";

export interface InfoRow {
  label: string;
  value: ReactNode;
  /** 数字をそろえて明朝 16px で表示する（作品データの刃長・反り） */
  numeric?: boolean;
}

interface Props {
  rows: InfoRow[];
  caption?: string;
}

export default function ExhibitTable({ rows, caption }: Props) {
  return (
    <table className="exhibit">
      {caption && <caption className="sr-only">{caption}</caption>}
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
