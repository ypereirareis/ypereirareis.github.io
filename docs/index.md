# Overview

This repository builds [ypereirareis.github.io](https://ypereirareis.github.io), a static resume and technical posts, deployed to GitHub Pages by GitHub Actions.

## Layout

| Path                     | Content                                                                 |
| ------------------------ | ----------------------------------------------------------------------- |
| `src/site.config.ts`     | Site identity, navigation, home page focus areas, post topics           |
| `src/content/blog/`      | Blog posts (Markdown/MDX); images in `src/assets/posts/`                |
| `src/content/cv/cv.yaml` | Resume data                                                             |
| `src/content.config.ts`  | Content schemas, enforced at build time                                 |
| `src/lib/posts.ts`       | Post queries and listing settings                                       |
| `src/pages/`             | Routes, RSS feed, `robots.txt`, generated images (`og.png`, touch icon) |
| `src/components/`        | SEO head, header, footer, post index (list), topics, brand icons        |
| `src/styles/global.css`  | Design tokens and theme (system fonts, light/dark, print styles)        |
| `public/`                | Static files copied as-is (`favicon.svg`)                               |
| `.github/`               | CI/CD workflows, shared setup action, Dependabot                        |

## Configuration

Every setting lives in code and is applied at build time: change the value, open a pull request, and the deployment picks it up.

### Site identity and home page

`src/site.config.ts`

| Setting                     | Default                                                                                                                                     | Effect                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `SITE.title`                | `Yannick Pereira-Reis`                                                                                                                      | Header, page titles, RSS title, Open Graph site name                                                         |
| `SITE.author`               | `Yannick Pereira-Reis`                                                                                                                      | Name under the main title, footer, JSON-LD `Person`                                                          |
| `SITE.jobTitle`             | `Cloud Platform Engineer`                                                                                                                   | Main title of the home page, default page title, Open Graph image                                            |
| `SITE.description`          | Cloud Platform Engineer…                                                                                                                    | Default meta description and RSS description                                                                 |
| `SITE.locale` / `SITE.lang` | `en_US` / `en`                                                                                                                              | `og:locale` and `<html lang>`                                                                                |
| `SITE.links`                | GitHub, LinkedIn                                                                                                                            | Footer, CV contact block, JSON-LD `sameAs`                                                                   |
| `SITE.repo`                 | this repository                                                                                                                             | GitHub icon in the header and "Source" link in the footer (kept out of `links`, which feed JSON-LD `sameAs`) |
| `NAV`                       | Home, Posts, CV                                                                                                                             | Header menu (order and labels)                                                                               |
| `INTRO_POINTS`              | 6 points                                                                                                                                    | Bullet points under the main title of the home page (`**text**` for bold)                                    |
| `FOCUS_AREAS`               | Staff Engineering & Enablement, Platform & GitOps, CI/CD & Automation, Operations & Observability, Security & Identity, Engineering Quality | "What I do or did" cards on the home page, in this order: title, short text, hue and detailed points         |
| `TOPICS`                    | development, architecture, infrastructure, platform, operations, security                                                                   | Allowed post topics (see [Writing a post](#writing-a-post))                                                  |

### Posts listing

`src/lib/posts.ts`

| Setting             | Default | Effect                                                                                             |
| ------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `HOME_POSTS`        | `5`     | Number of latest posts listed on the home page                                                     |
| `BLOG_LATEST_POSTS` | `10`    | Number of posts in "Latest posts" on `/posts/`; older posts go to the collapsed "Archived" section |

Posts are sorted by `pubDate` (newest first) and split on every build: publishing a post automatically pushes the oldest "latest" post to the archive. Drafts are only listed by `pnpm dev`.

### Posts

| Setting                | File                              | Default | Effect                                                                                                                                                                                                                     |
| ---------------------- | --------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OUTDATED_AFTER_YEARS` | `src/pages/posts/[...slug].astro` | `3`     | Posts whose last update (`updatedDate`, else `pubDate`) is older get an "outdated" notice                                                                                                                                  |
| Page `<title>`         | `src/components/BaseHead.astro`   | —       | Home: "Cloud Platform Engineer · Yannick Pereira-Reis"; pages with `withJobTitle` (CV): "{page} · Yannick Pereira-Reis, Cloud Platform Engineer"; posts: the post title only; other pages: "{page} · Yannick Pereira-Reis" |
| Schema limits          | `src/content.config.ts`           | —       | `title` ≤ 130 chars, `description` 20–300 chars, 1–2 topics                                                                                                                                                                |

### Theme

`src/styles/global.css`

| Token                                             | Default          | Effect                                                            |
| ------------------------------------------------- | ---------------- | ----------------------------------------------------------------- |
| `--container`                                     | `72rem`          | Maximum page width                                                |
| `--measure`                                       | `44rem`          | Reading width: posts, home page and posts index (`narrow` layout) |
| `--radius`                                        | `0`              | Corner radius (flat design: square corners)                       |
| `--primary`, `--header-bg`                        | indigo `#4338ca` | Links, buttons, header band (dark theme values included)          |
| `--accent`                                        | amber `#f59e0b`  | Decorative only (bars, squares), never text                       |
| `--hue-{indigo,cyan,emerald,amber,rose,violet}-*` | —                | One color per "What I do or did" section                          |

Any new color pair must reach a WCAG contrast of at least 4.5:1 (7:1 for body text) in both light and dark themes. The browser `theme-color` is set in `src/components/BaseHead.astro`, the favicon in `public/favicon.svg` and the Open Graph image colors in `src/pages/og.png.ts`.

### Build and rendering

`astro.config.mjs`

| Setting                | Default                          | Effect                                        |
| ---------------------- | -------------------------------- | --------------------------------------------- |
| `site`                 | `https://ypereirareis.github.io` | Canonical URLs, sitemap, RSS, Open Graph URLs |
| `trailingSlash`        | `always`                         | URL format (`/posts/`, `/cv/`)                |
| `markdown.shikiConfig` | `github-light` / `github-dark`   | Code highlighting themes (build time, no JS)  |
| `integrations`         | MDX, sitemap                     | MDX posts and `sitemap-index.xml`             |

### Quality gates

| File                       | Effect                                              |
| -------------------------- | --------------------------------------------------- |
| `lighthouserc.json`        | Audited URLs and Lighthouse score thresholds        |
| `.pa11yci.json`            | Audited URLs and accessibility standard (WCAG 2 AA) |
| `lychee.toml`              | Link checker exclusions and accepted HTTP statuses  |
| `.markdownlint-cli2.jsonc` | Markdown rules (writing-style rules are relaxed)    |
| `.github/dependabot.yml`   | Update schedule, cooldown, ignored majors           |

See [Quality gates](quality-gates.md) for what each check enforces.

## Writing a post

Create `src/content/blog/<slug>.md` (the file name is the URL: `/posts/<slug>/`):

```yaml
---
title: "Short, descriptive title (aim for 60 characters max)"
description: "One or two sentences shown in search results (aim for 70–160 characters)."
pubDate: 2026-11-20
updatedDate: 2026-12-01 # optional
tags: [platform, operations] # 1 or 2 of TOPICS: what the post is about, not technologies
draft: false # true = visible with `pnpm dev` only
---
```

- Start headings at `##` (the title is the page `h1`) and do not skip levels.
- Give every code block a language (` ```bash `, ` ```yaml `…) and wrap file names such as `www.conf` in backticks, otherwise they become links.
- Put images next to the content in `src/assets/posts/` and reference them relatively (`../../assets/posts/image.png`): they are optimized at build time.

## Theme toggle

The header button switches between light and dark themes and stores the choice in `localStorage`; without a stored choice, or without JavaScript (the button is then hidden), the system preference applies. A tiny inline script in `BaseHead.astro` applies the stored theme before the first paint. It is the only client-side JavaScript of the site.

## SEO

- Canonical URL, Open Graph and Twitter Card tags on every page.
- JSON-LD structured data: `Person`, `WebSite`, `BlogPosting` (topics as keywords), `BreadcrumbList`.
- `sitemap-index.xml`, `robots.txt` and an RSS feed (topics as categories) generated at build time.
- One Open Graph image per post (`/og/<slug>.png`: title, topics, date) and a default one (`/og.png`) for the other pages, rendered at build time with sharp. Posts also expose `article:tag` (topics) and `twitter:image`; every page allows large image previews (`max-image-preview:large`).

## Accessibility

- Semantic landmarks, skip link, visible focus, `aria-current` navigation, native `<details>` for the archive.
- Colors meet WCAG AAA contrast for body text, in both light and dark themes.
- Enforced by ESLint a11y rules, pa11y and Lighthouse in CI (see [Quality gates](quality-gates.md)).

## Preview the documentation

```sh
pipx run --spec mkdocs mkdocs serve
```
