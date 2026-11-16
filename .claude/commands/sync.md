Orient yourself for this session, then output a brief of 8 lines at most.

1. `git branch --show-current`, `git status --short`, `git log --oneline -8`.
2. Is the branch already merged? `git fetch -q origin main && git log --oneline origin/main..HEAD | head -1` empty means merged or empty: say so (AGENTS.md, Git).
3. Find the current task: the most recent `P<n>-<nn>` id in commit messages, then its row in `docs/roadmap/phases.md`; the next task is the first later row whose dependencies are done.
4. Open questions: anything the last commits or the task row mark as needing a decision.

Brief format:

- **Branch**: name, merged or not, uncommitted files
- **Last done**: task id and one line
- **Next task**: id, result, first red test to write
- **Waiting on the owner**: decisions or "nothing"

Read only the rows you need from `phases.md`, never the whole file.
