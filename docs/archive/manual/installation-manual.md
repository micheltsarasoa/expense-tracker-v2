> **Outdated.** Archived in phase 0; it may contradict the code. Sources of truth: [docs/agents/README.md](../../agents/README.md).

# Installation & Configuration Manual

## Prerequisites

| Tool    | Version | Install                                              |
| ------- | ------- | ---------------------------------------------------- |
| Node.js | 20+     | [nodejs.org](https://nodejs.org) or `nvm install 20` |
| pnpm    | 9+      | `npm install -g pnpm@latest`                         |
| Git     | any     | system package manager                               |

---

## 1. Clone the Repository

```bash
git clone https://github.com/micheltsarasoa/expense-tracker-v2.git
cd expense-tracker-v2
```

---

## 2. Bootstrap the Monorepo

The repo ships with docs only — scaffold the workspace from scratch:

### 2.1 Root `package.json`

```bash
cat > package.json << 'EOF'
{
  "name": "expense-tracker",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5"
  },
  "packageManager": "pnpm@9.0.0"
}
EOF
```

### 2.2 `pnpm-workspace.yaml`

```bash
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF
```

### 2.3 `turbo.json`

```bash
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev":   { "cache": false, "persistent": true },
    "lint":  {},
    "typecheck": { "dependsOn": ["^build"] }
  }
}
EOF
```

### 2.4 Scaffold apps

```bash
mkdir -p apps packages

# Web app (Next.js 16, App Router, TypeScript, Tailwind, ESLint)
cd apps
npx create-next-app@latest web \
  --typescript --tailwind --eslint \
  --app --import-alias "@/*"

# Mobile app (Expo)
npx create-expo-app@latest mobile --template blank-typescript
cd ..
```

### 2.5 Scaffold shared packages

```bash
# packages/db
mkdir -p packages/db/src
cat > packages/db/package.json << 'EOF'
{
  "name": "@expense-tracker/db",
  "version": "0.0.1",
  "main": "./src/index.ts",
  "scripts": {
    "generate": "drizzle-kit generate",
    "migrate": "drizzle-kit migrate"
  }
}
EOF

# packages/types
mkdir -p packages/types/src
cat > packages/types/package.json << 'EOF'
{
  "name": "@expense-tracker/types",
  "version": "0.0.1",
  "main": "./src/index.ts"
}
EOF
```

---

## 3. Environment Variables

### Root `.env` (shared by all packages)

```env
# Neon PostgreSQL — copy from your Neon dashboard > Connection string
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

### `apps/web/.env.local`

```env
# Neon Auth — copy from Neon Auth dashboard > Project > API Keys
NEON_AUTH_SECRET="your-neon-auth-secret"

# Public base URL (used by mobile to call the API)
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

> **Neon Auth secret**: Go to [console.neon.tech](https://console.neon.tech) → your project → **Auth** tab → copy the secret key.

### `apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

---

## 4. Connect to the Neon Database

The database is already provisioned online. Pull the schema and run migrations:

```bash
# Install db package dependencies first
pnpm --filter db add drizzle-orm @neondatabase/serverless
pnpm --filter db add -D drizzle-kit

# After writing the schema in packages/db/src/schema.ts:
pnpm --filter db generate   # generates SQL migration files
pnpm --filter db migrate    # applies migrations to the live Neon DB
```

Add a `drizzle.config.ts` in `packages/db/`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## 5. Install Dependencies & Run

```bash
pnpm install
pnpm dev       # starts apps/web (port 3000) + apps/mobile (Expo)
```

To run only the web app:

```bash
pnpm --filter web dev
```

---

## 6. Auth — Neon Auth

Authentication is handled by **Neon Auth** (not NextAuth). Neon Auth provides:

- Email + password login/register
- JWT issuance and refresh
- Web: token stored in HTTP-only cookie
- Mobile: Bearer token stored in `SecureStore`

```bash
# Install in the web app
pnpm --filter web add @neondatabase/auth-nextjs

# Install in the mobile app
pnpm --filter mobile add @neondatabase/auth-expo
```

Route protection is done via Next.js proxy (`apps/web/proxy.ts`) validating the Neon Auth JWT on every `/(dashboard)/*` route.

---

## Environment Variables Reference

| Variable              | Location              | Purpose                              |
| --------------------- | --------------------- | ------------------------------------ |
| `DATABASE_URL`        | root `.env`           | Neon PostgreSQL connection string    |
| `NEON_AUTH_SECRET`    | `apps/web/.env.local` | Neon Auth JWT validation secret      |
| `NEXT_PUBLIC_API_URL` | `apps/web/.env.local` | Public base URL (consumed by mobile) |
| `EXPO_PUBLIC_API_URL` | `apps/mobile/.env`    | API base URL for Expo app            |
