---
title: "An Astro site on GitHub Pages: typed content, quality gates, one pipeline"
description: "A step-by-step guide to a static Astro site: typed content, zero JavaScript, build-time images, quality gates and a GitHub Pages pipeline."
pubDate: 2026-11-23
tags: [platform, development]
draft: false
---

This site is a small platform in itself: static pages generated from typed content, quality gates that block every pull request, and a pipeline that deploys exactly what was tested. This post walks through every piece so that you can rebuild the same setup for your own site.

The full source is public: [ypereirareis/ypereirareis.github.io](https://github.com/ypereirareis/ypereirareis.github.io).

## What we are building

| Concern        | Choice                                                                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Site generator | [Astro](https://astro.build/), fully static output                                                                                              |
| Content        | Markdown posts and a YAML resume, validated by [Zod](https://zod.dev/) schemas at build time                                                    |
| Styling        | Plain CSS with design tokens, system fonts, light and dark themes                                                                               |
| JavaScript     | None, except a tiny theme toggle                                                                                                                |
| SEO            | Canonical URLs, Open Graph, JSON-LD, sitemap, RSS, generated share images                                                                       |
| Quality        | ESLint, Prettier, markdownlint, type checks, pa11y, Lighthouse, lychee (see [Quality gates](#6-quality-gates))                                  |
| Delivery       | One [GitHub Actions](https://docs.github.com/en/actions) workflow: build once, test, deploy to [GitHub Pages](https://docs.github.com/en/pages) |

Three principles drive every decision:

- **Everything is code**: settings, content schemas, quality thresholds and repository rules live in the repository.
- **Fail the build, not the reader**: a missing description, a broken link or a contrast issue stops the pull request.
- **Deploy what you tested**: the artifact that passed the checks is the one that goes live.

## 1. Project setup

Pin the toolchain ([Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)) so that every machine and every CI run uses the same versions. [Corepack](https://nodejs.org/api/corepack.html) installs the pnpm version declared in the project, and the [Astro installation guide](https://docs.astro.build/en/install-and-setup/) covers the scaffolding:

```bash
echo 24 > .node-version            # read by actions/setup-node, fnm, mise and most version managers
corepack enable                     # bundled with Node 24: installs the pnpm version pinned in package.json
pnpm create astro@latest my-site -- --template minimal
```

In `package.json`, pin pnpm and declare the scripts used locally and in CI:

```json
{
  "packageManager": "pnpm@12.21.0",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "check": "astro check",
    "lint": "pnpm run lint:code && pnpm run lint:format && pnpm run lint:md",
    "test:a11y": "start-server-and-test 'sirv dist --port 4322 --quiet' http://localhost:4322 'pnpm run test:a11y:light && pnpm run test:a11y:dark'",
    "test:lighthouse": "lhci autorun"
  }
}
```

Recent pnpm versions refuse to run dependency install scripts unless you allow them explicitly. Allow only what you need in [`pnpm-workspace.yaml`](https://pnpm.io/pnpm-workspace_yaml):

```yaml
allowBuilds:
  puppeteer: true # downloads the browser used by pa11y
```

The resulting layout stays small:

```text
src/
  site.config.ts        # identity, menu, home page sections, post topics
  content.config.ts     # Zod schemas for posts and resume
  layouts/              # page shell (head, header, footer)
  content/blog/         # posts (Markdown)
  content/cv/cv.yaml    # resume data
  lib/                  # post queries, JSON-LD and share image helpers
  components/           # head (SEO), header, footer, post list, icons
  pages/                # routes, RSS, robots.txt, generated images
  styles/global.css     # design tokens and theme
.github/actions/setup/  # shared CI setup: pnpm, Node, frozen install
.github/workflows/      # CI/CD, weekly link check, OpenSSF Scorecard
```

## 2. Configuration as code

Astro needs the final URL to generate canonical links, the sitemap and the RSS feed. Every option is described in the [configuration reference](https://docs.astro.build/en/reference/configuration-reference/):

```js
// astro.config.mjs
export default defineConfig({
  site: "https://ypereirareis.github.io",
  trailingSlash: "always",
  build: { inlineStylesheets: "auto" }, // no render-blocking CSS request
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false, // emit both themes as CSS variables
    },
  },
});
```

Everything a visitor can read about the site owner lives in one typed file, `src/site.config.ts`: name, job title, profile links, menu, home page sections and the list of allowed post topics. Changing the menu order or a section of the home page is a one-line pull request, and the TypeScript compiler catches typos.

## 3. Typed content

[Content collections](https://docs.astro.build/en/guides/content-collections/) turn front matter mistakes into build errors. The schema for posts:

```ts
// src/content.config.ts
const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string().max(130),
    description: z.string().min(20).max(300),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.enum(TOPICS)).min(1).max(2),
    draft: z.boolean().default(false),
  }),
});
```

A post with an unknown topic, no description or three tags does not build. Topics describe what a post is about (development, architecture, infrastructure, platform, operations, security), not the technologies, which keeps the taxonomy small.

Drafts are visible in development only:

```ts
// src/lib/posts.ts
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection("blog", ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
```

Everything derived from dates is computed at build time, never by hand:

- the latest posts on the home page and on `/posts/`, older ones in a collapsed "Archived" section (a native `<details>` element, no JavaScript);
- the "previous" and "next" links at the end of each post, taken among published posts only so that a draft is never linked;
- an "outdated" notice on posts whose last update is older than three years.

## 4. Zero JavaScript by default

### Design tokens and themes

All colors are CSS custom properties defined with [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark), so the browser picks the right value from the color scheme:

```css
:root {
  color-scheme: light dark;
  --bg: light-dark(#ffffff, #0f1020);
  --text: light-dark(#1a1b2e, #e8e8f0);
  --primary: light-dark(#4338ca, #a5b4fc);
}
```

Every text and background pair is checked against [WCAG](https://www.w3.org/WAI/standards-guidelines/wcag/) before it is used: at least 4.5:1, and 7:1 for body text. The accessibility audits described below enforce it in both themes.

### Code highlighting without a client library

[Shiki](https://shiki.style/) highlights code blocks at build time ([syntax highlighting in Astro](https://docs.astro.build/en/guides/syntax-highlighting/)). With [`defaultColor: false`](https://shiki.style/guide/dual-themes), each token carries both theme colors as variables, and one rule switches them:

```css
.astro-code,
.astro-code span {
  color: light-dark(var(--shiki-light), var(--shiki-dark));
  background-color: light-dark(var(--shiki-light-bg), var(--shiki-dark-bg));
}
```

Two colors of the GitHub themes fail WCAG AA (an orange in the light theme, comments in the dark theme). They are overridden with targeted rules:

```css
.astro-code span[style*="--shiki-light:#E36209"] {
  --shiki-light: #b35000 !important; /* 5.2:1 instead of 3.5:1 */
}
```

### The only script: a theme toggle

The header button forces the light or dark theme. Forcing a theme is just setting [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme), because every color already uses `light-dark()`:

```css
:root[data-theme="light"] {
  color-scheme: light;
}
:root[data-theme="dark"] {
  color-scheme: dark;
}
```

A few lines of inline script in the `<head>` apply the stored choice before the first paint, so there is no flash. The button itself is rendered with the `hidden` attribute and only revealed by its script: without JavaScript, the site simply follows the system preference.

## 5. SEO and sharing, generated at build time

The shared head component builds every SEO tag from the page props:

- a canonical URL from `Astro.site` and the page path;
- a `<title>` that carries the job title on the home page and the resume, and the post title alone on posts;
- [Open Graph](https://ogp.me/) and Twitter tags, `article:tag` for post topics, `max-image-preview:large`;
- [JSON-LD](https://json-ld.org/) with [schema.org](https://schema.org/) types: `Person`, `WebSite`, `ProfilePage` (with `dateModified`), `BlogPosting` and `BreadcrumbList`.

`robots.txt` and the RSS feed are tiny [endpoints](https://docs.astro.build/en/guides/endpoints/) (the feed uses [`@astrojs/rss`](https://docs.astro.build/en/recipes/rss/)), and the sitemap comes from the official [`@astrojs/sitemap`](https://docs.astro.build/en/guides/integrations-guide/sitemap/) integration:

```ts
// src/pages/robots.txt.ts
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap-index.xml", site).href}\n`);
```

### Share images without a headless browser

Each post gets its own 1200×630 image, rendered from an SVG template with [sharp](https://sharp.pixelplumbing.com/) during the build, in a [static endpoint](https://docs.astro.build/en/guides/endpoints/#static-file-endpoints). The hard part is wrapping long titles: counting characters fails as soon as a title is full of capitals. Measuring is more reliable: render each word with the same font, trim the transparent pixels, and read the width:

```ts
async function textWidth(text: string, fontSize: number, bold: boolean): Promise<number> {
  // Same font family as the image template, otherwise the measure is meaningless.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${text.length * fontSize}" height="${fontSize * 2}">
    <text x="10" y="${fontSize * 1.4}" font-family="DejaVu Sans" font-size="${fontSize}"
      font-weight="${bold ? 700 : 400}">${escapeXml(text)}</text></svg>`;
  const { info } = await sharp(Buffer.from(svg))
    .flatten({ background: "#fff" })
    .trim()
    .toBuffer({ resolveWithObject: true });
  return info.width;
}
```

Words are measured once and cached; a line is the sum of its words plus spaces. Measuring words instead of whole lines keeps the build fast, because each word is rendered only once for the whole site.

## 6. Quality gates

| Gate          | Tool                                                                                                                                                                             | Fails when                                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Lint          | [ESLint](https://eslint.org/) with [TypeScript](https://typescript-eslint.io/), [Astro](https://ota-meshi.github.io/eslint-plugin-astro/) and `jsx-a11y` rules                   | Any lint error, including missing alt texts or labels                                 |
| Format        | [Prettier](https://prettier.io/), [markdownlint](https://github.com/DavidAnson/markdownlint-cli2)                                                                                | Unformatted file, code block without language                                         |
| Types         | [`astro check`](https://docs.astro.build/en/reference/cli-reference/#astro-check) with the strictest [TypeScript](https://www.typescriptlang.org/) preset                        | Type error or invalid front matter                                                    |
| Accessibility | [pa11y-ci](https://github.com/pa11y/pa11y-ci) with [axe](https://github.com/dequelabs/axe-core) and [HTML_CodeSniffer](https://squizlabs.github.io/HTML_CodeSniffer/), WCAG 2 AA | Any violation, on every page (light) and per template (dark)                          |
| Performance   | [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci), five key pages, median of three runs                                                                             | Performance or best practices below 95, accessibility or SEO below 100                |
| Links         | [lychee](https://github.com/lycheeverse/lychee), offline                                                                                                                         | A broken internal link                                                                |
| Commits       | [commitlint](https://commitlint.js.org/)                                                                                                                                         | A commit message outside [Conventional Commits](https://www.conventionalcommits.org/) |

### Accessibility on every page, in both themes

pa11y reads the sitemap, so new pages are audited without touching any configuration. The dark theme gets its own pass with a browser started in dark mode:

```json
{
  "defaults": {
    "standard": "WCAG2AA",
    "runners": ["axe", "htmlcs"],
    "chromeLaunchConfig": { "args": ["--no-sandbox", "--force-dark-mode"] }
  },
  "urls": ["http://localhost:4322/", "http://localhost:4322/cv/", "http://localhost:4322/posts/"]
}
```

Clicking the theme toggle from pa11y would look simpler, but the choice is stored in `localStorage` and leaks into the following "light" audits of the same browser session.

### Performance budgets

Lighthouse CI serves `dist/` itself, audits one page per template (home, resume, post list, a post, the 404 page) and fails the job below the thresholds:

```json
{
  "ci": {
    "collect": { "staticDistDir": "./dist", "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": [
          "error",
          { "minScore": 0.95, "aggregationMethod": "median-run" }
        ],
        "categories:accessibility": ["error", { "minScore": 1 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 1 }]
      }
    }
  }
}
```

### Links: deterministic on pull requests, exhaustive every week

Checking external links on every pull request makes builds fail because of somebody else's website. Internal links are checked offline on every pull request; external links run in a separate weekly workflow, configured by a [`lychee.toml`](https://lychee.cli.rs/guides/config/) that ignores example URLs and accepts the 403 answers of sites that block bots.

## 7. One pipeline: build once, deploy what you tested

A single workflow runs on pull requests and on `main`. The site is built once and uploaded as an artifact; the accessibility, Lighthouse and link jobs download that artifact; the deploy job only runs on `main`, after every gate:

```yaml
jobs:
  build:
    steps:
      - uses: ./.github/actions/setup # pnpm + Node from .node-version + frozen install
      - run: pnpm run build
      - uses: actions/upload-artifact@<sha> # dist/ for the test jobs
      - uses: actions/upload-pages-artifact@<sha> # the same dist/, only on main
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: [lint, build, a11y, lighthouse, links]
    permissions:
      pages: write
      id-token: write
    environment: github-pages
    steps:
      - uses: actions/deploy-pages@<sha>
```

On the GitHub side, set Pages to [deploy from "GitHub Actions"](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), and protect `main` with a [ruleset](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets): pull requests required, the six checks required and up to date, linear history, no force push. Merges are squashed so that the pull request title, a Conventional Commit, becomes the commit message.

## 8. Supply chain hardening

The pipeline holds a deploy token, so it gets the same care as production code:

- `permissions: {}` at the workflow level, then the minimum per job (`contents: read`, and `pages: write` plus `id-token: write` for the deploy job only).
- Every third-party action pinned by commit SHA, with the version in a comment. To find the commit of a tag: `git ls-remote --tags https://github.com/actions/checkout v7.0.1 'v7.0.1^{}'` (for an annotated tag, the commit is the `^{}` line).
- `persist-credentials: false` on checkout, `pnpm install --frozen-lockfile`, dependency install scripts allow-listed.
- [Dependabot](https://docs.github.com/en/code-security/dependabot) for npm packages and actions, grouped, with a 7-day cooldown before adopting a new release.
- [OpenSSF Scorecard](https://scorecard.dev/) every week, published as a badge.

## 9. Pitfalls I hit

- **`astro preview` goes to the background** in non-interactive shells. Tests that wait for it fail with "server closed unexpectedly". Serve `dist/` with a plain static server such as [`sirv-cli`](https://github.com/lukeed/sirv/tree/master/packages/sirv-cli) instead.
- **A local `pnpm dev` silently answers the tests.** When the test server cannot bind its port, the audits hit the development server instead of the build. A dedicated port for tests avoids it.
- **Parallel pa11y runs** failed with `Protocol error (Target.closeTarget)` with recent Chrome versions: run one page at a time.
- **Default code themes are not accessible**: auditing every page, not just five, revealed contrast failures in old posts.
- **GitHub Flavored Markdown autolinks file names**: `www.conf` became a link to `http://www.conf/`. Wrap file and host names in backticks.
- **The newest TypeScript major** was not supported yet by the type checker and the ESLint parser. Dependabot ignores that major until the ecosystem catches up.

## Reproduce it

1. Create an Astro project with pinned Node and pnpm versions.
2. Move every setting to a typed config file and all content to Zod-validated collections.
3. Build the theme with CSS tokens and `light-dark()`, and highlight code at build time.
4. Generate SEO tags, JSON-LD, sitemap, RSS and share images during the build.
5. Add the quality gates, run them locally, then in one CI workflow that builds once.
6. Deploy the tested artifact to GitHub Pages, protect `main` and harden the workflow.

The result is a site with no runtime to operate, audited for accessibility on every page, held to strict Lighthouse budgets, and a pipeline that makes regressions hard to merge.
