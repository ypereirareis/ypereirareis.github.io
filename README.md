# ypereirareis.github.io

[![CI](https://github.com/ypereirareis/ypereirareis.github.io/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ypereirareis/ypereirareis.github.io/actions/workflows/ci.yml)
[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/ypereirareis/ypereirareis.github.io/badge)](https://scorecard.dev/viewer/?uri=github.com/ypereirareis/ypereirareis.github.io)

Source of [ypereirareis.github.io](https://ypereirareis.github.io): resume and technical blog.

- Static site built with [Astro](https://astro.build), no client-side JavaScript.
- Content in Markdown/MDX and YAML, validated by typed schemas at build time.
- Every change goes through a pull request gated by linting, type checks, accessibility audits, Lighthouse budgets and link checks. The exact artifact that passed the checks is deployed to GitHub Pages.

## Quick start

Requirements: Node.js (see `.node-version`) and pnpm (pinned in `package.json`, `corepack enable` installs it).

```sh
pnpm install
pnpm dev          # http://localhost:4321
```

| Command                | Purpose                                       |
| ---------------------- | --------------------------------------------- |
| `pnpm build`           | Build the static site into `dist/`            |
| `pnpm lint`            | ESLint (incl. a11y rules), Prettier, Markdown |
| `pnpm check`           | Astro and TypeScript diagnostics              |
| `pnpm test:a11y`       | pa11y (axe + HTML_CodeSniffer, WCAG 2 AA)     |
| `pnpm test:lighthouse` | Lighthouse CI with blocking budgets           |
| `pnpm format`          | Format all files                              |

## Content

- Blog posts: `src/content/blog/*.md(x)`. Set `draft: true` to keep a post out of production builds.
- Resume: `src/content/cv/cv.yaml`, rendered on `/cv/` and print-ready (print to PDF).

## CI/CD

| Workflow        | Trigger               | What it does                                                                                              |
| --------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `ci.yml`        | pull requests, `main` | Lint, type check, commit messages, build, accessibility, Lighthouse, internal links, deploy (`main` only) |
| `links.yml`     | weekly                | External link check                                                                                       |
| `scorecard.yml` | `main`, weekly        | OpenSSF Scorecard supply-chain analysis                                                                   |

Hardening: least-privilege `GITHUB_TOKEN` permissions per job, actions pinned by commit SHA, no persisted checkout credentials, Dependabot with a 7-day cooldown, frozen lockfile installs and an explicit allow-list for dependency build scripts.

More details and architecture decision records live in [`docs/`](docs/index.md) (MkDocs).

## License

Code is released under the [MIT License](LICENSE). Written content (blog posts and resume) is © Yannick Pereira-Reis, all rights reserved.
