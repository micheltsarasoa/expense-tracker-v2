# Ledger v2 — design review decisions

Outcome of a review of the "Ledger v2" design canvas (19 artboards) against `docs/PRD.md`, `docs/specs/`, `docs/decisions/` and the current schema, followed by a decision interview. Date: 2026-11-10.

## v2.0 scope

**Ships:** core (Aperçu, Transactions, Budgets per ADR-007, Rapports, Paramètres, Import) + Family (membership, child account, wallet, allowance, money requests, flagged expenses, watched categories, corrections, in-app notifications).

**v2.1:** Recurring (read-time occurrences, one-tap confirm, idempotent on rule + date), SharedPot (after its own ADR), e-mail for money requests, graduate flow, Excel import, 30-day agenda instead of Calendar, child savings goal.

**Later:** Worth, Debts and tax, what-if simulator, saved reports, push and digest, bank sync, Expo native, multi-currency, multi-family.

## Decisions

| # | Topic | Decision |
|---|---|---|
| 1 | Scope | Core + Family only in v2.0 |
| 2 | Spouse visibility | Co-parents see everything except accounts marked private (`visibility` on `payment_methods`). Export covers own rows only. |
| 3 | Language | Message catalog now; ship FR + EN |
| 4 | Currency | One ISO 4217 code per family; multi-currency is a non-goal |
| 5 | Navigation | 5 items: Aperçu, Transactions, Budgets, Famille, Rapports. Comptes, Catégories, Import and notification preferences live in Paramètres or in-page sections. |
| 6 | Phone | Responsive web / PWA for everyone; amount-first quick add with default account and recent categories |
| 7 | Transfers | Unify on two rows + `transferGroupId` before Family; single "spent / kept" definition; balance invariant test |
| 8 | Notifications | In-app only, written in the same DB transaction as the event; undo hold via `visibleAt` |
| 9 | Child exit | Graduate flow (child becomes an independent user, history kept, oversight ended) — v2.1, data model ready in v2.0 |
| 10 | Child login | Parent-chosen username — verify Neon Auth / Stack support first; fallback e-mail |
| 11 | Canvas vs locked decisions | `docs/WAVE2-STATUS.md` wins: transaction type editable after save; budget category required |
| 12 | Design system | Ledger without emoji or load animations. Custom SVG charts kept under a new ADR extending ADR-004. Glow is a signature: glow gradients, glow filters, hero text glow, glass panels and wallet shadows stay, static only and tokenized (`--glow-mint`, `--glow-family`, `--glow-expense`). Name "Ledger" kept for now. |
| 13 | Import | Duplicate detection on account + date + amount + normalized description, with a review step before commit |
| 14 | Child income | Child can record received cash; visible to parent, no approval |
| 15 | Adult invite | Invite token survives sign-up; user joins the family afterwards |
| 16 | Type edits | Expense ↔ income edit freely. Transfer ↔ expense/income only through an explicit "Convert" action that creates or deletes the paired row in one DB transaction |

## Follow-ups

**ADRs to write (developer):**
- Transfer unification.
- Spouse visibility (amends ADR-006).
- i18n + family currency.
- Custom SVG charts and glow identity (extends ADR-004).

**Canvas updates:**
- Remove deferred boards from v2.0 navigation.
- Fix the two locked-decision conflicts.
- Remove emoji and load animations (done); keep glow and glass.
- Category icons: Lucide icon key per category.
- Add child cash-in and the private-account toggle.
- Make the quick add amount-first.

**Open checks:**
- Stack Auth username support.
- `GLOSSARY.md` and `apps/mobile` are referenced in `CLAUDE.md` but missing.
- ADR-005, 006 and 007 are still "Proposed".
