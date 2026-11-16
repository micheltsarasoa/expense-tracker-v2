---
paths:
  - 'packages/ui/**'
  - 'apps/**/*.tsx'
---

# UI

- Build from `packages/ui` in atomic levels: atoms, molecules, organisms, templates; pages only compose.
- Colours, spacing, radii and type come from tokens (`packages/tokens`); no raw hex, no inline styles, no CSS files outside the tokens.
- Every async view handles loading, error and empty states, not only the happy path.
- Mobile first; dark mode via CSS variables.
- The published demo canvases are the visual reference (D-08).
