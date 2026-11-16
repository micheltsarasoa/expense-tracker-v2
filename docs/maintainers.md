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
