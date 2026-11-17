## Summary

<!-- What changes and why, in 2-5 bullets. Link the roadmap task (P<n>-<nn>) and the issue. -->

## How to test

<!-- Commands or steps a reviewer can run. -->

## Definition of done

- [ ] One task, one PR; scope matches the task row or issue
- [ ] A failing test was written first; one test per acceptance criterion
- [ ] Negative access test for every new or changed route, action or service method
- [ ] `pnpm lint && pnpm typecheck && pnpm test && pnpm build` pass locally
- [ ] Schema change: migration generated and committed, `check:migrations` passes, owner approved
- [ ] No hard-coded user-facing strings (FR + EN keys), loading, error and empty states handled
- [ ] Docs updated in this PR (TSDoc, README, `docs/`, `GLOSSARY.md`); `pnpm docs:links` passes
- [ ] Structural choice recorded as an ADR after an owner decision
- [ ] No secret, no real personal data, no data about a real child in code, tests or screenshots
- [ ] Commits are Conventional and signed off (`git commit -s`, DCO)
