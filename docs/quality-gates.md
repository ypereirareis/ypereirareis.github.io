# Quality gates

All gates run in `.github/workflows/ci.yml` on every pull request and must pass before merging to `main` (enforced by a repository ruleset).

| Gate            | Tool                                    | Fails when                                                            |
| --------------- | --------------------------------------- | --------------------------------------------------------------------- |
| Lint            | ESLint (TypeScript, Astro, jsx-a11y)    | Any lint error                                                        |
| Format          | Prettier, markdownlint                  | Unformatted file or Markdown issue                                    |
| Types           | `astro check` (TypeScript strictest)    | Any type error, invalid content frontmatter                           |
| Commit messages | commitlint (Conventional Commits)       | A commit in the pull request does not follow the spec                 |
| Accessibility   | pa11y (axe + HTML_CodeSniffer, WCAG2AA) | Any violation                                                         |
| Lighthouse      | Lighthouse CI, median of 3 runs         | Performance < 95, Accessibility < 100, Best practices < 95, SEO < 100 |
| Links           | lychee (offline)                        | Broken internal link                                                  |

External links are checked weekly by `.github/workflows/links.yml` to keep pull requests deterministic.

## Adding a page

Add the new URL to `lighthouserc.json` and `.pa11yci.json` so it is covered by the audits.
