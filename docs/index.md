# Overview

This repository builds [ypereirareis.github.io](https://ypereirareis.github.io), a static resume and technical blog.

## Layout

| Path                     | Content                                                 |
| ------------------------ | ------------------------------------------------------- |
| `src/content/blog/`      | Blog posts (Markdown/MDX)                               |
| `src/content/cv/cv.yaml` | Resume data                                             |
| `src/content.config.ts`  | Content schemas, enforced at build time                 |
| `src/pages/`             | Routes, RSS feed, `robots.txt`, generated images        |
| `src/components/`        | Shared components (SEO head, header, footer, post list) |
| `src/styles/global.css`  | Theme (system fonts, light/dark, print styles)          |
| `.github/`               | CI/CD workflows, shared setup action, Dependabot        |

## SEO

- Canonical URL, Open Graph and Twitter Card tags on every page.
- JSON-LD structured data: `Person`, `WebSite`, `BlogPosting`, `BreadcrumbList`.
- `sitemap-index.xml`, `robots.txt` and an RSS feed generated at build time.
- Default Open Graph image (`/og.png`) rendered at build time with sharp.

## Accessibility

- Semantic landmarks, skip link, visible focus, `aria-current` navigation.
- Colors meet WCAG AAA contrast for body text, in both light and dark themes.
- Enforced by ESLint a11y rules, pa11y and Lighthouse in CI (see [Quality gates](quality-gates.md)).

## Preview the documentation

```sh
pipx run --spec mkdocs mkdocs serve
```
