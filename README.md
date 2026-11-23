# ypereirareis.github.io

[![CI](https://github.com/ypereirareis/ypereirareis.github.io/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ypereirareis/ypereirareis.github.io/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ypereirareis/ypereirareis.github.io/badge)](https://scorecard.dev/viewer/?uri=github.com/ypereirareis/ypereirareis.github.io)

Source of [ypereirareis.github.io](https://ypereirareis.github.io): resume and technical writing.

- Static site built with [Astro](https://astro.build). The only client-side JavaScript is the light/dark theme toggle.
- Content in Markdown/MDX and YAML, validated by typed schemas at build time.
- Every change goes through a pull request gated by linting, type checks, accessibility audits, Lighthouse budgets and link checks. The exact artifact that passed the checks is deployed to GitHub Pages.

## Quick start

Requirements:

- Node.js, version in `.node-version` (with nvm: `nvm install && nvm use`).
- pnpm, version pinned in `package.json` (`corepack enable` installs it).
- Docker, only for the link and workflow checks.

```sh
pnpm install
pnpm dev          # http://localhost:4321, live reload, drafts visible
```

## Commands

| Command                | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `pnpm dev`             | Development server with live reload; draft posts are visible    |
| `pnpm build`           | Build the static site into `dist/`                              |
| `pnpm preview`         | Serve `dist/` locally, including the custom 404 page            |
| `pnpm check`           | Astro and TypeScript diagnostics, content schema validation     |
| `pnpm lint`            | ESLint (incl. accessibility rules), Prettier and markdownlint   |
| `pnpm format`          | Format all files with Prettier                                  |
| `pnpm test:a11y`       | pa11y on the built site (axe + HTML_CodeSniffer, WCAG 2 AA)     |
| `pnpm test:lighthouse` | Lighthouse CI on the built site, with blocking score thresholds |

Link and workflow checks run with Docker, from the repository root, after `pnpm build`:

```sh
# Internal links (what CI runs); remove --offline to also check external links
docker run --rm -v "$PWD:/work" -w /work lycheeverse/lychee:latest \
  --offline --root-dir /work/dist --index-files index.html 'dist/**/*.html'

# GitHub Actions workflows
docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:latest
```

Run everything before opening a pull request:

```sh
pnpm format && pnpm lint && pnpm check && pnpm build && pnpm test:a11y && pnpm test:lighthouse
```

`pnpm test:lighthouse` may need the path to a Chrome binary, for example
`export CHROME_PATH=$(ls -d ~/.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome | head -1)`.

## Configuration

All settings live in the code and are applied at build time. The full list, with defaults, is in [`docs/index.md`](docs/index.md#configuration).

| What                                                     | Where                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| Name, job title, description, language, profile links    | `SITE` in `src/site.config.ts`                              |
| Repository link (header icon, footer "Source")           | `SITE.repo` in `src/site.config.ts`                         |
| Header menu (order and labels)                           | `NAV` in `src/site.config.ts`                               |
| Home page intro points (`**text**` is rendered in bold)  | `INTRO_POINTS` in `src/site.config.ts`                      |
| "What I do or did" sections (title, text, color, points) | `FOCUS_AREAS` in `src/site.config.ts`                       |
| Allowed post topics                                      | `TOPICS` in `src/site.config.ts`                            |
| Number of posts on the home page and on `/posts/`        | `HOME_POSTS`, `BLOG_LATEST_POSTS` in `src/lib/posts.ts`     |
| Age of the "outdated" notice on old posts                | `OUTDATED_AFTER_YEARS` in `src/pages/posts/[...slug].astro` |
| Page `<title>` rules (job title on home and CV)          | `src/components/BaseHead.astro`                             |
| Colors, widths, fonts, light and dark themes             | design tokens in `src/styles/global.css`                    |
| Site URL, URL format, code highlighting themes           | `astro.config.mjs`                                          |
| Resume                                                   | `src/content/cv/cv.yaml`                                    |
| Audited pages and score thresholds                       | `lighthouserc.json`, `.pa11yci.json`                        |
| Link checker exclusions                                  | `lychee.toml`                                               |

Any new color must reach a WCAG contrast of at least 4.5:1 (7:1 for body text), in both themes.

## Writing a post

Create `src/content/blog/<slug>.md`. The file name becomes the URL: `/posts/<slug>/`.

```yaml
---
title: "Short, descriptive title"
description: "One sentence for the problem, one for what the post gives."
pubDate: 2026-11-20
updatedDate: 2026-12-01 # optional
tags: [platform, operations]
draft: false
---
```

| Field         | Rules                                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| `title`       | Required. Build fails above 130 characters; aim for 60 or less (shown on the site and in search results) |
| `description` | Required. Build fails outside 20–300 characters; aim for 70–160                                          |
| `pubDate`     | Required, `YYYY-MM-DD`. Posts are sorted by this date                                                    |
| `updatedDate` | Optional. Shown as "Updated …" and used for the outdated notice                                          |
| `tags`        | Required. 1 or 2 topics from `TOPICS` (what the post is about, not technologies); shown next to the date |
| `draft`       | `true` keeps the post out of production builds; it is still visible with `pnpm dev`                      |

Writing rules (checked by `pnpm lint` and `pnpm check`):

- Start headings at `##`: the title is the page `h1`. Do not skip heading levels.
- Give every code block a language (` ```bash `, ` ```yaml `…).
- Wrap file and host names such as `www.conf` in backticks, otherwise they become links.
- Put images in `src/assets/posts/` and reference them relatively (`../../assets/posts/image.png`): they are optimized at build time. Always write a meaningful alt text.
- Links open in the same window.

What happens automatically on every build:

- The newest posts appear on the home page and in "Latest posts" on `/posts/`; older ones move to the collapsed "Archived" section.
- Posts whose last update is older than three years get an "outdated" notice.
- The RSS feed, the sitemap, the JSON-LD data and the page metadata are generated.

## Contributing

1. Create a branch from `main` (`feat/…`, `fix/…`, `docs/…`, `ci/…`, `chore/…`). `main` is protected: changes only land through pull requests.
2. Write commit messages following [Conventional Commits](https://www.conventionalcommits.org) (`feat: …`, `fix: …`, `docs: …`); commitlint checks them in CI.
3. Run the checks locally (see [Commands](#commands)), then open a pull request.
4. The six required checks must pass: `Lint & type check`, `Commit messages`, `Build`, `Accessibility`, `Lighthouse`, `Links`.
5. Merge with "Squash and merge". The CI then rebuilds, re-checks and deploys the site.

New pages must be added to `lighthouserc.json` and `.pa11yci.json` so they are audited, and every new setting documented in `docs/index.md`.

## CI/CD

| Workflow        | Trigger               | What it does                                                                                              |
| --------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `ci.yml`        | pull requests, `main` | Lint, type check, commit messages, build, accessibility, Lighthouse, internal links, deploy (`main` only) |
| `links.yml`     | weekly                | External link check                                                                                       |
| `scorecard.yml` | `main`, weekly        | OpenSSF Scorecard supply-chain analysis                                                                   |

Hardening: least-privilege `GITHUB_TOKEN` permissions per job, actions pinned by commit SHA, no persisted checkout credentials, Dependabot with a 7-day cooldown, frozen lockfile installs and an explicit allow-list for dependency build scripts.

More details and architecture decision records live in [`docs/`](docs/index.md) (MkDocs).

## License

Code is released under the [MIT License](LICENSE). Written content (posts and resume) is © Yannick Pereira-Reis, all rights reserved.
