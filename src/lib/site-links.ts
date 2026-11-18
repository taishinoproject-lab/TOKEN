// フッターに置く、外部のフォームなどへのリンク。
// URL はオーナーが決めて入れる。null の間は、リンクにせず「（準備中）」を付けた文字だけを表示する。
// 例: url: "https://forms.gle/xxxxxxxx"

export interface FooterLink {
  label: string;
  url: string | null;
}

export const footerLinks: readonly FooterLink[] = [
  // 展示情報の提供・誤りの報告の受付先（フォームなど）
  { label: "展示情報の提供・誤りの報告", url: null },
  // 運営の応援の受付先
  { label: "運営を応援したい方へ", url: null },
];

/** 表示する文字。URL が未設定なら「（準備中）」を付ける。 */
export function footerLinkText(link: FooterLink): string {
  return link.url ? link.label : `${link.label}（準備中）`;
}
