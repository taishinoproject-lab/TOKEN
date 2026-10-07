// TrueType / OpenType のフォントファイルから、字形のある文字（Unicode のコードポイント）の一覧を取り出す。
// cmap 表の format 4（基本多言語面）と format 12（全面）だけに対応する。依存パッケージを増やさないために自前で読む。

interface EncodingRecord {
  platformId: number;
  encodingId: number;
  offset: number;
}

/** フォントの cmap 表から、字形のあるコードポイントの集合を返す。 */
export function readCmapCodePoints(font: Uint8Array): Set<number> {
  const view = new DataView(font.buffer, font.byteOffset, font.byteLength);
  const cmapOffset = findTable(view, "cmap");
  if (cmapOffset === null) throw new Error("cmap 表が見つかりません");

  const numTables = view.getUint16(cmapOffset + 2);
  const records: EncodingRecord[] = [];
  for (let i = 0; i < numTables; i++) {
    const p = cmapOffset + 4 + i * 8;
    records.push({
      platformId: view.getUint16(p),
      encodingId: view.getUint16(p + 2),
      offset: cmapOffset + view.getUint32(p + 4),
    });
  }

  // 全面を含む format 12 を優先し、なければ format 4 を使う
  const byFormat = (format: number) => records.find((r) => view.getUint16(r.offset) === format);
  const format12 = byFormat(12);
  if (format12) return readFormat12(view, format12.offset);
  const format4 = byFormat(4);
  if (format4) return readFormat4(view, format4.offset);
  throw new Error("対応している cmap の形式（4 または 12）がありません");
}

function findTable(view: DataView, tag: string): number | null {
  const numTables = view.getUint16(4);
  for (let i = 0; i < numTables; i++) {
    const p = 12 + i * 16;
    const t = String.fromCharCode(view.getUint8(p), view.getUint8(p + 1), view.getUint8(p + 2), view.getUint8(p + 3));
    if (t === tag) return view.getUint32(p + 8);
  }
  return null;
}

function readFormat12(view: DataView, offset: number): Set<number> {
  const result = new Set<number>();
  const numGroups = view.getUint32(offset + 12);
  for (let i = 0; i < numGroups; i++) {
    const p = offset + 16 + i * 12;
    const start = view.getUint32(p);
    const end = view.getUint32(p + 4);
    const startGlyph = view.getUint32(p + 8);
    for (let c = start; c <= end; c++) {
      // 字形番号 0 は「字形なし」（.notdef）
      if (startGlyph + (c - start) !== 0) result.add(c);
    }
  }
  return result;
}

function readFormat4(view: DataView, offset: number): Set<number> {
  const result = new Set<number>();
  const segCount = view.getUint16(offset + 6) / 2;
  const endCodes = offset + 14;
  const startCodes = endCodes + segCount * 2 + 2;
  const idDeltas = startCodes + segCount * 2;
  const idRangeOffsets = idDeltas + segCount * 2;
  for (let i = 0; i < segCount; i++) {
    const end = view.getUint16(endCodes + i * 2);
    const start = view.getUint16(startCodes + i * 2);
    const delta = view.getInt16(idDeltas + i * 2);
    const rangeOffsetPos = idRangeOffsets + i * 2;
    const rangeOffset = view.getUint16(rangeOffsetPos);
    for (let c = start; c <= end; c++) {
      if (c === 0xffff) continue;
      let glyph: number;
      if (rangeOffset === 0) {
        glyph = (c + delta) & 0xffff;
      } else {
        const g = view.getUint16(rangeOffsetPos + rangeOffset + (c - start) * 2);
        glyph = g === 0 ? 0 : (g + delta) & 0xffff;
      }
      if (glyph !== 0) result.add(c);
    }
  }
  return result;
}
