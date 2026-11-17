# System design

Before a new module, service, package, queue or external integration:

1. State the problem and constraints in two or three lines.
2. Give 2 or 3 options with trade-offs (complexity, testability, operations, cost).
3. Name the testable seam: the interface tests will drive.
4. Ask the owner (`ask-first.md`), then record the decision as an ADR.

Prefer deep modules with small interfaces (skill `codebase-design`). Keep `packages/core` free of I/O.
