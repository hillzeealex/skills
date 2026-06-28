# Hardening patterns

The recurring high-severity findings on a Node/TS + ORM backend, and the fix that closes each. Apply at the layer noted — most live at the repository or middleware seam, not the route.

## 1. Tenant-scoping (cross-tenant IDOR) — repository layer
A route is authenticated and role-checked, but the repo query fetches/mutates by `id` with no tenant predicate → any user reaches another tenant's object by UUID.
```ts
// VULNERABLE                                  // FIXED
.where(eq(table.id, id))                       .where(and(eq(table.id, id), eq(table.organization_id, orgId)))
```
Rule: every by-id read/update/delete of a tenant-owned row ANDs the caller's `organization_id` (or `user_id`). Pass it from `req.auth`. Return 404 when nothing matched. Audit *all* repos — the bug hides in delete/update mutators that look trivial.

## 2. Mass assignment — validation layer
`update` route spreads `req.body` into the DB → client smuggles `role`, `org_id`, `subscription_tier`. Fix: strict allowlist schema (Zod `.object()` that omits sensitive columns); never spread raw body.

## 3. File upload (stored XSS / malware) — service + serving layer
Trusting the client `Content-Type`, no allowlist, serving user files inline same-origin = stored XSS (HTML/SVG with `<script>` runs in your origin with the victim's session).
- **Validate by magic-bytes**, never the client MIME. Allowlist (pdf, png/jpeg/gif/webp, office, text). Reject `text/html`, `image/svg+xml`, executables.
- **Serve safely**: `X-Content-Type-Options: nosniff` always; `Content-Disposition: attachment` for anything not in a strict inline-safe set (raster images + pdf).
- **Sanitize the storage key** from the filename (basename + strip `/` `..`) → no path traversal.
- Don't let a client header (e.g. a quota-exempt tag) bypass quotas; gate exemptions server-side.

## 4. Log redaction — logger config
Default HTTP loggers serialize `req.headers`, leaking the **session cookie** and `Authorization` into logs → anyone with log access hijacks sessions.
```ts
pinoHttp({ redact: { paths: ['req.headers.cookie','req.headers.authorization','res.headers["set-cookie"]'], remove: true } })
```
Also: never log PII (email/phone) or full request bodies; log a stable id instead.

## 5. CORS fail-closed — app setup
Deriving CORS/trusted-origins from an env var that, when empty, silently disables the check = fail-open. Throw at boot in production if the allowlist is empty. Never pair a permissive/reflected origin with `credentials: true`.

## 6. Error-message gating — error handler
Returning `err.message` verbatim on 500 leaks driver/ORM internals (table/constraint names, bucket paths). In production, 500s return a generic message; full detail goes only to logs + error tracker. 4xx app-errors keep their (safe) message.

## 7. Rate-limit / quota on expensive endpoints — middleware / route
Unauthenticated write endpoints (anonymous forms, consent) and paid-LLM endpoints with no cap → DoS / cost abuse. Add proxy `limit_req` (nginx) AND an app-level limiter (the proxy config can drift), plus per-tenant monthly quotas on AI/generation routes.

## 8. Password hashing — auth config
Use the auth lib's modern default (scrypt/argon2), min length ≥ 12, and a breached-password denylist (HIBP k-anonymity). Don't claim "bcrypt" if the lib actually uses scrypt — auditors check.

## Verification
Run the **hackguard** skill (Mode B, white-box) after applying — it adversarially hunts these classes and reports severity. Every pattern above should come back clean or as an accepted residual.
