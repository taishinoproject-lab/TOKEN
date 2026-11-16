// 共通部品（src/components/ui/）で使う、表示用の小さな関数。
import type { Designation, Source, Sword } from "./schema";

/** 目録の番号。01、02 … のように2桁にそろえる（index は 0 から） */
export function catalogNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** 指定の印を出すか。「未指定」「不明」は出さない */
export function hasDesignationMark(designation: Designation | null | undefined): designation is Designation {
  return Boolean(designation) && designation !== "未指定" && designation !== "不明";
}

/** 出典の取得日のうち、いちばん新しい日 */
export function latestRetrievedAt(sources: readonly Pick<Source, "retrieved_at">[]): string | undefined {
  return sources.reduce<string | undefined>((latest, s) => (!latest || s.retrieved_at > latest ? s.retrieved_at : latest), undefined);
}

/** 作品データの銘の欄。銘の種類が「銘」以外（金象嵌銘・朱銘など）なら前に付ける */
export function meiText(sword: Pick<Sword, "mei" | "mei_kind">): string {
  const kind = sword.mei_kind?.trim();
  return kind && kind !== "銘" && kind !== sword.mei ? `${kind} ${sword.mei}` : sword.mei;
}

/** 旧データから機械的に移した出典に付けた、仮の題名の先頭（docs/migration-notes.md）。「旧データ（src/data）に記載のURL…」と「旧データ（legacy/src/data/swords.ts の …）で…」の両方に当てはまる。 */
export const LEGACY_SOURCE_TITLE_PREFIX = "旧データ（";

/**
 * 旧データ由来で、内容を確認していない出典かどうか。
 * この出典は画面に出さない（題名が作業用の文言で、リンク先の内容も確認できていないため）。
 * データには残し、公式ページで確認できたものから、題名を付け直して表示に戻す。
 */
export function isLegacyPlaceholderSource(source: Pick<Source, "title">): boolean {
  return source.title?.startsWith(LEGACY_SOURCE_TITLE_PREFIX) ?? false;
}

/**
 * 同じ出典（URLと名前が同じもの）を1つにまとめる。自動収集では、引用ごとに同じページが何度も入るため。
 * 取得日は新しいほうを残す。
 */
export function uniqueSources<T extends Pick<Source, "url" | "title" | "retrieved_at">>(sources: readonly T[]): T[] {
  const byKey = new Map<string, T>();
  for (const s of sources) {
    const key = `${s.url}\u0000${s.title ?? ""}`;
    const prev = byKey.get(key);
    if (!prev || s.retrieved_at > prev.retrieved_at) byKey.set(key, s);
  }
  return [...byKey.values()];
}
