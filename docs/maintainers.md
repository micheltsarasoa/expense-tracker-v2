# Maintainer setup

Repository settings that live on GitHub, not in git. Apply them once; re-check after renaming a CI job.

## Protect `main` (D-14)

Settings → Rules → Rulesets → New branch ruleset, target `main`:

- Restrict deletions; block force pushes.
- Require a pull request before merging; 1 approval; dismiss stale approvals; require conversation resolution.
- Require status checks to pass, branch up to date: `Static`, `Hooks`, `Logic`, `Build`, `Analyze (javascript-typescript)`.
- Require linear history.

Settings → General → Pull Requests: allow **squash merging** only; default message "Pull request title and description"; enable "Automatically delete head branches".

## Apps

- [Renovate](https://github.com/apps/renovate): install on this repository; it reads `renovate.json`.
- [DCO](https://github.com/apps/dco): install and add `DCO` to the required checks (D-34).
- Code scanning: enabled by `.github/workflows/codeql.yml`; nothing to install.

## MCP servers (`.mcp.json`)

Validated by the owner (P0-28). No secret in the file.

| Server                                     | Needs                                            | Notes                                                                                              |
| ------------------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Context7                                   | nothing (optional API key in your user settings) | Up-to-date framework docs                                                                          |
| Playwright                                 | Node                                             | Headless, isolated profile; local debugging and a11y reviews                                       |
| Postgres (`postgres-mcp`, restricted mode) | Python and [uv](https://docs.astral.sh/uv/)      | Read-only; reads `MCP_POSTGRES_URL`, defaults to the local database. Never point it at production. |
