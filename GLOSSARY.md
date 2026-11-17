# Glossary

Domain vocabulary for code, tests, issues and docs. Use the **Term** column in code and English docs, the **FR** column in the French UI. If a concept is missing, add it here in the same PR.

## People and groups

| Term      | FR               | Definition                                                                                                                   | Avoid                        |
| --------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| User      | Utilisateur      | A person with a login. Owns rows through `userId`.                                                                           | customer, client             |
| Solo user | Utilisateur seul | A user who belongs to no household.                                                                                          | single                       |
| Household | Foyer            | A group of users who share some money and see each other's data as allowed by their role. One currency per household (D-05). | family (in code), team       |
| Parent    | Parent           | Adult household member. Full control of own data; read-only on co-parents' data; manages children.                           | admin, owner                 |
| Co-parent | Co-parent        | Another parent of the same household.                                                                                        | partner, spouse              |
| Child     | Enfant           | Minor household member with one wallet and a login created by a parent. Sees only their own data.                            | kid (in code), minor (in UI) |
| Roommate  | Colocataire      | Adult household member who shares only the shared pot, not their personal data.                                              | flatmate                     |

## Money

| Term                  | FR                   | Definition                                                                                                            | Avoid                                       |
| --------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Money                 | Montant              | An amount with its currency. Stored `numeric(15,2)`, carried as a string, handled by the `Money` type. Never a float. | price, value                                |
| Account               | Compte               | Where money sits: bank account, card, cash. Has an initial balance and a current balance. Table: `payment_methods`.   | payment method (in UI), wallet (for adults) |
| Wallet                | Porte-monnaie        | The single cash account of a child.                                                                                   | piggy bank                                  |
| Balance               | Solde                | Initial balance plus the sum of the account's transactions. Cached and reconciled (D-29).                             | total                                       |
| Transaction           | Opération            | One money movement on one account: income, expense, or one side of a transfer.                                        | entry, operation, movement                  |
| Transfer              | Virement             | Two linked transactions moving money between two accounts, possibly owned by two users.                               | move                                        |
| Category              | Catégorie            | Required classification of a transaction (Groceries, Rent…).                                                          | type, tag                                   |
| Label                 | Étiquette            | Optional free tag on a transaction, many per transaction.                                                             | category                                    |
| Budget                | Budget               | A spending cap, monthly or one-off, optionally scoped to a category or label.                                         | envelope, limit                             |
| Recurring transaction | Opération récurrente | A rule that creates a transaction on a schedule.                                                                      | subscription, standing order                |
| Goal                  | Objectif             | A target amount to save by a date.                                                                                    | savings plan                                |
| Shared pot            | Pot commun           | A household account that several members pay into and spend from.                                                     | joint account, kitty                        |
| Receipt               | Justificatif         | A file (photo, PDF) attached to a transaction.                                                                        | ticket, invoice                             |

## Child features

| Term          | FR              | Definition                                                                                                                             | Avoid                          |
| ------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Allowance     | Argent de poche | A transfer from a parent to a child's wallet, one-off or on a schedule.                                                                | pocket money (in code), salary |
| Money request | Demande         | A child asks a parent for an amount. States: `pending`, `approved`, `declined`, `cancelled`. Approval records the transfer atomically. | ask, claim                     |
| Spending rule | Règle           | A parent-defined condition on a child's spending (amount, category). It flags, it never blocks.                                        | limit, block                   |
| Flag          | Signalement     | The notice raised when a spending rule matches.                                                                                        | alert, violation               |
| Correction    | Correction      | A parent's visible edit of a child's transaction; the child sees the change and who made it.                                           | override                       |

## Platform

| Term         | FR           | Definition                                                                                 | Avoid                  |
| ------------ | ------------ | ------------------------------------------------------------------------------------------ | ---------------------- |
| Actor        | Acteur       | The authenticated user on whose behalf a request runs. Every query is scoped by the actor. | current user (in code) |
| Notification | Notification | An in-app (and optionally email) message to a user (D-30).                                 | alert                  |
