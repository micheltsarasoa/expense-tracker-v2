# ADR-011: Custom SVG Signature Charts and Glow Identity (Extends ADR-004)

**Date:** 2026-11-10  
**Status:** Proposed

## Context

ADR-004 chose shadcn/ui Charts (Recharts) for every chart. The Ledger v2 canvas uses two kinds of visuals:

- **Analytic charts** (Reports: bars and lines over many months, many series, axes and tooltips). This is what Recharts is good at.
- **Signature visuals** that carry the product's look:
  - the dashboard hero trend area, with a glow gradient;
  - the income/expense flow strip;
  - sparklines (140×36) in stat cards;
  - budget progress rings (dashboard and Budgets).

Recharts can draw rings and sparklines. But each one needs a full `ResponsiveContainer` plus chart tree, glow gradients and filters have to be injected through `<defs>` workarounds, and the result is hard to match pixel-for-pixel with the design.

The review (decision 12 in `docs/ledger-v2-decisions.md`) settled two things. Load animations and emoji are removed. **Glow is the signature and stays**: glow gradients, glow filters, hero text glow, glass panels and wallet shadows, all static and tokenized. The user's guidance: "Never remove glow gradient or glow filter. Wow effect is needed." Glow follows **meaning**, not decoration.

## Decision

**1. Split by job, keep ADR-004 for the analytic charts.**

| Visual | Library | Where |
|---|---|---|
| Report charts (bars, lines, stacked, many points, axes, tooltip, legend) | shadcn/ui Charts (ADR-004) | `components/reports/*` |
| Sparkline, progress ring, hero trend area, flow strip | **Custom SVG components** | `apps/web/components/charts/` |

A new chart type goes to Recharts by default. It becomes custom SVG only if it is a small, fixed-shape signature visual that has no axes and no interaction beyond a focus label.

**2. Custom charts: pure geometry, thin components.**

- Scale and path math lives in pure functions in `apps/web/lib/chart-geometry.ts`: `linePath(points, box)`, `areaPath(...)`, `ringArc(ratio, r)`. They are unit-tested with plain numbers, without the DOM.
- Components only map props to SVG. They use `viewBox` with `preserveAspectRatio` for responsiveness, so there is no resize observer.
- Amounts are formatted through `formatAmount` (ADR-010), never inside the chart.
- **Accessibility:**
  - each chart has `role="img"` and an `aria-label` with the summary sentence from the catalog (for example "Dépenses : 1 240 €, 82 % du budget");
  - the hero trend also renders a visually hidden table of its data points;
  - colour never carries meaning alone: rings also show the percentage as text.

**3. Glow is a token, never a hard-coded value.**

- Tailwind v4 `@theme` defines the tokens, so they become utilities. No inline styles, no CSS files beyond the theme:
  - `--shadow-glow-mint`, `--shadow-glow-family`, `--shadow-glow-expense` → `shadow-glow-*`;
  - `--drop-shadow-glow-*` for SVG strokes → `drop-shadow-glow-*`;
  - `--glass-*` (background tint, blur, border) for panels.
- **Glow follows meaning:**
  - **mint** = income or healthy (in budget, hero balance up);
  - **expense orange** = overspent or a flagged expense;
  - **family lilac** = family surfaces (wallets, child cards).
  - Neutral data gets no glow.
- **Static only.** No animated glow, no pulse. `prefers-reduced-transparency` drops glass blur to a solid surface, and `forced-colors` removes glow entirely.
- **Light theme** redefines the same tokens at lower intensity, so the components don't change.
- **Restraint:** a view shows at most one *hero* glow (text glow or gradient area). Smaller glows (ring stroke, badge) are limited to elements whose meaning is mint, expense or family.
- SVG glow filters (`feGaussianBlur`) are defined once in a shared `<ChartDefs>` and referenced by id. They are not repeated in each chart.

**4. Naming.** "Ledger" stays as the design-system name for now (decision 12). A rename is a separate decision and doesn't affect tokens, which are named by meaning, not by brand.

## Consequences

**Positive**

- The signature visuals match the design exactly and stay light: a sparkline is one `<path>`, not a Recharts tree.
- Report charts keep everything ADR-004 gives: theming, tooltips and legends.
- Glow is consistent and themable, so changing one token changes every surface. "Glow follows meaning" makes it a signal, not noise.
- The geometry is testable without rendering.

**Negative**

- Two chart approaches to know. Mitigated by the rule in §1 and by keeping custom charts to four components.
- Custom charts need their own accessibility work (labels, hidden table), which Recharts would partly provide.
- Blur filters and glass `backdrop-filter` cost GPU on low-end phones. Mitigated by the one-hero rule, filters defined once, and the reduced-transparency fallback.
- Glow tokens need checking in both themes. Text glow must not lower text contrast below WCAG AA.

## Rejected alternatives

- **Recharts for everything (ADR-004 unchanged).** Glow gradients and filters fight the wrapper, and small visuals carry a full chart tree.
- **Custom SVG for everything.** Rebuilding axes, tooltips and legends for Reports is cost with no gain.
- **A second chart library (visx, Nivo) for signature visuals.** A new dependency for four simple shapes.
- **Remove glow for a flat look** (tried in canvas step 3). Rejected by the product owner: glow is the identity.
- **Hard-coded glow values per component.** They drift, and the light theme can't adapt them.
