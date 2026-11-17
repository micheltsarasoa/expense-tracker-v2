---
paths:
  - '**/package.json'
---

# Dependencies

- Ask before adding a dependency; say what it replaces, its size, licence and maintenance status.
- Install in a workspace, never at the root: `pnpm --filter <workspace> add <pkg>`.
- Licences must be compatible with AGPL-3.0-or-later.
- Read the docs of the installed version before using an API.
- Do not edit `pnpm-lock.yaml` by hand.
