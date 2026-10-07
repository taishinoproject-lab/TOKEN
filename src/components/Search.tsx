// 検索窓（data-model.md §10）。ビルド時に生成した /search-index.json を読み込み、ブラウザ側で検索する。
// 見た目は案A（墨の枠の検索窓）。号・別名の完全一致で1振りに決まる刀は、最上位に強調表示する（D-013）。
import { useDeferredValue, useEffect, useId, useState, type SubmitEvent } from "react";
import { smithDisplayName } from "../lib/display-name";
import {
  SEARCH_INDEX_VERSION,
  searchIndex,
  type SearchIndex,
  type SmithHit,
  type SwordHit,
} from "../lib/search";
import AttributionMark from "./ui/AttributionMark";

const MAX_RESULTS = 30;

/** 検索窓の下に出す入力例。押すと検索語に入る */
const EXAMPLES = ["三日月宗近", "正宗", "國廣", "髭切"];

type LoadState = { kind: "idle" } | { kind: "loading" } | { kind: "ready"; index: SearchIndex } | { kind: "error" };

function SwordAttributions({ hit }: { hit: SwordHit }) {
  const { attributions } = hit.sword;
  if (attributions.length === 0) return null;
  return (
    <span className="search-meta">
      刀匠：
      {attributions.map((a, i) => (
        <span key={a.smith_id}>
          {i > 0 && "・"}
          {a.smith_name ?? a.smith_id}
          <AttributionMark basis={a.basis} variant="bracket" />
        </span>
      ))}
    </span>
  );
}

export function SwordItem({ hit, featured = false }: { hit: SwordHit; featured?: boolean }) {
  if (featured) {
    return (
      <li className="search-featured">
        <p className="search-featured-label">号・別名が一致した刀</p>
        <a href={`/swords/${hit.sword.id}`} className="search-featured-name">
          {hit.sword.heading}
        </a>
        {hit.sword.subtitle && <span className="search-sub">{hit.sword.subtitle}</span>}
        <SwordAttributions hit={hit} />
      </li>
    );
  }
  return (
    <li>
      <a href={`/swords/${hit.sword.id}`} className="search-name">
        {hit.sword.heading}
      </a>
      {hit.sword.subtitle && <span className="search-sub">{hit.sword.subtitle}</span>}
      <SwordAttributions hit={hit} />
    </li>
  );
}

function SmithItem({ hit }: { hit: SmithHit }) {
  const { smith } = hit;
  // 流派単位の登録では、流派名は名前と重なるので出さない
  const extra = [smith.generation, smith.school !== smith.name ? smith.school : undefined].filter(Boolean).join("・");
  return (
    <li>
      <a href={`/smiths/${smith.id}`} className="search-name">
        {smithDisplayName(smith)}
      </a>
      <span className="search-sub">
        {smith.reading}
        {extra && `／${extra}`}
      </span>
    </li>
  );
}

export default function Search() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  // 初めて入力したときにインデックスを読み込む
  useEffect(() => {
    if (state.kind !== "idle" || query.trim() === "") return;
    setState({ kind: "loading" });
    fetch("/search-index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<SearchIndex>;
      })
      .then((index) => {
        if (index.version !== SEARCH_INDEX_VERSION) throw new Error("検索インデックスの形式が違います");
        setState({ kind: "ready", index });
      })
      .catch(() => setState({ kind: "error" }));
  }, [query, state.kind]);

  const result = state.kind === "ready" && deferredQuery.trim() !== "" ? searchIndex(state.index, deferredQuery) : null;
  const total = result ? result.smiths.length + result.swords.length + (result.featured ? 1 : 0) : 0;

  // 結果はその場で出るので、送信ではページを移動しない（スマホのキーボードを閉じるだけ）
  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector("input");
    input?.blur();
  };

  const smithSection = result && result.smiths.length > 0 && (
    <section key="smiths" className="search-group">
      <h3>刀匠（{result.smiths.length}件）</h3>
      <ul>
        {result.smiths.slice(0, MAX_RESULTS).map((hit) => (
          <SmithItem key={hit.smith.id} hit={hit} />
        ))}
      </ul>
    </section>
  );
  const swordSection = result && result.swords.length > 0 && (
    <section key="swords" className="search-group">
      <h3>刀剣（{result.swords.length}件）</h3>
      <ul>
        {result.swords.slice(0, MAX_RESULTS).map((hit) => (
          <SwordItem key={hit.sword.id} hit={hit} />
        ))}
      </ul>
      {result.swords.length > MAX_RESULTS && (
        <p className="search-note">ほか {result.swords.length - MAX_RESULTS} 件。検索語を詳しくすると絞り込めます。</p>
      )}
    </section>
  );

  return (
    <div>
      <form className="search-box" role="search" onSubmit={onSubmit}>
        <label htmlFor={inputId} className="sr-only">
          刀の号・銘・刀匠名で探す
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="号・銘・刀匠名で探す"
          autoComplete="off"
          enterKeyHint="search"
        />
        <button type="submit">探す</button>
      </form>
      <p className="search-hint">
        例：
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" onClick={() => setQuery(ex)}>
            {ex}
          </button>
        ))}
        <span>旧字体・かなでも探せます</span>
      </p>

      <div aria-live="polite" className={result && total > 0 ? "search-results" : undefined}>
        {state.kind === "loading" && <p className="search-note">読み込み中…</p>}
        {state.kind === "error" && (
          <p className="search-note text-shu">検索の準備に失敗しました。ページを再読み込みしてください。</p>
        )}
        {result && total === 0 && <p className="search-note">「{query.trim()}」に一致する刀・刀匠は見つかりませんでした。</p>}
        {result?.featured && (
          <ul className="search-list">
            <SwordItem hit={result.featured} featured />
          </ul>
        )}
        {result && (result.smithsFirst ? [smithSection, swordSection] : [swordSection, smithSection])}
      </div>
    </div>
  );
}
