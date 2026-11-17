---
paths:
  - 'apps/**/api/**'
  - 'apps/**/actions.ts'
  - '**/services/**'
  - 'packages/db/**'
---

# Tenant isolation

- Every query is scoped by the actor: `userId`, and `householdId` where the data is shared (D-16).
- Every read or write of another user's data goes through `authorize()` (D-28); RLS is the second line, not the first.
- Every new route, action or service method ships with a negative test: another user (and another household) gets 404 or 403 and no data.
- Never trust an id from the client to imply ownership.
