---
name: security-baseline
description: Use when starting or hardening a Node/TypeScript backend that stores personal data, to set up field-level PII encryption at rest, tenant-scoping against IDOR, upload validation, log redaction, and CORS/error fail-closed. Triggers include secure my backend, encrypt PII at rest, add security baseline, GDPR/nLPD data protection, harden this API.
---

# Security Baseline

Drop a proven security baseline into a backend that holds personal data: **field-level PII encryption at rest**, plus the hardening patterns that close the bugs an audit always finds. Battle-tested on a Swiss nLPD/RGPD compliance product.

## When to use
- New backend that will store PII (names, emails, phones, addresses, IPs)
- Hardening an existing API before a release, audit, or investor due-diligence
- After a security review surfaced IDOR / upload / logging / encryption gaps

Stack assumption: Node/TypeScript + an ORM with a repository layer (Drizzle/Prisma/Knex). Adapt the seam to your data-access layer.

## 1. PII encryption at rest (the core)

Copy the three self-contained modules from `templates/` (only `node:crypto` + two env vars, no framework deps):

| Module | Role |
|---|---|
| `field-encryption.ts` | AES-256-GCM, random IV per value, auth tag (tamper detection), **versioned format** `v1:iv:tag:ct` for key rotation. Env `PII_ENCRYPTION_KEY` (32 bytes b64), fail-closed. |
| `blind-index.ts` | HMAC-SHA256(normalized value, pepper) - deterministic, indexable lookup (e.g. email login) without storing plaintext. Env `PII_BLIND_INDEX_PEPPER`. |
| `pii-field.ts` | Seam helpers `encryptField`/`decryptField` + `encodeFields`/`decodeFields`: null-safe, **idempotent**, **tolerant of legacy plaintext** (so you deploy code before migrating data). |

Their `*.test.ts` come with them - keep them, they lock the crypto correctness.

**Wiring (the seam):** encrypt on write, decrypt on read, at the **repository** layer - business code only ever sees plaintext. Per repo:
```ts
const PII = ['first_name', 'last_name', 'phone'] as const;
const decode = (row) => decodeFields(row, PII);
// reads:  return rows.map(decode)        writes:  .values(encodeFields(input, PII))
```
Encrypt **in place** (column stays `text`, no schema migration). Searchable fields (login email) need the blind index + a query rewrite - see `hardening-patterns.md`.

**Deploy order is strict:** ship code (with keys set) → THEN backfill existing rows. Never the reverse (the running app must be able to decrypt before data becomes ciphertext). Write an idempotent backfill that skips `v1:` values.

## 2. Hardening patterns

The recurring high-severity bugs and their fixes - see [hardening-patterns.md](hardening-patterns.md): tenant-scoping (cross-tenant IDOR), upload validation (stored-XSS / magic-bytes), log redaction (session cookies), CORS fail-closed, error-message gating, rate-limit/quota on expensive endpoints.

## 3. Verify

After applying, run a white-box audit to confirm coverage. Use the **hackguard** skill (Mode B) on the codebase - it hunts IDOR, injection, SSRF, upload, secrets, and produces a severity report. The baseline should turn its findings green.

## Ops checklist (fail-closed)
- [ ] Generate keys once: `openssl rand -base64 32` ×2 → `PII_ENCRYPTION_KEY`, `PII_BLIND_INDEX_PEPPER`.
- [ ] Store them outside DB backups (loss = unrecoverable data).
- [ ] App refuses to start without them (don't silently store plaintext).
- [ ] Backfill once, post-deploy, with the **same** key. Re-run → 0 rows = done.

## Common mistakes
- Backfilling before deploying the decrypt-capable code → app reads ciphertext it can't decode.
- Encrypting a searchable column (login email) without a blind index → lookups break.
- Trusting the client `Content-Type` on uploads, or serving user files inline same-origin → stored XSS.
- Tenant check at the route (role) but not in the repo query (`WHERE id = ?` with no org scope) → IDOR.
