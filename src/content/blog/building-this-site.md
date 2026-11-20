---
title: Building this site
description: Why this site is a static Astro build with a CI pipeline that gates accessibility, performance and broken links before every deploy.
pubDate: 2026-11-20
tags: [platform]
draft: true
---

This post is a draft placeholder used to exercise the blog layout during development. Drafts are rendered by `astro dev` only and are never published.

## Highlights

- Static output, no client-side JavaScript by default.
- Every pull request runs linting, type checks, accessibility audits, Lighthouse budgets and a link checker.

```yaml
permissions:
  contents: read
```
