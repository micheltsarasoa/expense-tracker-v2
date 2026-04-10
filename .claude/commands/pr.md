Create a pull request for the current branch.

Steps:
1. `git branch --show-current` — confirm we are NOT on main/master (abort if so)
2. `git log --oneline main..HEAD` — list all commits on this branch
3. `git diff main...HEAD --stat` — summarize which files changed
4. Derive the PR title from the commits:
   - If one commit: use its subject line (max 70 chars)
   - If multiple: write a title that covers the overall theme (max 70 chars)
5. Draft the PR body using this template:

---
## Summary
<3–5 bullet points covering what changed and why>

## Changes
<bullet list of the most significant file changes>

## Test plan
- [ ] <key thing to verify manually>
- [ ] <another scenario>

https://claude.ai/code/session_01VQuM1LebDcEknNfViJUDtR
---

6. Use the `mcp__github__create_pull_request` tool to open the PR:
   - owner: micheltsarasoa
   - repo: expense-tracker-v2
   - base: main
   - head: <current branch>
7. Return the PR URL.

Rules:
- Never create a PR from main
- Never force-push before creating the PR
- If there are uncommitted changes, remind the user to run /commit first
