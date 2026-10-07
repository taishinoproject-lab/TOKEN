import { describe, expect, it } from "vitest";
import { readCmapCodePoints } from "./cmap.ts";

/** cmap 表だけを持つ、最小のフォントファイルを組み立てる */
function fontWithCmap(subtable: number[]): Uint8Array {
  const bytes: number[] = [];
  const u16 = (v: number) => bytes.push((v >> 8) & 0xff, v & 0xff);
  const u32 = (v: number) => bytes.push((v >>> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff);
  // オフセット表（表は1つ）
  u32(0x00010000);
  u16(1);
  u16(0);
  u16(0);
  u16(0);
  // 表の一覧：cmap は 28 バイト目から
  bytes.push(..."cmap".split("").map((c) => c.charCodeAt(0)));
  u32(0);
  u32(28);
  u32(12 + subtable.length);
  // cmap の見出しと、符号化の一覧（1つ）
  u16(0);
  u16(1);
  u16(3);
  u16(10);
  u32(12);
  bytes.push(...subtable);
  return Uint8Array.from(bytes);
}

function words(values: number[], size: 2 | 4): number[] {
  return values.flatMap((v) =>
    size === 2 ? [(v >> 8) & 0xff, v & 0xff] : [(v >>> 24) & 0xff, (v >> 16) & 0xff, (v >> 8) & 0xff, v & 0xff],
  );
}

describe("readCmapCodePoints", () => {
  it("format 4：idDelta の区間と、glyphIdArray の区間を読む。字形番号 0 は除く", () => {
    // 区間1：A〜C（idDelta で字形 1〜3）
    // 区間2：あ〜い（glyphIdArray で、あ＝字形 0〔字形なし〕、い＝字形 5）
    // 区間3：終端の 0xFFFF
    const segCount = 3;
    const endCodes = [0x43, 0x3044, 0xffff];
    const startCodes = [0x41, 0x3042, 0xffff];
    const idDeltas = [(1 - 0x41) & 0xffff, 0, 1];
    // 区間2の idRangeOffset：自分の位置から glyphIdArray の先頭までのバイト数（区間3の分 2 ＋ 1）
    const idRangeOffsets = [0, 4, 0];
    const glyphIdArray = [0, 0, 5]; // あ(3042)=0、ぃ(3043)=0、い(3044)=5
    const body = [
      ...words(endCodes, 2),
      0,
      0,
      ...words(startCodes, 2),
      ...words(idDeltas, 2),
      ...words(idRangeOffsets, 2),
      ...words(glyphIdArray, 2),
    ];
    const header = words([4, 14 + body.length, 0, segCount * 2, 0, 0, 0], 2);
    const result = readCmapCodePoints(fontWithCmap([...header, ...body]));
    expect([...result].sort((a, b) => a - b)).toEqual([0x41, 0x42, 0x43, 0x3044]);
  });

  it("format 12：基本多言語面以外の文字も読む", () => {
    const groups = [
      [0x4e00, 0x4e01, 10],
      [0x2000b, 0x2000b, 20],
    ];
    const subtable = [
      ...words([12, 0], 2),
      ...words([16 + groups.length * 12, 0, groups.length], 4),
      ...groups.flatMap((g) => words(g, 4)),
    ];
    const result = readCmapCodePoints(fontWithCmap(subtable));
    expect([...result].sort((a, b) => a - b)).toEqual([0x4e00, 0x4e01, 0x2000b]);
  });

  it("cmap 表がなければエラー", () => {
    const font = fontWithCmap([0, 4]);
    font[12] = "x".charCodeAt(0); // 表の名前を壊す
    expect(() => readCmapCodePoints(font)).toThrow("cmap 表が見つかりません");
  });
});
