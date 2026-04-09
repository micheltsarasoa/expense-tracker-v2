# Feature Spec — Authentication

## Overview

Email + password authentication. Protects all dashboard routes. In v2, replaced by Neon Auth for cross-platform (web + mobile) support.

## Data Model

```
users
  id            uuid PK
  email         text unique
  passwordHash  text   (bcrypt, 12 rounds)
  name          text
  createdAt     timestamp
  updatedAt     timestamp
```

Session data is never stored in the DB — JWT only (HTTP-only cookie).

## Business Rules

**Registration**
- Email must be unique
- Password requirements: min 8 chars, at least one uppercase, one lowercase, one number, one special character
- Strength scoring: weak / fair / good / strong — shown in UI, but "weak" is not blocked
- Password is hashed with bcrypt (12 rounds) before storage
- `user_settings` row is created with defaults on successful registration

**Login**
- Credentials matched against `passwordHash` via bcrypt compare
- On success: JWT issued, stored in HTTP-only cookie, expires in 24h
- On failure: generic error ("Invalid email or password") — no leak of which field is wrong

**Session**
- JWT strategy — no server-side session store
- Token auto-refreshed on each request within the 24h window
- Logout: clears the cookie client-side

**Rate limiting**
- Login: 10 attempts / 15 min per email
- Register: 5 attempts / 15 min per IP

## Operations

| Operation | Endpoint | Auth required |
|---|---|---|
| Register | `POST /api/v1/auth/register` | No |
| Login | `POST /api/v1/auth/login` | No |
| Logout | `POST /api/v1/auth/logout` | Yes |
| Get session | `GET /api/v1/auth/session` | Yes |

## Route Protection

Middleware (`apps/web/middleware.ts`) runs on every request to `/(dashboard)/*`.  
Redirects unauthenticated users to `/login`.  
Public routes: `/login`, `/register`, `/api/auth/*`, `/api/v1/auth/register`.

## UI Pages

| Route | Purpose |
|---|---|
| `/login` | Email + password form |
| `/register` | Email + name + password + confirm password form |

### Login page
Fields:
- **Email** — text, required
- **Password** — text (masked), required

Error states:
- Invalid credentials → inline error below the form: "Invalid email or password"
- Rate limit exceeded → "Too many attempts. Try again in X minutes."
- Network failure → toast: "Something went wrong. Please try again."

Actions: Submit / link to Register

### Register page
Fields:
- **Name** — text, required
- **Email** — text, required
- **Password** — text (masked), required; strength indicator shown live
- **Confirm password** — must match

Error states:
- Email already in use → inline: "An account with this email already exists."
- Password mismatch → inline on confirm field
- Weak password → inline hint (not blocking)
- Network failure → toast

Actions: Submit / link to Login

## v2 — Migration to Neon Auth

**Why:** NextAuth credentials provider is web-only. Expo cannot share the JWT cookie — a token-based flow with mobile SDK support is needed.

**What changes:**
- Remove NextAuth config and `[...nextauth]` route
- Replace with Neon Auth SDK (handles token issuance, refresh, session)
- Same email + password flow from the user's perspective
- Mobile app uses Neon Auth SDK directly (no cookie — Bearer token in headers)
- `users` table structure stays the same; password hashing delegated to Neon Auth

**What stays the same:**
- Route protection middleware (updated to validate Neon Auth tokens)
- Same `/login` and `/register` UI pages
- Same business rules (rate limiting, password strength)
