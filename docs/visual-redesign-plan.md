# Visual Redesign Plan — Expense Tracker v2 (`apps/web`)

> **Scope:** the visual / aesthetic layer — typography, color, distinctiveness ("anti-AI-slop"), dark-theme refinement. Companion to [ux-audit.md](ux-audit.md), which covers functional/spec conformity and is a separate concern.
> **Method:** read-only review of source. Every recommendation is anchored to tokens/values quoted from the repo. Dev server was not reachable, so this is assessed from code, not from the rendered app.
> **Constraints honored:** Tailwind v4 (CSS-first `@theme`), shadcn/ui, cva variants only — no new CSS frameworks, no inline magic numbers. The dark theme is refined, not replaced.

---

## 1. Verdict

Competent, clean shadcn/ui dark theme — but textbook generic. The whole type system collapses to one font: [globals.css](apps/web/app/globals.css#L45-L55) aliases `--font-heading` to `--font-sans` (Inter), and the `--font-mono` token (Geist Mono) is defined but **applied to zero monetary values**. The dark palette is a muted low-chroma teal (`--primary: oklch(0.45 0.085 224.283)`) with no sharp accent, and all five chart colors sit in the same 207–224 hue family. Semantic color is conceptually good (emerald/rose/amber/violet) but implemented as ~25 copy-pasted Tailwind literals instead of cva variants. Good bones — recoverable, not a teardown.

---

## 2. Critical Issues

### C1 — Single-font system: no typographic identity, mono token defined but never used

**Problem.** [globals.css](apps/web/app/globals.css#L55) sets `--font-heading: var(--font-sans)` and [layout.tsx](apps/web/app/layout.tsx#L11) binds `--font-sans` to Inter. Headings (`CardTitle` uses `font-heading`, [card.tsx](apps/web/components/ui/card.tsx#L41)) are visually identical to body. The `--font-mono` token ([globals.css](apps/web/app/globals.css#L46)) is wired to Geist Mono but **zero monetary values use it** — every amount in [stat-card.tsx](apps/web/components/dashboard/stat-card.tsx#L44), [account-balances-widget.tsx](apps/web/components/dashboard/account-balances-widget.tsx#L71), [transactions-table.tsx](apps/web/components/transactions/transactions-table.tsx#L122-L130), and [budget-card.tsx](apps/web/components/budgets/budget-card.tsx#L132) renders in Inter with only `tabular-nums`.

**Why it matters.** Users form a credibility judgment in ~50ms (Lindgaard et al., 2006), and typography is the dominant signal of design investment. Inter-on-everything is the canonical "AI slop" tell. For finance specifically, monospaced amounts are a recognized convention (Bloomberg, Stripe, Mercury, Monzo) — they reinforce trust and aid vertical column scanning (Jakob's Law). To be precise: Inter ships tabular figures, so amounts are not _broken_ today — this is a distinctiveness + convention-alignment win, not a legibility bug.

**Fix (three parts — all required, or the change is inert).**

_(a) Replace Inter with a display grotesk + a real mono, in [layout.tsx](apps/web/app/layout.tsx#L1-L21):_

```tsx
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans', // body + headings base
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono', // amounts, tabular data
  display: 'swap',
});
```

Then on `<html>`: replace `inter.variable` and the Geist vars with `grotesk.variable, jetbrainsMono.variable`. (Space Grotesk has real personality, ships tabular figures, and pairs cleanly with JetBrains Mono. Swap for Cabinet Grotesk / Bricolage Grotesque via `next/font/local` for sharper editorial character.)

_(b) Re-point the tokens in [globals.css](apps/web/app/globals.css#L45-L55):_

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  /* give headings their own identity instead of aliasing sans */
  --font-heading: var(--font-sans); /* Space Grotesk; or a distinct display var */
}
```

_(c) Apply `font-mono` to every amount span — without this, parts (a)/(b) do nothing for numbers._

```tsx
// stat-card.tsx L44
<p className={cn('font-mono text-2xl font-bold tabular-nums mt-1', colorClass)}>{money(value)}</p>

// account-balances-widget.tsx L98
<span className={cn('font-mono text-sm font-semibold tabular-nums shrink-0', balanceClass(account.balance))}>

// transactions-table.tsx L122-130 (Amount cell)
className={cn('font-mono text-sm font-medium tabular-nums text-right whitespace-nowrap', config.amountClass)}
```

Same for [budget-card.tsx](apps/web/components/budgets/budget-card.tsx#L132-L143) amount spans.

**Priority: Critical.** This is also the One Big Win.

---

### C2 — Validated-toggle button fails WCAG 2.2 SC 2.5.8 (target size)

**Problem.** In [transactions-table.tsx](apps/web/components/transactions/transactions-table.tsx#L166-L177), the validation toggle is a bare `<button>` wrapping a `size-4` (16px) icon with no padding — an effective hit target of ~16×16px.

**Why it matters.** WCAG 2.2 SC 2.5.8 sets a 24×24px minimum (your design target is 44px). 16px fails outright. This is the most touch-frequent action in the densest screen, and Fitts's Law penalizes tiny targets with slower, error-prone acquisition — costly on mobile.

**Fix.** Pad the button to a compliant target while keeping the icon visually small:

```tsx
<button
  type="button"
  onClick={() => onToggleValidated(tx.id)}
  className="mx-auto flex size-9 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
  aria-label={tx.isValidated ? 'Mark as unvalidated' : 'Mark as validated'}
  aria-pressed={tx.isValidated}
>
  {tx.isValidated ? (
    <CheckCircle className="size-4 text-emerald-500" />
  ) : (
    <Circle className="size-4" />
  )}
</button>
```

(Also adds `aria-pressed` for screen-reader toggle state and a visible focus ring.) **Secondary tier (24px-OK, 44px-miss):** row-action trigger `size-7`=28px ([L185](apps/web/components/transactions/transactions-table.tsx#L185)), navbar icon buttons `size-8`=32px ([dashboard-navbar.tsx](apps/web/components/dashboard-navbar.tsx#L68)) — acceptable under 2.5.8, bump toward 44px where layout allows.

**Priority: Critical.** Only outright WCAG failure found in the visual layer.

---

### C3 — Semantic type/status colors are copy-pasted literals, not cva variants

**Problem.** The income/expense/transfer color logic lives as hardcoded strings in [transactions-table.tsx](apps/web/components/transactions/transactions-table.tsx#L47-L66) (`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400`), and over/warning badges repeat the pattern in [budget-card.tsx](apps/web/components/budgets/budget-card.tsx#L67-L76). The badge cva ([badge.tsx](apps/web/components/ui/badge.tsx#L11-L19)) has no semantic finance variants. ~25 emerald/rose/violet/amber literals across 8 files — drift-prone and inconsistent (two different recipes).

**Why it matters.** Brief explicitly expects cva semantic variants using opacity modifiers (`bg-emerald-500/15`). The opacity-modifier style is mode-agnostic — it kills the `dark:` fork entirely (one color works in both themes), which is more robust than the `-50`/`-950` swap and guarantees consistency.

**Fix — add variants to [badge.tsx](apps/web/components/ui/badge.tsx#L11-L19):**

```tsx
variant: {
  default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
  destructive: '...',            // unchanged
  outline: '...', ghost: '...', link: '...',   // unchanged
  // --- new finance semantics (mode-agnostic, no dark: fork) ---
  income:   'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  expense:  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20',
  transfer: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20',
  warning:  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
},
```

**Call-site before/after** in [transactions-table.tsx](apps/web/components/transactions/transactions-table.tsx#L104-L113) — delete `badgeClass` from `typeConfig` and map type→variant:

```tsx
// before: <Badge variant="outline" className={cn('... ', config.badgeClass)}>
// after:
<Badge variant={tx.type} className="flex w-fit items-center gap-1">
  <TypeIcon className="size-3" />
  {config.label}
</Badge>
```

Then budget-card "Over" → `variant="expense"`, "Warning" → `variant="warning"` (drop the literal strings at [L67](apps/web/components/budgets/budget-card.tsx#L67)/[L76](apps/web/components/budgets/budget-card.tsx#L76)).

**Priority: High.**

---

### C4 — Dark `--primary` is a flat low-chroma teal with no sharp accent

**Problem.** Dark mode `--primary: oklch(0.45 0.085 224.283)` ([globals.css](apps/web/app/globals.css#L101)) — lightness 0.45, chroma 0.085 — is muted, desaturated teal, and the darkest of the five chart colors. The primary button ([button.tsx](apps/web/components/ui/button.tsx#L12)) and brand mark ([app-sidebar.tsx](apps/web/components/app-sidebar.tsx#L52)) use it; against the `oklch(0.214 ...)` card it reads as low-energy. The `chart-1..5` ramp ([globals.css](apps/web/app/globals.css#L113-L117)) is all hue 207–224 — monochrome teal with no semantic distinction.

**Why it matters.** A dominant color + one sharp accent reads as designed; an evenly-muted single-hue palette reads as a default. Brief asks to _refine_ (not replace) the dark theme.

**Fix — refine, don't rebuild. Lift primary chroma/lightness so it works as a real accent ([globals.css](apps/web/app/globals.css#L101)):**

```css
.dark {
  /* before: --primary: oklch(0.45 0.085 224.283); */
  --primary: oklch(0.62 0.15 224); /* brighter, more saturated teal accent */
  --primary-foreground: oklch(0.16 0.02 224);
}
```

**Optional coherence note (Medium):** the chart ramp is mono-teal while the rest of the app speaks emerald (income) / rose (expense). Align income/expense chart series to the semantic hues so charts and badges tell the same color story — e.g. give `--chart-1`/`--chart-2` an emerald/rose lean rather than five teals.

**Priority: High.**

---

## 3. Aesthetic Assessment

**Is it AI slop? Yes — the recoverable kind.** It hits every generic marker: Inter on everything, monochrome desaturated palette, cards-everywhere, lucide icons used exactly as shipped, centered uniform card grid. But the underlying craft (spacing rhythm, `tabular-nums` everywhere, skeletons, divide-y lists, group-hover row actions) is genuinely good. A well-built generic theme, not a sloppy one.

| Dimension      | Current                                                          | Verdict                           | Make it distinctive                                                                                |
| -------------- | ---------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Typography** | Inter for sans + heading; Geist Mono mapped, unused              | Generic; identity-free            | Space Grotesk (or Cabinet Grotesk) display + JetBrains Mono amounts. C1.                           |
| **Color**      | `--primary` oklch(0.45 0.085 224) muted teal; 5 mono-teal charts | Timid, single-hue                 | Lift primary to oklch(0.62 0.15 224); semantic emerald/rose via cva. C3/C4.                        |
| **Layout**     | Sidebar + uniform 1/2/3-col card grids                           | Conventional but _correct_        | Optional: Net stat card spans 2 cols, or heavier display weight as a layout element. Low priority. |
| **Motion**     | Button `active:translate-y-px`, row-action opacity fade          | Tasteful, restrained              | Keep. Add staggered card reveal only if it respects `prefers-reduced-motion`.                      |
| **Numerics**   | `tabular-nums` consistently, in Inter                            | Functionally fine, visually plain | Render in JetBrains Mono (C1c) — instantly reads "finance tool."                                   |

---

## 4. What's Working (don't break these)

- **`tabular-nums` discipline** — applied consistently across 15 files. Exactly right for finance; preserve it when adding `font-mono`.
- **Loading + empty states** — [stat-card.tsx](apps/web/components/dashboard/stat-card.tsx#L28-L38) and [account-balances-widget.tsx](apps/web/components/dashboard/account-balances-widget.tsx#L43-L65) ship skeletons shaped like real output.
- **Semantic CSS-variable architecture** — `bg-card`, `text-muted-foreground`, etc. used throughout; theming stays centralized. cva variants (C3) extend this correctly.
- **Sidebar nav placement** — left-aligned, icon+label, active states ([app-sidebar.tsx](apps/web/components/app-sidebar.tsx)). Respects left-side attention bias (NN Group 2024) and Jakob's Law. No change.
- **Non-sticky chrome** — navbar header is `flex h-14 shrink-0` outside the `overflow-auto` `main`; table header isn't sticky. WCAG 2.4.11 (focus-not-obscured) is _currently satisfied_. If you later add a sticky table header, add `scroll-margin` to focusable rows and re-verify focus visibility.
- **Restrained, purposeful motion** — see table above.

---

## 5. Implementation Priority

| #   | Item                                                                    | Impact   | Effort  | Notes                                                  |
| --- | ----------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------------ |
| C1  | Typography: font setup + `@theme` tokens + apply `font-mono` to amounts | **High** | **Med** | The One Big Win. 3-part; (c) is the load-bearing part. |
| C2  | Validated-toggle 44px target + `aria-pressed` + focus ring              | **Med**  | **Low** | Only hard WCAG fail. Quick.                            |
| C3  | Semantic badge cva variants (income/expense/transfer/warning)           | **High** | **Med** | Removes ~25 literals; mode-agnostic.                   |
| C4  | Lift dark `--primary` chroma/lightness                                  | **High** | **Low** | One token edit; biggest visual lift per character.     |
| —   | Align chart ramp to emerald/rose semantics                              | Med      | Med     | Optional coherence; do after C3/C4.                    |
| —   | Secondary targets toward 44px (row-action `size-7`, navbar `size-8`)    | Low      | Low     | 2.5.8-compliant already; polish.                       |

---

## 6. Sources

- **Lindgaard et al. (2006)** — visual appeal judged in ~50ms; typography dominates first impression. Motivates C1.
- **Jakob's Law (NN Group)** — users expect your app to match tools they already use; monospaced amounts are a finance convention (Stripe, Mercury, Bloomberg). https://www.nngroup.com/articles/jakobs-law-internet-ux/
- **WCAG 2.2 SC 2.5.8 Target Size (Minimum, AA)** — 24×24px floor. C2. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- **WCAG 2.2 SC 2.4.11 Focus Not Obscured (AA)** — assessed and currently satisfied (non-sticky chrome). https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
- **Fitts's Law** — acquisition time ∝ distance/size; penalizes the 16px toggle. C2.
- **NN Group, horizontal attention leans left (2024)** — validates current left sidebar. https://www.nngroup.com/articles/horizontal-attention-leans-left/
- **Benchmarks:** Stripe Dashboard, Mercury, Monzo, Linear — grotesk/geometric heading + mono/tabular numerics on a committed dark surface with one sharp accent. The target aesthetic for C1/C4.

---

## 7. One Big Win

**Ship the typography system (C1) — all three parts.** Swap Inter for Space Grotesk + JetBrains Mono in [layout.tsx](apps/web/app/layout.tsx#L11), re-point `--font-heading`/`--font-mono` in [globals.css](apps/web/app/globals.css#L45-L55), and — critically — add `font-mono` to every amount span ([stat-card L44](apps/web/components/dashboard/stat-card.tsx#L44), [account-balances](apps/web/components/dashboard/account-balances-widget.tsx#L71), [transactions-table L122-130](apps/web/components/transactions/transactions-table.tsx#L122-L130), [budget-card L132-143](apps/web/components/budgets/budget-card.tsx#L132)). This single change delivers distinctiveness, finance-convention alignment, and numeric scannability at once, and satisfies the brief's explicit typography constraint. **Without part (c) it is inert — the token edit alone never touches a number.**
