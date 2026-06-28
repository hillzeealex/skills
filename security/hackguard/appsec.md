# HackGuard - Application Security (white-box + dynamic) reference

Deep methodology for auditing an app you have **source access** to, and for
**non-destructive dynamic testing** against a local/staging instance. This goes
beyond the passive external scan (headers/TLS/DNS) - it hunts exploitable
application bugs.

## Guardrails (read first - non-negotiable)

- **Own-asset only.** Source audit and dynamic tests run only on code/instances
  the user owns or is explicitly authorized to test.
- **Dynamic = local/staging only.** Never run active probes against production or
  any instance serving real user data. Spin up a local instance (the project's
  `docker-compose.local` + dev servers) or use a dedicated staging.
- **Non-destructive.** No DoS, no mass data mutation, no deleting real records, no
  detection evasion. Use throwaway test accounts. Mutations limited to data you
  created for the test.
- **Stop-and-ask** before any step that would touch real data, send real emails,
  charge a card, or hit a third-party API in a way that costs money or leaves a
  trace.
- Report findings to **fix** them, not to weaponize. Every finding ships with a
  remediation.

## Severity model

Rate each finding by impact × exploitability, not by check category:

| Severity | Meaning |
|---|---|
| 🔴 Critical | Unauth RCE, auth bypass, cross-tenant data read/write, secret leak granting prod access |
| 🟠 High | Authenticated IDOR on sensitive data, stored XSS, SSRF to internal, broken access control on money/PII |
| 🟡 Medium | Reflected XSS, missing authz on low-sensitivity action, weak crypto, verbose error leak |
| 🔵 Low | Info disclosure, missing hardening header, rate-limit gap on non-critical endpoint |

For each finding report: **title · severity · file:line (or request) · how it's exploitable · proof/repro · fix**.

---

## Mode B - White-box code audit

Walk the source by vuln class. For each class: where to look, what's wrong, how to confirm. Tailored to a TypeScript / Express / ORM / cookie-auth / S3 / Stripe stack; adapt paths to the actual repo layout (`grep`/read to locate the real files).

### 1. Broken access control / IDOR / cross-tenant (highest yield)
- Read the auth middleware (e.g. `withAuth('org' | 'org-admin')`). For **every**
  route, confirm the requirement matches the sensitivity.
- The real bug is usually one layer down: a route is authenticated, but the
  **repository query fetches by `id` without scoping to the caller's org/user**.
  Grep repositories for `where(eq(table.id, ...))` and check an org/user predicate
  is ANDed in. Object owned by org A readable with an org B session = 🔴/🟠.
- Check role checks aren't UI-only: server must enforce, not just hide buttons.
- Mass-assignment: does an update route spread `req.body` into the DB? Are Zod
  schemas `.strict()` so extra keys (e.g. `role`, `org_id`, `subscription_tier`)
  can't be smuggled in?

### 2. Injection
- SQL: ORMs parametrize, but **raw fragments** (`sql\`...\``, string-built queries,
  `LIKE` with user input) can inject. Grep for raw query construction and template
  interpolation into queries.
- Command/path: any `exec`/`spawn`/`fs` path built from user input.
- The object-storage key: is the S3 object key derived from a user-supplied
  filename without sanitizing `../` / absolute paths? (path traversal in keys)

### 3. Authentication & session
- Read the auth config: session cookie flags (`httpOnly`, `secure`, `sameSite`),
  session lifetime, rotation on privilege change, logout invalidation.
- Password reset & email verification: are tokens random (CSPRNG), single-use,
  expiring, and bound to the user? Can verification be skipped to reach
  authenticated routes?
- 2FA: is it actually enforced when enabled, server-side, on every sensitive path?
- Account enumeration: do login / reset / signup responses differ for
  existing vs non-existing emails (timing or body)?

### 4. SSRF & outbound fetch
- Any server-side `fetch`/HTTP client whose URL is influenced by user input
  (webhooks, "fetch from URL", document import, avatar-by-URL, legal-corpus
  resolvers hitting external SPARQL/ELI). Can it be pointed at `169.254.169.254`,
  `localhost`, internal services? Is there an allowlist?

### 5. Secrets & data exposure
- Client bundle: confirm only intentionally-public vars (e.g. `VITE_*` /
  publishable keys) reach the frontend. Grep the built `dist/` for secret-looking
  strings.
- Hardcoded keys/passwords in source or committed env files; secrets in Docker
  image layers.
- Logging: are PII / tokens / passwords written to logs or error responses?
- **Data at rest**: are sensitive PII columns encrypted, or would a DB dump expose
  them in clear? (Common real gap.)

### 6. File upload
- Upload endpoint: content-type/extension allowlist, size cap, magic-byte check,
  rejection of executable/SVG-with-script, randomized stored names, no path
  traversal, served with `Content-Disposition: attachment` + correct type.

### 7. Payment webhooks (Stripe etc.)
- Signature verified against the **raw** body (before JSON parsing)? Replay/
  idempotency handled? Does a forged webhook flip subscription state or grant
  entitlements? Is the entitlement re-checked server-side, not trusted from client?

### 8. Business-logic / authorization on money & compliance flows
- Paywall/subscription gating enforced server-side on every gated action (not just
  hidden in UI)? Defense-in-depth on the actual mutating endpoints?
- Account deletion / data-export / DSAR endpoints: properly authn+authz, can't be
  triggered for another user, token links HMAC'd and expiring.

### 9. CORS & headers
- `CORS_ORIGINS` allowlist explicit (no `*` with credentials). Reflect-origin bugs.
- CSP / HSTS / frame options present on app responses (cross-check Mode A).

### 10. Dependencies
- Run the ecosystem auditor (e.g. `npm audit --omit=dev`) and triage High/Critical
  with a reachable path.

### 11. Error handling / info leak
- Stack traces, ORM errors, internal paths returned to the client on 500s?
  Generic error in prod, detail in logs only?

**Method:** prefer parallel read-only explore agents, one per vuln class, each
returning findings with file:line. Then dedupe and severity-rank. Confirm each
suspected bug by reading the actual code path end to end - no vibes, show the line.

---

## Mode C - Dynamic local/staging pentest (non-destructive)

Only after confirming the target is a **local or staging** instance the user owns.

### Setup
1. Launch the app locally (project's local compose + dev servers). Confirm it's
   `localhost`/staging, not prod.
2. Create **two** test organizations each with their own test user (for
   cross-tenant tests), plus one of each role if RBAC exists.

### Probes (all non-destructive)
- **Unauth access:** hit authenticated `/api/*` routes with no session/cookie →
  must 401/403, never leak data.
- **Cross-tenant IDOR:** with org A's session, request org B's objects by id
  (audits, documents, members, invoices). Any success = 🔴/🟠. This is the
  single highest-value dynamic test.
- **Role matrix:** for each role, attempt each privileged action; build a
  pass/fail matrix. Reader performing admin mutations = finding.
- **Input validation:** malformed/oversized JSON, wrong types, missing required,
  extra fields (mass-assignment), classic injection marker strings in inputs -
  observe handling (proper 400 vs 500/leak). Keep payloads benign.
- **File upload:** try disallowed types, oversized, `../` in filename, a
  script-bearing SVG - with harmless test files.
- **Auth flows:** reuse a reset token twice, use an expired/forged token, skip
  email verification, check logout truly invalidates the session, check cookie
  flags on the wire.
- **Rate limiting:** light burst on login/reset to confirm limits fire (a handful
  of requests - never a flood).
- **Headers/TLS** on the local instance (reuse Mode A modules).

Capture each as request → observed response → verdict. Never escalate to volume
attacks or destructive payloads.

---

## Reporting (extends the HackGuard report)

Add an application-security section below the external scan, grouped by severity,
most dangerous first:

```
// APPLICATION SECURITY (white-box + dynamic) ──────────
🔴 CRITICAL  Cross-tenant IDOR on documents
   where : GET /api/documents/:id - document-repo.ts:N (no org scoping)
   repro : org-B session reads org-A document id → 200 + body
   fix   : add AND organization_id = session.orgId to the query

🟠 HIGH      PII stored in clear (no column encryption)
   where : schema/profiles.ts - phone: text(); no crypto module
   impact: a DB/S3 dump exposes all client PII
   fix   : envelope-encrypt sensitive columns; blind-index searchable fields

🟡 MEDIUM ...
🔵 LOW ...
```

End with a prioritized fix list (Critical → Low) and what was tested but found
clean (so the report shows coverage, not just hits).

---

## HTML report (for Mode B / C - rendered, like a pentest deliverable)

After the terminal report, also produce a **self-contained HTML report** and open
it - the shareable artifact a client/CTO actually reads.

**Where:** write to the OS temp dir, never the repo. Resolve `$TMPDIR` (fallback
`/tmp`, or `%TEMP%` on Windows) and write `<tmpdir>/hackguard-report-<timestamp>.html`
(fresh file per run). Open it: `open` on macOS, `xdg-open` on Linux, `start` on
Windows. Tell the user the absolute path.

**Build:** single self-contained HTML file. Be visual and editorial, not a wall of text.

**Design system - match mysiteishackable.com (hacker/terminal DA):**
- Background pure black `#000`; surface `#0a0a0a`; borders `#1a1a1a` / `#222`.
- **Sharp corners everywhere** (`border-radius:0`), monospace only:
  `Share Tech Mono` for headers/display, `IBM Plex Mono` for body (Google Fonts).
- Accent neon green `#00ff41` (links, prompts `>`, `_` blink, "PASS" markers).
- Severity colors: Critical `#ff3333`, High `#ff8800`, Medium `#ffcc00`, Low `#00aaff`.
- High-contrast text: primary `#e8e8e8` on black; secondary `#888`; never low-contrast
  greys on dark (the common mistake - keep findings readable).
- Terminal touches: faint scanline background, `//` and `>` label prefixes, `[PASS]`
  tags, a blinking cursor. Left accent border per severity on each finding card.
- Stat cards (counts per severity) with a colored top border matching the severity.

**Structure:**
1. **Header banner** - target, mode (white-box / dynamic / both), timestamp,
   instance tested (local/staging label so prod is never implied).
2. **Risk summary** - big counts per severity (Critical/High/Medium/Low) as
   colored stat cards, plus a one-line overall verdict.
3. **Finding cards**, grouped by severity, most dangerous first. Each card:
   - severity badge (🔴/🟠/🟡/🔵 with matching color), title
   - **Location** (`file:line` or the HTTP request)
   - **Exploitability** - how an attacker reaches it, in plain language
   - **Proof / repro** - the code excerpt or the request→response, in a `<pre>`
   - **Fix** - concrete remediation
   - optional **before/after** code snippet (vulnerable vs patched), side by side
4. **Coverage section** - vuln classes tested and found clean, so the report shows
   breadth, not just hits.
5. **Top priority** - the one finding to fix first and why.

**Style guidance:** dark header, severity colors consistent with the model
(🔴 red, 🟠 orange, 🟡 amber, 🔵 blue), monospace for code/requests, generous
whitespace. Mirror the polish of the `improve-codebase-architecture` HTML report.
Escape any user/code content placed into the HTML so a payload string can't break
the page or inject script.
