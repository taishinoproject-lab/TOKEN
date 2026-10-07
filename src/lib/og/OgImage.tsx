// シェア用画像（T-208、OGP）の見た目。satori に渡す部品（描画は render.ts）。
// 見た目は案A（docs/design/proposal-a.html の「③ シェア用画像」）：白木の地、右に縦書きの号と銘、左にロゴと刀匠・指定・所蔵。
// satori は縦書き（writing-mode）に対応していないため、縦の文字は1文字ずつ縦に積んで組む（card.ts の fitVertical）。
import type { ReactNode } from "react";
import { sayaSize } from "../saya";
import { fitVertical, type OgCard } from "./card";

/** 画像の大きさ（render.ts と合わせる） */
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

// docs/design/system.md §1 の色
const C = {
  shiraki: "#F3EDE1",
  sumi: "#1E1B18",
  usuzumi: "#5C554D",
  shu: "#A23B2A",
  mokume: "#CFC2AB",
};

const PAD_Y = 56;
const PAD_X = 72;
/** 縦の文字を置ける高さ（上下の余白を除く） */
const COLUMN_HEIGHT = OG_HEIGHT - PAD_Y * 2;
const LINE_HEIGHT = 1.1;

/** 号は文字数が多いほど小さくする（刀剣詳細の白鞘と同じ4段階。src/lib/saya.ts） */
const GO_MAX_SIZE = { l: 84, m: 72, s: 60, xs: 46 } as const;

function VerticalColumns({
  text,
  font,
  weight,
  max,
  min,
  maxColumns,
  color,
  height = COLUMN_HEIGHT,
}: {
  text: string;
  font: string;
  weight: number;
  max: number;
  min: number;
  maxColumns: number;
  color: string;
  height?: number;
}) {
  const { columns, size } = fitVertical(text, { height, max, min, lineHeight: LINE_HEIGHT, maxColumns });
  return (
    <div style={{ display: "flex", flexDirection: "row-reverse", gap: size * 0.35 }}>
      {columns.map((column, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: size }}>
          {column.map((char, j) =>
            char === null ? (
              <div key={j} style={{ height: size * 0.5 }} />
            ) : (
              <div
                key={j}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: size * LINE_HEIGHT,
                  fontFamily: font,
                  fontWeight: weight,
                  fontSize: size,
                  lineHeight: 1,
                  color,
                }}
              >
                {char}
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

/** 案Aの二重罫（3px double）。satori は border-style: double に対応していないため、2本の線で描く */
function DoubleRule() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ height: 1.5, background: C.sumi }} />
      <div style={{ height: 1.5, background: C.sumi }} />
    </div>
  );
}

function titleSize(title: string): number {
  const length = [...title].length;
  if (length <= 14) return 44;
  if (length <= 24) return 38;
  if (length <= 36) return 32;
  return 28;
}

export default function OgImage({ card }: { card: OgCard }): ReactNode {
  const isGo = card.isGo;
  const mainMax = isGo ? GO_MAX_SIZE[sayaSize(card.main)] : card.title ? 60 : 72;
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row-reverse",
        alignItems: "stretch",
        width: OG_WIDTH,
        height: OG_HEIGHT,
        padding: `${PAD_Y}px ${PAD_X}px`,
        background: C.shiraki,
        color: C.sumi,
        fontFamily: "mincho",
      }}
    >
      {/* 白鞘の継ぎ目を思わせる縦の細罫と、目釘穴の円 */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 36, width: 1.5, background: C.mokume }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, right: 36, width: 1.5, background: C.mokume }} />
      <div
        style={{
          position: "absolute",
          left: OG_WIDTH / 2 - 7,
          bottom: 36,
          width: 14,
          height: 14,
          borderRadius: 7,
          border: `1.5px solid ${C.mokume}`,
        }}
      />

      {/* 右：縦書きの号（または刀匠名・館名） */}
      {card.main && (
        <VerticalColumns
          text={card.main}
          font={card.mainFont}
          weight={card.mainFont === "fude" ? 400 : 600}
          max={mainMax}
          min={isGo ? 40 : 34}
          maxColumns={isGo ? 2 : 3}
          color={C.sumi}
        />
      )}

      {/* 号の脇：種別＋銘、または読み */}
      {card.side && (
        <div style={{ display: "flex", marginTop: 24, marginRight: 30 }}>
          <VerticalColumns
            text={card.side}
            font="mincho"
            weight={400}
            max={28}
            min={18}
            maxColumns={3}
            color={C.usuzumi}
            height={COLUMN_HEIGHT - 24}
          />
        </div>
      )}

      {/* 左：ロゴと情報 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          flexShrink: 1,
          marginRight: 40,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: "0.16em", lineHeight: 1.4 }}>訪剣</div>
          <div style={{ fontSize: 16, color: C.usuzumi, letterSpacing: "0.2em", lineHeight: 1.6 }}>
            −TOKEN−　推しの刀に、会いにゆく。
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: card.title ? 760 : 640 }}>
          <DoubleRule />
          {card.label && (
            <div
              style={{
                fontFamily: "gothic",
                fontSize: 18,
                color: C.usuzumi,
                letterSpacing: "0.2em",
                marginTop: 18,
                lineHeight: 1.4,
              }}
            >
              {card.label}
            </div>
          )}
          {card.title && (
            <div
              style={{
                fontWeight: 600,
                fontSize: titleSize(card.title),
                lineHeight: 1.4,
                marginTop: 8,
                letterSpacing: "0.04em",
                lineClamp: 3,
              }}
            >
              {/* satori は和文の間の半角空白を詰めてしまうため、全角の空白にする */}
              {card.title.replace(/ +/g, "\u3000")}
            </div>
          )}
          {card.lines.map((line, i) => (
            <div
              key={i}
              style={
                i === 0 && !card.title
                  ? { fontWeight: 600, fontSize: 28, lineHeight: 1.5, marginTop: card.label ? 4 : 18 }
                  : {
                      fontFamily: "gothic",
                      fontSize: 20,
                      color: C.usuzumi,
                      lineHeight: 1.5,
                      marginTop: i === 0 ? 14 : 6,
                    }
              }
            >
              {line}
            </div>
          ))}
          {card.unverified && (
            <div style={{ display: "flex", marginTop: 14 }}>
              <div
                style={{
                  fontFamily: "gothic",
                  fontWeight: 700,
                  fontSize: 16,
                  color: C.shu,
                  border: `1.5px solid ${C.shu}`,
                  padding: "1px 8px",
                  lineHeight: 1.5,
                }}
              >
                要確認
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
