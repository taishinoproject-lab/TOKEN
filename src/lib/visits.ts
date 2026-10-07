// 訪剣帖（T-210）：訪問記録を、ブラウザの localStorage にだけ保存する（サーバーには送らない。D-008）。
// 写真の機能は持たない（D-003）。localStorage が使えない・値が壊れているときも、画面が壊れないようにする。
import type { IsoDate } from "./date";
import { normalizeForSearch } from "./normalize";

/** localStorage のキー。形式を変えるときは末尾の版を上げる（旧デモの "token_visits" とは形式が違うため使わない） */
export const VISITS_STORAGE_KEY = "token:visits:v1";

/** 同じページの中の別の部品（地図など）に、記録が変わったことを知らせるイベントの名前 */
export const VISITS_CHANGED_EVENT = "token:visits-changed";

/** ひとことの最大の文字数 */
export const NOTE_MAX_LENGTH = 200;

/** 記録の最大件数（localStorage の容量を使い切らないため） */
export const VISITS_MAX = 500;

export interface Visit {
  id: string;
  exhibitionId: string;
  /** 記録した時点の展覧会名と館名。データから展覧会が消えても、記録は読めるように残す */
  exhibitionTitle: string;
  venueId: string;
  venueName: string;
  /** 訪問日 */
  date: IsoDate;
  /** ひとこと（空でもよい） */
  note: string;
  /** 記録した日時（ISO 8601）。同じ訪問日の記録の並び順に使う */
  createdAt: string;
}

/** 訪剣帖で選べる展覧会（ビルド時に埋め込む） */
export interface VisitExhibitionOption {
  id: string;
  title: string;
  venueId: string;
  venueName: string;
  start_date: IsoDate;
  end_date: IsoDate | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

const isNonEmptyString = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** 1件の記録として正しい形か。正しくなければ null */
export function toVisit(value: unknown): Visit | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  if (
    !isNonEmptyString(v.id) ||
    !isNonEmptyString(v.exhibitionId) ||
    !isNonEmptyString(v.exhibitionTitle) ||
    !isNonEmptyString(v.venueId) ||
    !isNonEmptyString(v.venueName) ||
    !isIsoDate(v.date) ||
    typeof v.note !== "string" ||
    typeof v.createdAt !== "string"
  ) {
    return null;
  }
  return {
    id: v.id,
    exhibitionId: v.exhibitionId,
    exhibitionTitle: v.exhibitionTitle,
    venueId: v.venueId,
    venueName: v.venueName,
    date: v.date,
    note: v.note.slice(0, NOTE_MAX_LENGTH),
    createdAt: v.createdAt,
  };
}

export interface ParsedVisits {
  visits: Visit[];
  /** 読めなかった記録があったか（値が壊れていた） */
  hadInvalid: boolean;
}

/** localStorage の文字列から記録を読み出す。壊れた記録は飛ばし、全体が壊れていれば空にする */
export function parseVisits(raw: string | null): ParsedVisits {
  if (raw === null || raw === "") return { visits: [], hadInvalid: false };
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { visits: [], hadInvalid: true };
  }
  if (!Array.isArray(data)) return { visits: [], hadInvalid: true };
  const visits: Visit[] = [];
  const seen = new Set<string>();
  let hadInvalid = false;
  for (const item of data) {
    const visit = toVisit(item);
    if (!visit || seen.has(visit.id)) {
      hadInvalid = true;
      continue;
    }
    seen.add(visit.id);
    visits.push(visit);
  }
  return { visits: sortVisits(visits), hadInvalid };
}

/** 新しい順（訪問日の新しい順、同じ日なら記録した順の新しい順） */
export function sortVisits(visits: readonly Visit[]): Visit[] {
  return [...visits].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
    return 0;
  });
}

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** ブラウザの localStorage。使えない環境（設定で無効、プライベートブラウズの一部など）では null */
export function browserStorage(): StorageLike | null {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const probe = `${VISITS_STORAGE_KEY}:probe`;
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export interface LoadedVisits extends ParsedVisits {
  /** localStorage が使えるか */
  available: boolean;
}

export function loadVisits(storage: StorageLike | null): LoadedVisits {
  if (!storage) return { visits: [], hadInvalid: false, available: false };
  try {
    return { ...parseVisits(storage.getItem(VISITS_STORAGE_KEY)), available: true };
  } catch {
    return { visits: [], hadInvalid: false, available: false };
  }
}

/** 保存する。容量不足などで保存できなければ false */
export function saveVisits(storage: StorageLike | null, visits: readonly Visit[]): boolean {
  if (!storage) return false;
  try {
    storage.setItem(VISITS_STORAGE_KEY, JSON.stringify(visits));
    return true;
  } catch {
    return false;
  }
}

export interface VisitInput {
  exhibitionId: string;
  date: string;
  note: string;
}

/** 入力の誤り。誤りがなければ空の配列 */
export function validateVisitInput(
  input: VisitInput,
  options: readonly Pick<VisitExhibitionOption, "id">[],
  today: IsoDate,
): string[] {
  const errors: string[] = [];
  if (!options.some((o) => o.id === input.exhibitionId)) errors.push("展覧会を選んでください。");
  if (!isIsoDate(input.date)) errors.push("訪問日を入れてください。");
  else if (input.date > today) errors.push("訪問日に、今日より後の日付は入れられません。");
  if ([...input.note].length > NOTE_MAX_LENGTH) errors.push(`ひとことは${NOTE_MAX_LENGTH}文字までです。`);
  return errors;
}

/** 新しい記録を作る（入力は validateVisitInput で確認済みのもの） */
export function createVisit(input: VisitInput, option: VisitExhibitionOption, now: Date, id: string): Visit {
  return {
    id,
    exhibitionId: option.id,
    exhibitionTitle: option.title,
    venueId: option.venueId,
    venueName: option.venueName,
    date: input.date,
    note: input.note.trim(),
    createdAt: now.toISOString(),
  };
}

/** 記録を足す（新しい順に並べ、最大件数を超えたら古いものから消す） */
export function addVisit(visits: readonly Visit[], visit: Visit): Visit[] {
  return sortVisits([visit, ...visits]).slice(0, VISITS_MAX);
}

export function removeVisit(visits: readonly Visit[], id: string): Visit[] {
  return visits.filter((v) => v.id !== id);
}

/** 記録した館のID（地図のピンに「訪問済み」と出す） */
export function visitedVenueIds(visits: readonly Pick<Visit, "venueId">[]): Set<string> {
  return new Set(visits.map((v) => v.venueId));
}

/** 展覧会の検索（展覧会名・館名。表記の揺れは検索と同じ正規化でそろえる）。開始日の新しい順 */
export function searchExhibitionOptions(
  options: readonly VisitExhibitionOption[],
  query: string,
): VisitExhibitionOption[] {
  const q = normalizeForSearch(query);
  const sorted = [...options].sort((a, b) => (a.start_date < b.start_date ? 1 : a.start_date > b.start_date ? -1 : 0));
  if (q === "") return sorted;
  return sorted.filter((o) => normalizeForSearch(`${o.title}${o.venueName}`).includes(q));
}

/** 記録のID。crypto.randomUUID が使えなければ、時刻と乱数で作る */
export function newVisitId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // 下で作る
  }
  return `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
