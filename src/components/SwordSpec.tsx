// 刀剣詳細の「作品データ」欄（案Bの .spec の形式。docs/design/system.md §4.3）。
// 号・別名・種別・銘・刀匠〔帰属〕・指定・認定（日本美術刀剣保存協会、D-012）・時代・刃長・反り・所蔵。
import { smithDisplayName } from "../lib/display-name";
import type { Smith, Sword } from "../lib/schema";
import { meiText } from "../lib/ui-format";
import AttributionMark, { ATTRIBUTION_LEGEND } from "./ui/AttributionMark";
import type { InfoRow } from "./ui/ExhibitTable";
import SpecTable from "./ui/SpecTable";

type SwordForSpec = Pick<
  Sword,
  | "go"
  | "go_reading"
  | "aliases"
  | "blade_type"
  | "mei"
  | "mei_kind"
  | "attributions"
  | "designation"
  | "nbthk_rank"
  | "era"
  | "blade_length_cm"
  | "sori_cm"
  | "holder_text"
>;

interface Props {
  sword: SwordForSpec;
  smiths: readonly Pick<Smith, "id" | "name" | "kind">[];
  /** 所蔵先の館ページ（館の一覧にある場合） */
  holderHref?: string;
}

export default function SwordSpec({ sword, smiths, holderHref }: Props) {
  const go = sword.go?.trim();
  const attributions = sword.attributions.map((a) => ({ ...a, smith: smiths.find((s) => s.id === a.smith_id) }));

  const rows: InfoRow[] = [];
  if (go) rows.push({ label: "号", value: sword.go_reading ? `${go}（${sword.go_reading}）` : go });
  if (sword.aliases.length > 0) rows.push({ label: "別名", value: sword.aliases.join("、") });
  rows.push(
    { label: "種別", value: sword.blade_type },
    { label: "銘", value: meiText(sword) },
    {
      label: "刀匠",
      value:
        attributions.length === 0
          ? "不明"
          : attributions.map((a, i) => (
              <span key={a.smith_id}>
                {i > 0 && "・"}
                {a.smith ? <a href={`/smiths/${a.smith.id}`}>{smithDisplayName(a.smith)}</a> : a.smith_id}{" "}
                <AttributionMark basis={a.basis} />
              </span>
            )),
    },
    { label: "指定", value: sword.designation },
  );
  if (sword.nbthk_rank) {
    rows.push({
      label: "認定",
      value: (
        <>
          {sword.nbthk_rank}
          <span className="sub">（日本美術刀剣保存協会）</span>
        </>
      ),
    });
  }
  if (sword.era) rows.push({ label: "時代", value: sword.era });
  if (sword.blade_length_cm !== undefined) rows.push({ label: "刃長", value: `${sword.blade_length_cm} cm`, numeric: true });
  if (sword.sori_cm !== undefined) rows.push({ label: "反り", value: `${sword.sori_cm} cm`, numeric: true });
  rows.push({ label: "所蔵", value: holderHref ? <a href={holderHref}>{sword.holder_text}</a> : sword.holder_text });

  return (
    <>
      <SpecTable rows={rows} caption="作品データ" />
      {attributions.length > 0 && <p className="legend">帰属の区別：{ATTRIBUTION_LEGEND}</p>}
    </>
  );
}
