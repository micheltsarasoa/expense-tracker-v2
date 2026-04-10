# ADR-001 — Replace NextAuth with Neon Auth

**Date:** 2026-04-10  
**Status:** Accepted

## Context

v1 used NextAuth.js v4 with a credentials provider (email + password) and JWT stored in an HTTP-only cookie. This works for the web app but is incompatible with Expo: React Native cannot share HTTP-only cookies, so the mobile app would need a completely separate auth implementation.

## Decision

Replace NextAuth with **Neon Auth** for both platforms.

- Web: Neon Auth SDK for Next.js — JWT still delivered as an HTTP-only cookie
- Mobile: Neon Auth SDK for Expo — JWT stored in `SecureStore`, sent as `Authorization: Bearer`
- Password hashing is delegated to Neon Auth (no manual bcrypt / argon2)
- Route protection moves from `middleware.ts` (NextAuth convention) to `proxy.ts` (Next.js 16 convention), validating the Neon Auth JWT

## Consequences

**Positive**
- Single auth provider for web and mobile — one token format, one validation path
- No manual password hashing code to maintain
- Native edge compatibility (Neon Auth validates at the edge)

**Negative**
- Dependency on Neon's Auth service — if Neon Auth changes its API, migration is required
- Less community documentation than NextAuth at time of adoption

## Rejected alternatives

- **NextAuth + custom mobile token endpoint**: two auth implementations — complexity doubles
- **Auth.js v5**: still web-centric; mobile story is unclear
