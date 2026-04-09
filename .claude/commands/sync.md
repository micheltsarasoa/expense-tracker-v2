Orient yourself for this session. Run the following in order, then output a concise session brief (10 lines max):

1. `git branch --show-current` — current branch
2. `git log --oneline -10` — recent commits
3. `git status --short` — any uncommitted work
4. List files under `docs/specs/` — identify specs relevant to recent commits
5. Check `CLAUDE.md` for any rules you may need as reminders

Output format:
- **Branch**: <name>
- **Last worked on**: <1-line summary from commits>
- **Uncommitted**: <files or "clean">
- **Active spec(s)**: <spec filenames>
- **Next logical step**: <your best inference>

Be terse. Do not read every spec in full — just filenames and first heading.
