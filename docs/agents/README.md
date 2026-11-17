# Sources of truth

Read these before working; anything not listed here is either code or outdated.

| Need                                          | File                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Agent and contributor rules                   | [CLAUDE.md](../../CLAUDE.md)                                                                                                          |
| Domain vocabulary                             | [GLOSSARY.md](../../GLOSSARY.md)                                                                                                      |
| Product scope and phases                      | [docs/roadmap/README.md](../roadmap/README.md), [phases.md](../roadmap/phases.md)                                                     |
| Decisions                                     | [decisions-taken.md](../roadmap/decisions-taken.md) (binding), ADRs in [docs/decisions/](../decisions/)                               |
| Feature specs                                 | [docs/specs/](../specs/) — budgets, dashboard, family, import, params (categories, labels, accounts), reports, settings, transactions |
| Agent tooling target                          | [agent-setup.md](../roadmap/agent-setup.md)                                                                                           |
| Domain docs usage                             | [domain.md](domain.md)                                                                                                                |
| Issues and labels                             | [issue-tracker.md](issue-tracker.md), [triage-labels.md](triage-labels.md)                                                            |
| Repository settings (branch protection, apps) | [docs/maintainers.md](../maintainers.md)                                                                                              |
| Current deploy (until Docker)                 | [docs/vercel-deployment.md](../vercel-deployment.md)                                                                                  |
| Stack Auth setup (until Better Auth)          | [docs/manual/setup-tanstack.md](../manual/setup-tanstack.md)                                                                          |

Precedence when two sources disagree: code > `decisions-taken.md` > ADRs > specs. Fix the loser in the same PR.

Outdated documents are in [docs/archive/](../archive/) with a banner; do not follow them.
