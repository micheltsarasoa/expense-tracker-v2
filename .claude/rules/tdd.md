---
paths:
  - 'apps/**'
  - 'packages/**'
---

# Test-driven development

- Red first: write the failing test for one acceptance criterion, run it, see it fail for the right reason.
- Then the minimal code to pass, then refactor with tests green.
- One test per acceptance criterion of the task in `docs/roadmap/phases.md`.
- Name tests with `GLOSSARY.md` terms (`allowance`, `household`, not `pocketMoney`, `family`).
- Placement and tooling: `docs/testing.md`. Database tests use real Postgres (Testcontainers), never mocks of Drizzle.
- The `tdd-guard` hook blocks source edits until the neighbouring test file was changed this session.
