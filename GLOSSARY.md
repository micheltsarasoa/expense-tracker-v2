# Expense Tracker

A personal and family finance app: each person records what they spend and earn across their own accounts, and parents follow their children's spending without blocking it.

## Money

**Account**:
A place where a user's money sits and whose balance the app tracks, such as a bank account, a card or cash. Every transaction belongs to exactly one account.
_Avoid_: Payment method, compte (UI only)

**Transaction**:
One recorded movement of money in one account, owned by one user. It is an expense, an income or one leg of a transfer.
_Avoid_: Entry, operation, movement

**Expense**:
A transaction where money leaves the household for goods or services.
_Avoid_: Spending (for a single row), debit

**Income**:
A transaction where money enters an account from outside the household.
_Avoid_: Revenue, credit

**Transfer**:
Money moved between two accounts, recorded as one transfer group with an out leg and an in leg.
_Avoid_: Move, internal transaction

**Transfer group**:
The pair of legs that make up one transfer. It is created, edited and deleted as a whole.
_Avoid_: Transfer pair, linked transactions

**Leg**:
One of the two transactions of a transfer: the **out leg** leaves the source account, the **in leg** arrives in the target account.
_Avoid_: Side, half, out row / in row

**Convert**:
The explicit action that turns a transfer into an expense or income, or the reverse, by removing or adding the other leg.
_Avoid_: Change type

**Spent**:
What a user's money went to over a period: their expenses plus their out legs to a child's wallet. Transfers between a user's own accounts are never spent.
_Avoid_: Outflow, total debits

**Kept**:
Income minus spent over a period.
_Avoid_: Savings, net, balance

**Budget**:
A spending limit on one category, either **monthly** (repeats every calendar month) or **one-off** (fixed start and end dates).
_Avoid_: Envelope, cap

## Family

**Family**:
A household of parents and children who share visibility over each other's finances.
_Avoid_: Household, group, team

**Parent**:
An adult member of a family. Manages children and reads co-parents' shared data.
_Avoid_: Admin, guardian, owner

**Co-parent**:
Another parent of the same family, seen from one parent's point of view.
_Avoid_: Spouse, partner

**Child**:
A member of a family who has one wallet and sees only their own data.
_Avoid_: Kid, dependant, minor

**Wallet**:
The single cash account of a child.
_Avoid_: Child account, pocket

**Digital wallet**:
A kind of account held in a phone or online service, such as Apple Pay or PayPal. Not related to a child's wallet.
_Avoid_: Wallet (alone), e-wallet

**Allowance**:
A transfer from a parent's account to a child's wallet.
_Avoid_: Family transfer, pocket money

**Money request**:
A child's request for an amount, which a parent approves (recording an allowance) or declines.
_Avoid_: Ask, demand

**Spending rule**:
A threshold a parent sets on a child's spending. Breaking it raises a flag; it never blocks.
_Avoid_: Limit, restriction, control

**Flag**:
A mark on a child's expense saying it broke a spending rule or took the wallet below zero, shown to parents until seen.
_Avoid_: Alert, warning

**Graduate**:
A child leaving the family to become an independent user, keeping their history.
_Avoid_: Leave, emancipate

## Visibility

**Shared account**:
An account whose transactions co-parents can read. Accounts are shared by default.
_Avoid_: Public account

**Private account**:
An account of an adult that co-parents cannot see at all, including its balance and its transactions.
_Avoid_: Hidden account, secret account

**Username**:
The name a parent chooses for a child to sign in with, unique across the app.
_Avoid_: Login, handle, pseudo

## Formatting

**Locale**:
The language and number and date conventions one person reads the app in.
_Avoid_: Language (alone), format settings

**Family currency**:
The one currency all amounts of a family are in. Amounts are never converted.
_Avoid_: Currency symbol, user currency
