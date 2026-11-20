// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://ypereirareis.github.io",
  trailingSlash: "always",
  build: {
    // Inline small stylesheets to avoid render-blocking requests.
    inlineStylesheets: "auto",
  },
  prefetch: false,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      wrap: false,
    },
  },
});
