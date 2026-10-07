// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

// 公開先のURL（例: https://example.com）。公開先が決まるまでは未設定でよい。
// 設定すると、カレンダー購読のリンクと .ics の中に絶対URLが入る。
const site = process.env.SITE_URL || undefined;

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site,
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
