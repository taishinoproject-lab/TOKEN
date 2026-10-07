// 白鞘の号表示（案Aの .saya）。号を縦書きの筆文字で大きく見せる装飾。
// 見出し（h1）と同じ内容なので、読み上げからは外す（aria-hidden）。
// 筆の書体に字形がない字を含む号と、号がない刀（種別＋銘を出す）は明朝で表示する（src/lib/saya.ts）。
import { sayaFont, sayaSize } from "../../lib/saya";

interface Props {
  /** 大きく出す文字（号。号がなければ種別＋銘） */
  text: string;
  /** text が号か */
  isGo: boolean;
  /** 読み（号のよみ） */
  reading?: string | null;
  /** 脇に添える文字（号があれば種別＋銘、なければ刀匠名） */
  side?: string;
}

export default function Saya({ text, isGo, reading, side }: Props) {
  return (
    <div className="saya" aria-hidden="true" data-size={sayaSize(text)}>
      <span className="go" data-font={sayaFont(text, isGo)}>
        {text}
      </span>
      {reading && <span className="yomi">{reading}</span>}
      {side && <span className="mei">{side}</span>}
      <span className="meki" />
    </div>
  );
}
