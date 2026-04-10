# ADR-004 — shadcn/ui Charts as the Chart Library

**Date:** 2026-04-10  
**Status:** Accepted

## Context

v1 used Recharts directly. For v2, the chart library choice was left open. The requirements are:
- Works with React 19
- Supports: bar, line, donut, grouped bar charts
- Theming must match the Tailwind v4 `@theme` design tokens without extra config
- Tree-shakable and lightweight

## Decision

Use **shadcn/ui Charts**, which are thin wrappers around Recharts pre-integrated with shadcn/ui's CSS variable system.

Install per component with `pnpm dlx shadcn@latest add chart`.

## Consequences

**Positive**
- Zero extra theming config — CSS variables from `@theme` are automatically picked up
- Same installation pattern as all other shadcn/ui components (`/component` slash command)
- Recharts ecosystem still accessible if a low-level override is needed
- Actively maintained alongside the rest of shadcn/ui

**Negative**
- Thinner abstraction than a full charting library — complex chart types (e.g. candlestick) would require dropping down to raw Recharts
- Tied to shadcn/ui release cadence

## Rejected alternatives

- **Raw Recharts**: requires manual CSS variable wiring for dark mode and theme tokens
- **Nivo**: powerful but heavyweight; complex API for simple bar/donut charts
- **Chart.js + react-chartjs-2**: canvas-based, harder to style with CSS variables
- **Tremor**: opinionated component set that conflicts with our shadcn/ui-first approach
