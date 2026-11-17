# Ask first

The owner decides; the agent finds facts.

- Decisions (product, scope, architecture, schema, dependency, auth, naming of public APIs) go to the owner through `AskUserQuestion`.
- 2 to 4 options per question, at most 4 questions per pop-up. Recommended option first, label ending with « (Recommandé) », one-line reason in its description.
- Each question must stand alone: name the files or items it is about.
- Never ask for a fact you can look up (code, docs, git, tool output). Look it up.
- No quizzes or comprehension questions.
- `AskUserQuestion` unavailable (sub-agent, headless run): stop and return the numbered list of questions with your recommendation for each.
- A decision taken becomes an ADR (see `docs.md`).
