Create a pull request for the current branch.

## Pre-flight — branch check
1. `git branch --show-current` — confirm we are NOT on main/master (abort if so)
2. `git log --oneline origin/main..HEAD` — list commits ahead of main
   - If **no commits ahead**: the branch was already merged. STOP and tell the user
     to run /commit first (which will create a new branch automatically).

## Draft the PR
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

## Open the PR
6. Use the `mcp__github__create_pull_request` tool:
   - owner: micheltsarasoa
   - repo: expense-tracker-v2
   - base: main
   - head: <current branch>
7. Return the PR URL.

Rules:
- Never create a PR from main
- Never force-push before creating the PR
- One branch = one PR. If the branch was already merged, tell the user to run /commit first.
