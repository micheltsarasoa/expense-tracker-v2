---
name: tenant-isolation-tests
description: Write the negative access tests every route, server action or service method needs - another user or household must get nothing. Use whenever adding or changing data access.
---

# Tenant isolation tests

Every data access ships with tests proving that another actor cannot read or change the data (`.claude/rules/tenancy.md`).

Set up with `packages/test-utils`: `withTestDb`, factories, `asUser`.

For each operation, cover:

| Case                                             | Expected                      |
| ------------------------------------------------ | ----------------------------- |
| Owner                                            | Success                       |
| Other user, no household                         | 404 (do not reveal existence) |
| Member of another household                      | 404                           |
| Co-parent, read on shared data                   | Allowed by role (D-16, D-28)  |
| Co-parent, write on someone else's personal data | 403                           |
| Child on a parent's data                         | 404                           |
| Unauthenticated                                  | 401                           |

Shape:

```ts
it("does not return another household's budget", async () => {
  await withTestDb(async (db) => {
    const owner = await createUser(db);
    const stranger = await createUser(db);
    const budget = await createBudget(db, { userId: owner.id });
    await expect(asUser(stranger, () => service.getBudget(budget.id))).rejects.toThrow(
      NotFoundError,
    );
  });
});
```

Also assert lists: the stranger's list never contains the owner's ids. Name tests with `GLOSSARY.md` terms.
