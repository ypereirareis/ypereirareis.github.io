# Accessibility

Automated tools catch roughly a third to half of accessibility issues. They run on every pull request (see [Quality gates](quality-gates.md)); this page lists what they cover and the manual checks that complete them.

## Automated checks

| Tool                | Scope                                                      | Catches                                                                   |
| ------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------- |
| ESLint (`jsx-a11y`) | Source code                                                | Missing alt texts and labels, invalid ARIA, non-interactive handlers      |
| pa11y, light theme  | Every page of the sitemap, plus the 404 page               | WCAG 2 AA with axe and HTML_CodeSniffer: contrast, names, structure       |
| pa11y, dark theme   | Home, CV, posts index, 404 and one post (one per template) | Same rules with `prefers-color-scheme: dark` (Chrome `--force-dark-mode`) |
| Lighthouse          | The pages listed in `lighthouserc.json`                    | Accessibility score must stay at 100                                      |

Code highlighting colors that fail WCAG AA in the Shiki themes are overridden in `src/styles/global.css` (orange in `github-light`, comments in `github-dark`).

## Manual checklist (about 10 minutes)

Run it after a design change or a new kind of page.

### Keyboard only

- [ ] `Tab` from the top of the page: the first stop is "Skip to content", and it moves the focus to the main content.
- [ ] Every link and button is reachable with `Tab`, in a logical order, with a clearly visible focus outline.
- [ ] The theme toggle works with `Enter` and `Space`, and its label says which theme it switches to.
- [ ] The "Archived" section on `/posts/` opens and closes with `Enter`.
- [ ] Nothing traps the focus; `Shift+Tab` goes back as expected.

### Screen reader

Use Orca (Linux), VoiceOver (macOS: `Cmd+F5`) or NVDA (Windows).

- [ ] The page title is announced and describes the page.
- [ ] Headings navigation (`H` with NVDA, rotor with VoiceOver) gives a clean outline: one `h1`, then `h2`/`h3` in order.
- [ ] Landmarks are announced: banner, main navigation, main, content info.
- [ ] On a post: the date, the topics list, the code blocks and the image descriptions make sense when read aloud.
- [ ] Icon-only controls (GitHub link, theme toggle) have meaningful names.

### Zoom and display

- [ ] At 200% zoom (and 400% on a narrow window) nothing overlaps and there is no horizontal scrolling, except inside code blocks.
- [ ] In the dark theme, text, links, topics and code stay readable.
- [ ] With "reduce motion" enabled in the OS, there is no animated scrolling.

Any issue found manually should become a fix, and when possible an automated check.
