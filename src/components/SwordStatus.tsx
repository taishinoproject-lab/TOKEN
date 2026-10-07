// 刀剣の展示状況（data-model.md §9）。
// ビルド時の日付で描画したあと、ブラウザで今日の日付（日本時間）を使って判定し直す。
import { useEffect, useState } from "react";
import { todayJst } from "../lib/date";
import type { Exhibit, Exhibition } from "../lib/schema";
import { swordStatus, swordStatusText } from "../lib/status";

type ExhibitionForStatus = Pick<Exhibition, "id" | "title" | "start_date" | "end_date" | "status" | "periods"> & {
  exhibits: Pick<Exhibit, "sword_id" | "period_ids">[];
};

interface Props {
  swordId: string;
  holderText: string;
  exhibitions: ExhibitionForStatus[];
  /** ビルド時の今日の日付（日本時間） */
  buildToday: string;
}

export default function SwordStatus({ swordId, holderText, exhibitions, buildToday }: Props) {
  const [today, setToday] = useState(buildToday);
  useEffect(() => {
    setToday(todayJst());
  }, []);

  const status = swordStatus(swordId, exhibitions, today);
  const exhibition = status.kind === "none" ? undefined : exhibitions.find((e) => e.id === status.exhibitionId);

  return (
    <p data-status={status.kind}>
      <span className="font-bold">{swordStatusText(status, holderText)}</span>
      {exhibition && (
        <>
          {"："}
          <a href={`/exhibitions/${exhibition.id}`} className="underline">
            {exhibition.title}
          </a>
        </>
      )}
    </p>
  );
}
