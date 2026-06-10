import pandas as pd

path = r"docs/all_transactions_wallet_records.xlsx"
df = pd.read_excel(path, sheet_name="Wallet Records")
df["date"] = pd.to_datetime(df["date"], utc=True)
df["ym"] = df["date"].dt.strftime("%Y-%m")

exp = df[(df["type"] == "Expense") & (df["transfer"] == False)].copy()
WINDOW = ["2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05"]
win = exp[exp["ym"].isin(WINDOW)]
n = len(WINDOW)

# Wallet category -> DB budget category. None = no-slot (flag/exclude).
MAP = {
    "Unknown expense": "(EXCLUDE)",
    "Outcome - Own Bank Account": None, "Retrait": None, "Loans, interests": None,
    "Charges, Fees": None, "Advisory": None, "Carte COTISATION": None,
    "Impots": None, "Fines": None, "Madagascar": None, "Witnesses": None,
    "Rent": "Rent",
    "Groceries": "Groceries", "Course hebdo": "Groceries", "Boucherie": "Groceries",
    "Boulangerie": "Groceries", "Food & Drinks": "Groceries",
    "Restaurant, fast-food": "Dining & Takeout", "Restaurant (only me)": "Dining & Takeout",
    "Bar, cafe": "Dining & Takeout", "Alcohol, tobacco": "Dining & Takeout",
    "Public transport": "Transportation", "Taxis": "Transportation", "Car": "Transportation",
    "Parking": "Transportation", "Leasing": "Transportation", "Flixbus-Blabla": "Transportation",
    "Transportation": "Transportation", "Vehicle": "Transportation", "Vehicle maintenance": "Transportation",
    "Insurances": "Insurance", "Assurance": "Insurance", "Property insurance": "Insurance",
    "Assurance moyen paiement": "Insurance", "Assurance habitation 01": "Insurance",
    "Energy, utilities": "Utilities",
    "Software, apps, games": "Subscriptions", "TV, Streaming": "Subscriptions",
    "Books, audio, subscriptions": "Subscriptions", "Abonnement": "Subscriptions",
    "Internet": "Communication", "Abonnement Internet Mobile": "Communication",
    "Hors abonnement": "Communication",
    "Clothes & Footwear": "Clothing & Accessories", "Shopping & Utilities": "Clothing & Accessories",
    "Life & Entertainment": "Entertainment", "Culture, sport events": "Entertainment",
    "Electronics, accessories": "Entertainment", "Leisure time": "Entertainment",
    "Home, garden": "Housing", "Maintenance, repairs": "Housing", "Housing": "Housing",
    "Charity, gifts": "Donations", "Gifts, joy": "Donations",
    "Health care, doctor": "Healthcare", "Drug-store, chemist": "Healthcare",
    "Wellness, beauty": "Personal Care", "Health and beauty": "Personal Care",
    "Holiday, trips, hotels": "Travel & Vacation", "Long distance": "Travel & Vacation",
    "Rentals": "Travel & Vacation",
    "Active sport, fitness": "Fitness & Wellness",
    "Financial investments": "Savings — PER", "LCL Saving": "Savings — Livret A", "Savings": "Savings — Emergency Fund",
    "Pets, animals": None, "Services": None, "Postal services": None,
    "Education, development": "Entertainment", "Culture": "Entertainment",
}

cat_sum = win.groupby("category")["amount"].sum()
per_db = {}
noslot = {}
unmapped = {}
for cat, total in cat_sum.items():
    permo = total / n
    tgt = MAP.get(cat, "??")
    if tgt == "(EXCLUDE)":
        continue
    if tgt == "??":
        unmapped[cat] = permo
    elif tgt is None:
        noslot[cat] = permo
    else:
        per_db[tgt] = per_db.get(tgt, 0) + permo

SAVINGS = {"Savings — PER": 110, "Savings — Livret A": 150, "Savings — Emergency Fund": 232}
spend = {k: v for k, v in per_db.items() if k not in SAVINGS}
spend_total = sum(spend.values())
POOL = 2000 - sum(SAVINGS.values())  # 1508

scaled = {k: v / spend_total * POOL for k, v in spend.items()}
rounded = {k: round(v) for k, v in scaled.items()}
diff = POOL - sum(rounded.values())
if diff:
    top = max(rounded, key=rounded.get)
    rounded[top] += diff

print(f"Window: {WINDOW[0]}..{WINDOW[-1]} ({n} months)")
print(f"Actual categorized SPEND (mapped, excl Unknown/no-slot): {spend_total:.2f}/mo")
print(f"Savings fixed: {sum(SAVINGS.values())}  ->  spending pool re-weighted to {POOL}\n")
print(f"{'DB budget category':<26} {'actual/mo':>10} {'PROPOSED':>9}")
for k in sorted(rounded, key=lambda x: -rounded[x]):
    print(f"  {k:<24} {spend[k]:>10.2f} {rounded[k]:>9d}")
for k, v in SAVINGS.items():
    print(f"  {k:<24} {per_db.get(k,0):>10.2f} {v:>9d}  (fixed)")
print(f"\n  {'TOTAL':<24} {'':>10} {sum(rounded.values())+sum(SAVINGS.values()):>9d}")

print("\nNO-SLOT (flagged, excluded from re-weight) -- /mo:")
for k, v in sorted(noslot.items(), key=lambda x: -x[1]):
    print(f"   {v:7.2f}  {k}")
if unmapped:
    print("\nUNMAPPED (need a decision) -- /mo:")
    for k, v in sorted(unmapped.items(), key=lambda x: -x[1]):
        print(f"   {v:7.2f}  {k}")
