// @ts-check
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/", ".astro/", ".lighthouseci/", "node_modules/", "site/"],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  ...astro.configs["jsx-a11y-strict"],
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
);
