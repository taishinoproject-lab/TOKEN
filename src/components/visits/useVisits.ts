// 訪剣帖の記録を読み書きするフック。訪剣帖の部品と地図の部品の両方から使う。
// 記録が変わったら VISITS_CHANGED_EVENT を出し、同じページの別の部品にも反映する。別のタブでの変更は storage イベントで反映する。
import { useCallback, useEffect, useState } from "react";
import { browserStorage, loadVisits, saveVisits, VISITS_CHANGED_EVENT, VISITS_STORAGE_KEY, type Visit } from "../../lib/visits";

export interface VisitsState {
  visits: Visit[];
  /** 読み込みが済んだか（サーバーで作ったHTMLの時点では、記録はまだ読めない） */
  ready: boolean;
  /** localStorage が使えるか */
  available: boolean;
  /** 読めなかった記録があったか */
  hadInvalid: boolean;
}

const initial: VisitsState = { visits: [], ready: false, available: true, hadInvalid: false };

export function useVisits() {
  const [state, setState] = useState<VisitsState>(initial);

  const reload = useCallback(() => {
    setState({ ...loadVisits(browserStorage()), ready: true });
  }, []);

  useEffect(() => {
    reload();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === VISITS_STORAGE_KEY) reload();
    };
    window.addEventListener(VISITS_CHANGED_EVENT, reload);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(VISITS_CHANGED_EVENT, reload);
      window.removeEventListener("storage", onStorage);
    };
  }, [reload]);

  /** 記録を置き換えて保存する。保存できなければ false（画面の記録は変えない） */
  const save = useCallback((next: Visit[]): boolean => {
    if (!saveVisits(browserStorage(), next)) return false;
    window.dispatchEvent(new Event(VISITS_CHANGED_EVENT));
    return true;
  }, []);

  return { ...state, save };
}
