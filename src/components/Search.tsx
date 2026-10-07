// 検索窓（data-model.md §10）。ビルド時に生成した /search-index.json を読み込み、ブラウザ側で検索する。
// 見た目は仮（デザインは T-201 で行う）。
import { useDeferredValue, useEffect, useId, useState } from "react";
import { smithDisplayName } from "../lib/display-name";
import {
  SEARCH_INDEX_VERSION,
  attributionLabels,
  searchIndex,
  type SearchIndex,
  type SmithHit,
  type SwordHit,
} from "../lib/search";

const MAX_RESULTS = 30;

type LoadState = { kind: "idle" } | { kind: "loading" } | { kind: "ready"; index: SearchIndex } | { kind: "error" };

function SwordItem({ hit, featured = false }: { hit: SwordHit; featured?: boolean }) {
  const labels = attributionLabels(hit.sword);
  return (
    <li className={featured ? "rounded border-2 border-brand-primary p-3" : "py-1"}>
      {featured && <p className="mb-1 text-sm font-bold text-brand-primary">号が一致した刀</p>}
      <a href={`/swords/${hit.sword.id}`} className={featured ? "text-xl underline" : "underline"}>
        {hit.sword.heading}
      </a>
      {hit.sword.subtitle && <span className="text-sm">（{hit.sword.subtitle}）</span>}
      {labels.length > 0 && <span className="block text-sm">刀匠：{labels.join("・")}</span>}
    </li>
  );
}

function SmithItem({ hit }: { hit: SmithHit }) {
  const { smith } = hit;
  // 流派単位の登録では、流派名は名前と重なるので出さない
  const extra = [smith.generation, smith.school !== smith.name ? smith.school : undefined].filter(Boolean).join("・");
  return (
    <li className="py-1">
      <a href={`/smiths/${smith.id}`} className="underline">
        {smithDisplayName(smith)}
      </a>
      <span className="text-sm">
        （{smith.reading}
        {extra && `／${extra}`}）
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

  const smithSection = result && result.smiths.length > 0 && (
    <section key="smiths" className="mt-4">
      <h3 className="mb-1 text-lg">刀匠（{result.smiths.length}件）</h3>
      <ul>
        {result.smiths.slice(0, MAX_RESULTS).map((hit) => (
          <SmithItem key={hit.smith.id} hit={hit} />
        ))}
      </ul>
    </section>
  );
  const swordSection = result && result.swords.length > 0 && (
    <section key="swords" className="mt-4">
      <h3 className="mb-1 text-lg">刀剣（{result.swords.length}件）</h3>
      <ul>
        {result.swords.slice(0, MAX_RESULTS).map((hit) => (
          <SwordItem key={hit.sword.id} hit={hit} />
        ))}
      </ul>
      {result.swords.length > MAX_RESULTS && (
        <p className="text-sm">ほか {result.swords.length - MAX_RESULTS} 件。検索語を詳しくすると絞り込めます。</p>
      )}
    </section>
  );

  return (
    <div role="search">
      <label htmlFor={inputId} className="mb-1 block">
        刀の号・銘・刀匠名で探す
      </label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="例：三日月宗近、正宗、國廣"
        autoComplete="off"
        enterKeyHint="search"
        className="w-full rounded border border-brand-text/40 bg-white px-3 py-2 text-base"
      />

      <div aria-live="polite" className={result && total > 0 ? "mt-2 border-b border-brand-text/20 pb-4" : undefined}>
        {state.kind === "loading" && <p className="mt-2 text-sm">読み込み中…</p>}
        {state.kind === "error" && (
          <p className="mt-2 text-sm text-brand-accent">検索の準備に失敗しました。ページを再読み込みしてください。</p>
        )}
        {result && total === 0 && <p className="mt-2 text-sm">「{query.trim()}」に一致する刀・刀匠は見つかりませんでした。</p>}
        {result?.featured && (
          <ul className="mt-4">
            <SwordItem hit={result.featured} featured />
          </ul>
        )}
        {result && (result.smithsFirst ? [smithSection, swordSection] : [swordSection, smithSection])}
      </div>
    </div>
  );
}
