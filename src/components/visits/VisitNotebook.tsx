// 訪剣帖（T-210）。訪れた展覧会の記録を、この端末のブラウザ（localStorage）にだけ保存する（D-008）。
// 写真の機能は持たない（D-003）。記録の追加（展覧会を選ぶ→訪問日・ひとこと→保存）、一覧（新しい順）、削除。
import { useId, useMemo, useState, type SubmitEvent } from "react";
import { formatDateRange, formatFullDate, todayJst, type IsoDate } from "../../lib/date";
import {
  addVisit,
  createVisit,
  NOTE_MAX_LENGTH,
  newVisitId,
  removeVisit,
  searchExhibitionOptions,
  validateVisitInput,
  type VisitExhibitionOption,
} from "../../lib/visits";
import { useVisits } from "./useVisits";
import "./notebook.css";

interface Props {
  exhibitions: VisitExhibitionOption[];
  buildToday: IsoDate;
}

/** 検索結果として一度に並べる件数 */
const OPTIONS_SHOWN = 8;

export default function VisitNotebook({ exhibitions, buildToday }: Props) {
  const { visits, ready, available, hadInvalid, save } = useVisits();
  const [query, setQuery] = useState("");
  const [exhibitionId, setExhibitionId] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const ids = useId();
  // 未来の日付を選べないように、ブラウザで今日の日付を使う（ビルドした日ではない）
  const today = ready ? todayJst() : buildToday;

  const matches = useMemo(() => searchExhibitionOptions(exhibitions, query), [exhibitions, query]);
  const shown = matches.slice(0, OPTIONS_SHOWN);
  const selected = exhibitions.find((e) => e.id === exhibitionId);

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const input = { exhibitionId, date, note };
    const found = validateVisitInput(input, exhibitions, todayJst());
    if (found.length > 0 || !selected) {
      setErrors(found);
      return;
    }
    const next = addVisit(visits, createVisit(input, selected, new Date(), newVisitId()));
    if (!save(next)) {
      setErrors(["保存できませんでした。ブラウザの設定で、サイトのデータの保存が無効になっていないか確認してください。"]);
      return;
    }
    setErrors([]);
    setNote("");
    setExhibitionId("");
    setQuery("");
    setMessage(`「${selected.title}」の記録を保存しました。`);
  };

  const onDelete = (id: string, title: string) => {
    if (!window.confirm(`「${title}」の記録を削除します。よろしいですか。`)) return;
    if (save(removeVisit(visits, id))) setMessage(`「${title}」の記録を削除しました。`);
    else setMessage("削除できませんでした。");
  };

  return (
    <section className="sec notebook" aria-labelledby={`${ids}-h`}>
      <div className="sec-h">
        <h2 id={`${ids}-h`}>訪剣帖</h2>
        <span className="aside">訪れた展覧会の記録。この端末のブラウザの中にだけ保存します</span>
      </div>
      <p className="note-line">
        記録はサーバーには送りません。ブラウザのデータを消すと、記録も消えます。別の端末やブラウザとは共有されません。
      </p>

      {ready && !available && (
        <div className="warn" role="note">
          <p>
            このブラウザでは記録を保存できません。プライベートブラウズを使っているか、サイトのデータの保存が無効になっている可能性があります。
          </p>
        </div>
      )}
      {ready && hadInvalid && (
        <div className="warn" role="note">
          <p>読み込めなかった記録がありました。読み込めた記録だけを表示しています。</p>
        </div>
      )}

      <form className="nb-form" onSubmit={onSubmit} noValidate>
        <fieldset disabled={ready && !available}>
          <legend className="cap">記録を追加</legend>

          <label className="nb-label" htmlFor={`${ids}-q`}>
            1. 展覧会を選ぶ
          </label>
          <div className="search-box">
            <input
              id={`${ids}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="展覧会名・館名で探す"
              autoComplete="off"
              aria-describedby={`${ids}-count`}
            />
          </div>
          <p id={`${ids}-count`} className="nb-hint" aria-live="polite">
            {matches.length === 0
              ? "当てはまる展覧会はありません。"
              : matches.length > OPTIONS_SHOWN
                ? `${matches.length}件のうち${OPTIONS_SHOWN}件を表示しています。語句を足すと絞り込めます。`
                : `${matches.length}件`}
          </p>
          <div className="nb-options" role="radiogroup" aria-label="展覧会">
            {shown.map((ex) => (
              <label key={ex.id} className="nb-option" data-checked={ex.id === exhibitionId || undefined}>
                <input
                  type="radio"
                  name={`${ids}-ex`}
                  value={ex.id}
                  checked={ex.id === exhibitionId}
                  onChange={() => setExhibitionId(ex.id)}
                />
                <span>
                  <span className="t">{ex.title}</span>
                  <span className="v">
                    {ex.venueName}　{formatDateRange(ex.start_date, ex.end_date)}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {selected && !shown.some((s) => s.id === selected.id) && (
            <p className="nb-hint">選んでいる展覧会：{selected.title}（{selected.venueName}）</p>
          )}

          <div className="nb-row">
            <div>
              <label className="nb-label" htmlFor={`${ids}-date`}>
                2. 訪問日
              </label>
              <input
                id={`${ids}-date`}
                className="nb-input tnum"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <label className="nb-label" htmlFor={`${ids}-note`}>
            3. ひとこと<small>（任意・{NOTE_MAX_LENGTH}文字まで）</small>
          </label>
          <textarea
            id={`${ids}-note`}
            className="nb-input"
            rows={3}
            maxLength={NOTE_MAX_LENGTH}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例：初めて生で見た。地鉄の美しさに見入った。"
          />

          {errors.length > 0 && (
            <ul className="nb-errors" role="alert">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
          <button type="submit" className="btn nb-submit" data-primary>
            記録を保存する
          </button>
        </fieldset>
      </form>
      <p className="nb-message" role="status">
        {message}
      </p>

      <h3 className="cap nb-list-h">
        記録<span>{ready ? `${visits.length}件・訪問日の新しい順` : "読み込んでいます…"}</span>
      </h3>
      {ready && visits.length === 0 && <p className="nb-empty">まだ記録はありません。</p>}
      {visits.length > 0 && (
        <ul className="nb-list">
          {visits.map((v) => (
            <li key={v.id}>
              <div className="date tnum">
                <b>{formatFullDate(v.date)}</b>
              </div>
              <div className="body">
                <a className="t" href={`/exhibitions/${v.exhibitionId}`}>
                  {v.exhibitionTitle}
                </a>
                <a className="v" href={`/venues/${v.venueId}`}>
                  {v.venueName}
                </a>
                {v.note && <p className="n">{v.note}</p>}
              </div>
              <button type="button" className="nb-delete" onClick={() => onDelete(v.id, v.exhibitionTitle)}>
                削除<span className="sr-only">（{v.exhibitionTitle}、{formatFullDate(v.date)}）</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
