// ページの URL から、そのページのシェア用画像（T-208）の URL を決める。
// 刀剣・刀匠・展覧会のページだけに画像がある（src/pages/og/）。共通レイアウトで使う。

import type { OgKind } from "./card";

const PAGE_WITH_IMAGE = /^\/(swords|smiths|exhibitions)\/([a-z0-9-]+)\/?$/;

/** 画像のあるページなら、その種類とID */
export function ogPage(pathname: string): { kind: OgKind; id: string } | null {
  const match = PAGE_WITH_IMAGE.exec(pathname);
  return match ? { kind: match[1] as OgKind, id: match[2] } : null;
}

/** シェア用画像のパス（例：/swords/mikazuki-munechika → /og/swords/mikazuki-munechika.png）。画像のないページは null */
export function ogImagePath(pathname: string): string | null {
  const page = ogPage(pathname);
  return page ? `/og/${page.kind}/${page.id}.png` : null;
}

/**
 * OGP に入れる URL。OGP の URL は絶対 URL である必要があるため、公開先（SITE_URL、astro.config.mjs の site）から組み立てる。
 * 公開先が未設定のとき（手元でのビルドなど）は、og:url は入れず、画像はサイト内のパスのままにする。
 */
export function ogUrls(pathname: string, site: URL | undefined): { url: string | null; image: string | null } {
  const imagePath = ogImagePath(pathname);
  if (!site) return { url: null, image: imagePath };
  return {
    url: new URL(pathname, site).href,
    image: imagePath ? new URL(imagePath, site).href : null,
  };
}
