# ADR 0002: Single CI/CD pipeline, build once, deploy what was tested

- Status: accepted
- Date: 2026-11-20

## Context

Separate CI and deploy workflows usually build the site twice, so the deployed artifact is not the one that was audited.

## Decision

A single workflow (`ci.yml`) builds `dist/` once. Accessibility, Lighthouse and link checks run against that artifact. On `main`, the same build is uploaded as the Pages artifact and the `deploy` job runs only when every gate has passed.

Supply-chain hardening:

- `permissions: {}` at workflow level, minimal permissions per job (`pages: write` and `id-token: write` only for deploy).
- Third-party actions pinned by commit SHA, updated by Dependabot with a 7-day cooldown.
- `persist-credentials: false` on checkout, `pnpm install --frozen-lockfile`, dependency build scripts allow-listed in `pnpm-workspace.yaml`.
- OpenSSF Scorecard runs weekly and on `main`.

## Consequences

- What is deployed is exactly what was tested.
- The `main` branch is protected by a ruleset requiring the CI checks; changes always go through pull requests.
