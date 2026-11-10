# ADR-010: Message Catalog, Locale and One Currency per Family

**Date:** 2026-11-10  
**Status:** Accepted

## Context

Today formatting is a set of hand-picked settings per user. `user_settings` holds:

- `currencySymbol` (≤ 3 chars, default `$`);
- `currencyPosition`;
- `decimalSeparator` and `thousandSeparator`;
- `dateFormat` and `timeFormat`.

`formatAmount` in `packages/types/src/formatting.ts` assembles the string by hand. UI strings are hard-coded English. Some charts bypass the helper and call `toLocaleString('en-US')` directly, for example `income-vs-expenses-tab.tsx` and `balance-history-tab.tsx`.

The Ledger v2 review decided:

- **decision 3:** a message catalog now, shipping FR + EN;
- **decision 4:** one ISO 4217 currency per family, with multi-currency a non-goal;
- **decision 18:** shared components (amounts, status badges) take labels, locale and currency from the catalog.

The canvas showed the cost of the current approach: "$84,20" and "ON TRACK" on a French page, fixed one screen at a time.

Family makes it worse. Two parents with different symbols would see the same shared rows labeled with different currencies. Since amounts are never converted, one of them would be reading the wrong money.

## Decision

**1. Two separate concepts:**

| Concept | Meaning | Lives on | Example |
|---|---|---|---|
| **Locale** | Language plus number and date conventions, per person | `user_settings.locale` (`'fr-FR' \| 'en-US'`) | One parent reads French, the other English |
| **Currency** | What the amounts *are*, per household | `families.currency_code` (`char(3)`, ISO 4217) | `EUR` |

- A user without a family uses `user_settings.currency_code`.
- A family member uses the family's code; their own `user_settings.currency_code` is ignored while they belong to the family.
- One resolver in `packages/db`, `getFormatContext(userId)`, returns `{ locale, currency }`. It is the **only** place that decides which currency applies.

**2. Formatting goes through `Intl`, not hand-built strings.**

- `formatAmount(amount, ctx)` uses `Intl.NumberFormat(ctx.locale, { style: 'currency', currency: ctx.currency })`. That gives "84,20 €" in fr-FR and "€84.20" in en-US.
- The amount is passed as the `numeric` **string**, never `parseFloat` (string input to `NumberFormat.format` is exact). This is to be verified against the runtime's support before implementing.
- `formatDate` uses `Intl.DateTimeFormat(ctx.locale)` on the `date` value read as UTC, so the day never shifts.
- The sign rule (the canvas uses the true minus sign U+2212 in front, "−12,50 €") lives inside `formatAmount` only.
- Charts and components never call `toLocaleString` themselves. A lint rule bans `toLocaleString` and `toFixed` in `apps/*/components`.

**3. The message catalog is a typed object in `packages/types`, with no library.**

- `packages/types/src/i18n/{fr,en}.ts` export `as const` objects with the same keys. `en` is typed `satisfies Messages`, where `Messages` is derived from `fr`, so a missing key fails `tsc`.
- `t(locale, key, params?)` does `{name}` interpolation. Plurals use `Intl.PluralRules`.
- Both apps (Next.js and Expo) import the same catalog, and `packages/types` keeps zero runtime dependencies besides Zod.
- Status badges, amounts and empty states read labels from the catalog (decision 18).
- **Language selection:** the browser's `Accept-Language` sets the default. Once saved, `user_settings.locale` wins. The value is set on `<html lang>` server-side so client components agree with it.

**4. Currency rules.**

- **Set at family creation** from the creator's currency. A child created by a parent has no currency of their own; they use the family's.
- **Joining a family** (adult invite, decision 15). If the invitee's currency differs, the accept screen says so: "Vos montants seront affichés en EUR. Aucune conversion n'est faite." Accepting relabels; nothing is converted.
- **Changing the family currency** is allowed to any parent. The confirmation states that amounts are relabeled, not converted. It is logged as a family notification (decision 8).
- **Leaving a family** (graduate flow, v2.1): the user's own `currency_code` is set to the family's at the moment they leave, so their history keeps its meaning.

**5. Migration (expand, backfill, contract, as in ADR-008).**

1. **Expand.**
   - Add `user_settings.locale` and `user_settings.currency_code`.
   - Add `families.currency_code` when the families table is created.
2. **Backfill.**
   - Currency: `$` → `USD`, `€` → `EUR`, `£` → `GBP`. Any other symbol → `NULL`, and the app asks once at next login.
   - Locale: `decimalSeparator = ','` → `fr-FR`, else `en-US`.
3. **Switch** `formatAmount`, `formatDate` and the settings page to the new fields. The settings page shows **Langue** and **Devise** (devise only when there is no family; a family member sees it read-only, with a link to the family settings).
4. **Contract.** Drop `currency_symbol`, `currency_position`, `decimal_separator`, `thousand_separator`, `date_format` and `time_format` in a later release.

## Consequences

**Positive**

- One rule per concern: the person chooses the language, the household chooses the currency. Two parents can read different languages and still agree on what the money is.
- `Intl` handles separators, symbol position and spacing correctly for each locale. That removes six settings and the bugs that came with them.
- The type system catches a missing translation at build time. Web and mobile share one catalog.
- String amounts avoid float rounding in display.

**Negative**

- Users lose fine control, for example a custom date format. This is accepted: locale conventions cover the target users (FR and EN households).
- Changing the family currency is a relabel. Someone who switches by mistake sees wrong-looking numbers until they switch back. Mitigated by the confirmation copy and the notification to all parents.
- Every hard-coded string in `apps/web` has to move into the catalog. That is a wide but mechanical change, done screen by screen.
- Schema changes on `user_settings` and `families` need approval before the migration.

## Rejected alternatives

- **Currency per user inside a family.** Shared rows would show two currencies for the same money.
- **Currency per account or per transaction (multi-currency).** Needs exchange rates and conversion rules, and it is a stated non-goal (decision 4).
- **Keep the six format settings and add language only.** That keeps the "$84,20" class of bugs and duplicates what `Intl` already knows.
- **`next-intl` / `i18next`.** It is a new dependency, and `next-intl` is web-only while Expo needs the same catalog. FR + EN with simple interpolation doesn't justify a library yet. Revisit if ICU message syntax or more languages are needed.
- **Translations in the database.** No runtime editing need, and it makes type-checking keys impossible.
