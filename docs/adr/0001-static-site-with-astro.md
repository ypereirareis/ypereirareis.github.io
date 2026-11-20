# ADR 0001: Static site with Astro

- Status: accepted
- Date: 2026-11-20

## Context

The previous site (Jekyll, Grunt, Travis CI) was unmaintained since 2020. The new site must be fast, accessible, easy to maintain and cheap to host. It is published on GitHub Pages.

## Decision

Use Astro in fully static mode:

- No client-side JavaScript by default; syntax highlighting is done at build time (Shiki).
- Content collections with Zod schemas for blog posts and resume data.
- Plain CSS with custom properties and system fonts, no CSS framework and no web fonts.

## Consequences

- Near-perfect Lighthouse scores without tuning; no runtime to operate.
- Interactive features (search, comments) would need explicit islands or static tooling such as Pagefind.
- The previous site is preserved in the `legacy/jekyll` branch and the `v1-jekyll` tag. Old blog URLs are not kept.
