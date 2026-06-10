# Vercel Deployment — Installation Manual

This guide walks through linking `apps/web` to Vercel from scratch and wiring the GitHub Actions workflow that's already in `.github/workflows/deploy.yml`.

---

## Prerequisites

- Node.js 22+ and pnpm installed locally
- A [Vercel account](https://vercel.com/signup) (free tier is enough)
- The repo pushed to GitHub
- The Vercel CLI: `npm i -g vercel`

---

## Step 1 — Link the project to Vercel

Run this from inside `apps/web`:

```bash
cd apps/web
vercel link
```

When prompted:

| Prompt                           | Answer                                 |
| -------------------------------- | -------------------------------------- |
| Set up and deploy?               | **N** (we deploy via CI, not now)      |
| Which scope?                     | Your personal account or team          |
| Link to existing project?        | **N** (create a new one)               |
| Project name                     | `expense-tracker-web` (or any name)    |
| In which directory is your code? | `.` (you're already inside `apps/web`) |

This creates `apps/web/.vercel/project.json` — **commit this file**. It contains `projectId` and `orgId` which the workflow needs.

```bash
git add apps/web/.vercel/project.json
git commit -m "chore: link vercel project"
```

---

## Step 2 — Collect the three secret values

### VERCEL_TOKEN

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create** → name it `github-actions-expense-tracker`
3. Set expiration to **No expiration** (or rotate annually)
4. Copy the token — you won't see it again

### VERCEL_ORG_ID and VERCEL_PROJECT_ID

Open the file that was just created:

```bash
cat apps/web/.vercel/project.json
```

```json
{
  "orgId": "team_xxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxx"
}
```

`orgId` → `VERCEL_ORG_ID`
`projectId` → `VERCEL_PROJECT_ID`

### DATABASE_URL

This is your Neon connection string. Find it in the Neon console under **Connection Details**. Use the **pooled** connection string (port 5432, `?sslmode=require` suffix).

---

## Step 3 — Add secrets to GitHub

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each:

| Secret name         | Value                           |
| ------------------- | ------------------------------- |
| `VERCEL_TOKEN`      | Token from Step 2               |
| `VERCEL_ORG_ID`     | `orgId` from `project.json`     |
| `VERCEL_PROJECT_ID` | `projectId` from `project.json` |
| `DATABASE_URL`      | Neon connection string          |

> The workflow uses `environment: ${{ github.event.inputs.environment }}`, so secrets can optionally be scoped to a GitHub Environment instead. If you want approval gates before production deploys, create a GitHub Environment named `production` under **Settings → Environments** and move the secrets there.

---

## Step 4 — Configure the Vercel project (environment variables)

The build pulls env vars from Vercel via `vercel pull`. Add your app's runtime variables in the Vercel dashboard:

1. Open your project → **Settings** → **Environment Variables**
2. Add each variable for the **Preview** environment (and **Production** when ready):

| Key                                        | Where to find it                   |
| ------------------------------------------ | ---------------------------------- |
| `DATABASE_URL`                             | Neon → Connection Details (pooled) |
| `NEXT_PUBLIC_STACK_PROJECT_ID`             | Stack Auth dashboard               |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth dashboard               |
| `STACK_SECRET_SERVER_KEY`                  | Stack Auth dashboard               |

Add any other keys your `apps/web/.env.local` contains.

---

## Step 5 — Trigger a deploy

1. Go to your repo on GitHub → **Actions** tab
2. Select the **Deploy** workflow in the left sidebar
3. Click **Run workflow** (top right)
4. Choose `preview` from the dropdown
5. Click the green **Run workflow** button

The workflow will:

1. Install dependencies
2. Pull Vercel environment variables for the chosen environment
3. Build the Next.js app using Vercel's build system
4. Deploy the prebuilt output to Vercel

The deploy URL appears in the workflow logs under the **Deploy** step.

---

## How the workflow works

The workflow at `.github/workflows/deploy.yml` uses the **Vercel CLI approach** (not the Vercel GitHub integration). This means:

- Vercel does **not** auto-deploy on push — you control every deploy
- The same workflow handles both `preview` and `production` via the dropdown
- `vercel pull` fetches env vars from the Vercel project so secrets don't need to be duplicated
- `vercel build --prod` / `vercel deploy --prebuilt --prod` targets production; without `--prod` it targets preview

```
workflow_dispatch
    └─ choose environment (preview | production)
          └─ vercel pull   ← syncs .vercel/output + env vars
          └─ vercel build  ← Next.js build inside Vercel's build system
          └─ vercel deploy ← uploads prebuilt output, returns URL
```

---

## Troubleshooting

**`Error: No project found`**
→ `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID` is wrong. Re-check `apps/web/.vercel/project.json`.

**`Error: The `build.env` object...` / missing env vars during build**
→ The variable isn't added in Vercel dashboard for the Preview environment. Add it there, not just in GitHub secrets.

**Build succeeds but app crashes (500) on preview URL**
→ A runtime env var is missing. Check Vercel → **Deployments** → the failing deploy → **Build Logs** / **Runtime Logs**.

**`pnpm: command not found` in CI**
→ The workflow uses `pnpm/action-setup@v4` which handles this. If you're running `vercel` commands locally, use `npx vercel` or install globally with `npm i -g vercel`.
