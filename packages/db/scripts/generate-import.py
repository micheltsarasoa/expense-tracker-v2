"""
Generate import-ready CSV from all_transactions_wallet_records.xlsx.
Rules agreed with user — see conversation for rationale.
Output: docs/import_ready.csv  (relative to repo root)
"""
import openpyxl, json, csv, sys
from pathlib import Path

REPO = Path(__file__).parents[3]
XLSX = REPO / "docs" / "all_transactions_wallet_records.xlsx"
EXISTING_JSON = Path(__file__).parent / "existing-transactions.json"
OUT_CSV = REPO / "docs" / "import_ready.csv"

# ---------------------------------------------------------------------------
# Account mapping (substring match to survive encoding noise in Excel)
# ---------------------------------------------------------------------------
def map_account(raw: str) -> str:
    if "LCL" in raw:        return "Bank Account"
    if "BoursoBank" in raw: return "Boursorama"
    if "Hello bank" in raw: return "Hello Bank"
    return raw  # keep unknown — will flag as error at import time

# ---------------------------------------------------------------------------
# Category mapping: Excel category → DB category name
# expense
# ---------------------------------------------------------------------------
EXPENSE_CAT = {
    "restaurant, fast-food":       "Dining & Takeout",
    "restaurant (only me)":        "Dining & Takeout",
    "bar, cafe":                   "Dining & Takeout",
    "food & drinks":               "Dining & Takeout",
    "boulangerie":                 "Groceries",
    "groceries":                   "Groceries",
    "course hebdo":                "Groceries",
    "clothes & footwear":          "Clothing & Accessories",
    "software, apps, games":       "Subscriptions",
    "tv, streaming":               "Subscriptions",
    "abonnement internet mobile":  "Communication",
    "internet":                    "Communication",
    "abonnement":                  "Subscriptions",
    "books, audio, subscriptions": "Subscriptions",
    "public transport":            "Transportation",
    "hors abonnement":             "Transportation",
    "taxis":                       "Transportation",
    "parking":                     "Transportation",
    "long distance":               "Transportation",
    "flixbus-blabla":              "Transportation",
    "car":                         "Transportation",
    "vehicle":                     "Transportation",
    "vehicle maintenance":         "Transportation",
    "transportation":              "Transportation",
    "home, garden":                "Home Maintenance & Repairs",
    "maintenance, repairs":        "Home Maintenance & Repairs",
    "energy, utilities":           "Utilities",
    "active sport, fitness":       "Fitness & Wellness",
    "wellness, beauty":            "Personal Care",
    "health and beauty":           "Personal Care",
    "drug-store, chemist":         "Personal Care",
    "health care, doctor":         "Healthcare",
    "insurances":                  "Insurance",
    "property insurance":          "Insurance",
    "assurance moyen paiement":    "Insurance",
    "assurance":                   "Insurance",
    "life & entertainment":        "Entertainment",
    "leisure time":                "Entertainment",
    "culture, sport events":       "Entertainment",
    "holiday, trips, hotels":      "Travel & Vacation",
    "charity, gifts":              "Donations",
    "witnesses":                   "Donations",
    "retrait":                     "Donations",
    "madagascar":                  "Donations",
    "gifts, joy":                  "Gifts",
    "electronics, accessories":    "Shopping",
    "shopping & utilities":        "Shopping",
    "postal services":             "Other",
    "life events":                 "Other",
    "services":                    "Other",
    "pets, animals":               "Other",
    "advisory":                    "Other",
    "supports":                    "Other",   # 1 income row but mapped by type below
    "unknown expense":             "Other",
    "charges, fees":               "Fees",
    "carte cotisation":            "Fees",
    "loans, interests":            "Debt Payments",
    "leasing":                     "Debt Payments",
    "financial investments":       "Investments",
    "financial expenses":          "Financial",
    "rent":                        "Rent",
    "rentals":                     "Housing",
    "lending, renting":            "Housing",
    "impots":                      "Taxes",
    "fines":                       "Fine",
    "alcohol, tobacco":            "Discretionary Spending",
    "transfer, withdraw":          "Other",   # Q4: expense/Other
}

# income
INCOME_CAT = {
    "income":                       "Other Income",
    "income own account":           "Other Income",    # fallback; transfers handled separately
    "income - own account":         "Other Income",
    "unknown income":               "Other Income",
    "supports":                     "Other Income",
    "wage, invoices":               "Salary/Wages",
    "cpam":                         "CPAM & Mutuelle",
    "interests, dividends":         "Investment Returns",
    "refunds (tax, purchase)":      "Refunds",
    # Categories that appear with both Income and Expense types in the source
    "transfer, withdraw":           "Other Income",
    "lending, renting":             "Other Income",
}

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------
wb = openpyxl.load_workbook(XLSX)
ws = wb["Wallet Records"]
xl_rows: list[dict] = []
headers: list[str] | None = None
for i, row in enumerate(ws.iter_rows(values_only=True)):
    if i == 0:
        headers = [str(h) for h in row]
        continue
    xl_rows.append(dict(zip(headers, row)))  # type: ignore

with open(EXISTING_JSON, encoding="utf-8") as f:
    existing: list[dict] = json.load(f)

# Build dedup set: (date, normalised_amount, account_lower)
def norm_amount(v: str) -> str:
    try:
        return f"{float(str(v).replace(',','.').replace(' ','')):.2f}"
    except Exception:
        return str(v)

existing_keys: set[tuple] = set()
for tx in existing:
    key = (tx["date"], norm_amount(tx["amount"]), tx["account"].lower())
    existing_keys.add(key)

# ---------------------------------------------------------------------------
# Build set of Outcome→Boursorama rows to deduplicate Income Own Account
# on Boursorama (same date+amount = two sides of the same transfer)
# ---------------------------------------------------------------------------
outcome_transfers: set[tuple] = set()
for r in xl_rows:
    if r.get("category") != "Outcome - Own Bank Account":
        continue
    note = str(r.get("note") or "")
    if "BOURSORAMA" in note.upper() or "BOURSO" in note.upper():
        date_raw = str(r.get("date") or "")[:10]
        amount_str = norm_amount(str(r.get("amount") or "0"))
        outcome_transfers.add((date_raw, amount_str))

# ---------------------------------------------------------------------------
# Process each row
# ---------------------------------------------------------------------------
out_rows: list[dict] = []
skipped_dupes = 0
skipped_transfer_dedup = 0
unmapped: set[str] = set()
warnings: list[str] = []

for idx, r in enumerate(xl_rows, 2):  # row 2 = first data row in Excel
    date_raw = str(r.get("date") or "")[:10]   # "2026-06-04T00:00:00.000Z" → "2026-06-04"
    category  = str(r.get("category") or "").strip()
    xl_type   = str(r.get("type") or "").strip().lower()   # "Income" / "Expense"
    amount    = str(r.get("amount") or "").strip()
    note      = str(r.get("note") or "").strip()
    xl_acct   = str(r.get("account") or "").strip()

    acct = map_account(xl_acct)
    cat_lower = category.lower()

    # Determine row type and category based on rules
    row_type: str | None = None
    row_cat  = ""
    row_to   = ""
    row_desc = note[:200]   # cap description length

    # -----------------------------------------------------------------------
    # TRANSFER RULES
    # -----------------------------------------------------------------------
    if cat_lower == "lcl saving":
        row_type = "transfer"
        row_to   = "Livret A"
        acct     = "Bank Account"

    elif cat_lower == "outcome - own bank account":
        if "BOURSORAMA" in note.upper() or "BOURSO" in note.upper():
            row_type = "transfer"
            row_to   = "Boursorama"
            acct     = "Bank Account"
        elif "depuis boursobank" in note.lower() or "depuis bourso" in note.lower():
            row_type = "transfer"
            row_to   = "Bank Account"
            acct     = "Boursorama"
        else:
            # Commission / account fees
            row_type = "expense"
            row_cat  = "Fees"

    elif cat_lower == "income own account":
        dest_acct = map_account(xl_acct)
        if dest_acct == "Boursorama":
            # Skip if paired with an Outcome row (same date + amount)
            key = (date_raw, norm_amount(amount))
            if key in outcome_transfers:
                skipped_transfer_dedup += 1
                continue
            else:
                row_type = "transfer"
                acct     = "Bank Account"
                row_to   = "Boursorama"
        elif dest_acct == "Hello Bank":
            row_type = "transfer"
            acct     = "Bank Account"
            row_to   = "Hello Bank"
        elif dest_acct == "Bank Account":
            row_type = "transfer"
            acct     = "Boursorama"
            row_to   = "Bank Account"
        else:
            # Unknown destination — fall back to income
            row_type = "income"
            row_cat  = "Other Income"
            warnings.append(f"Row {idx}: Income Own Account on unknown account '{xl_acct}' → income/Other Income")

    # -----------------------------------------------------------------------
    # NORMAL INCOME / EXPENSE
    # -----------------------------------------------------------------------
    elif xl_type == "expense":
        row_type = "expense"
        row_cat  = EXPENSE_CAT.get(cat_lower, "")
        if not row_cat:
            unmapped.add(category)
            row_cat = "Other"

    elif xl_type == "income":
        row_type = "income"
        row_cat  = INCOME_CAT.get(cat_lower, "")
        if not row_cat:
            unmapped.add(category)
            row_cat = "Other Income"

    else:
        warnings.append(f"Row {idx}: unknown type '{xl_type}' for category '{category}' — skipped")
        continue

    # -----------------------------------------------------------------------
    # DEDUPLICATION against existing DB transactions
    # Transfers: check account (source)
    # -----------------------------------------------------------------------
    dedup_key = (date_raw, norm_amount(amount), acct.lower())
    if dedup_key in existing_keys:
        skipped_dupes += 1
        continue

    out_rows.append({
        "date":        date_raw,
        "type":        row_type,
        "amount":      amount,
        "account":     acct,
        "category":    row_cat,
        "toAccount":   row_to,
        "label":       "",
        "description": row_desc,
    })

# ---------------------------------------------------------------------------
# Write output CSV (semicolon-delimited, UTF-8 with BOM for Excel compat)
# ---------------------------------------------------------------------------
FIELDS = ["date", "type", "amount", "account", "category", "toAccount", "label", "description"]
with open(OUT_CSV, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.DictWriter(f, fieldnames=FIELDS, delimiter=";")
    writer.writeheader()
    writer.writerows(out_rows)

# ---------------------------------------------------------------------------
# Summary report
# ---------------------------------------------------------------------------
from collections import Counter
type_counts  = Counter(r["type"]     for r in out_rows)
acct_counts  = Counter(r["account"]  for r in out_rows)
cat_counts   = Counter(r["category"] for r in out_rows if r["type"] != "transfer")

print(f"\n{'='*60}")
print(f"  INPUT   : {len(xl_rows):,} Excel rows")
print(f"  EXISTING: {len(existing):,} DB transactions")
print(f"  DUPES   : {skipped_dupes:,} skipped (already in DB)")
print(f"  TRANSFER DEDUP: {skipped_transfer_dedup} skipped (other-side of transfer)")
print(f"  OUTPUT  : {len(out_rows):,} new rows  ->  {OUT_CSV.name}")
print(f"{'='*60}")
print(f"\nBy type:")
for t, n in sorted(type_counts.items()): print(f"  {t:<10} {n:>5}")
print(f"\nBy account:")
for a, n in sorted(acct_counts.items()): print(f"  {a:<25} {n:>5}")
print(f"\nTop categories (income/expense only):")
for c, n in cat_counts.most_common(20): print(f"  {c:<35} {n:>5}")

if unmapped:
    print(f"\nWARNING — unmapped categories (defaulted to Other/Other Income):")
    for u in sorted(unmapped): print(f"  • {u}")

if warnings:
    print(f"\nOTHER WARNINGS:")
    for w in warnings: print(f"  • {w}")
