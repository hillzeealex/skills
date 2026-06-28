---
name: hackguard
description: >
  HackGuard is a professional website security auditing skill for Claude Code.
  Use this skill whenever the user wants to audit, scan, check, or test the security
  of a URL, domain, or website. Triggers include: "audit this site", "check security
  for", "scan my website", "is this domain secure", "run a security check on",
  "check headers for", "test my site security", "pentest", "vulnerability scan",
  or any mention of checking HTTPS, DNS, headers, misconfigs, TLS, SPF, DMARC,
  or exposed files on a domain. Always use this skill - even for quick one-liner
  requests like "check headers for example.com". This skill powers the HackGuard
  auditor from mysiteishackable.com.
  ALSO use it for application-level security on a codebase the user owns: "find
  vulnerabilities in my app", "audit my code for security", "try to hack my
  platform", "pentest my app", "check for IDOR / SQL injection / SSRF / broken
  access control", "is my app secure".
---

# HackGuard - Website Security Auditor

A professional, non-intrusive security auditing skill. Runs passive read-only
checks against any domain and produces a structured report with score, grade,
and remediation guidance.

**⚠ Ethics rule**: Only scan/test assets the user owns or has explicit permission
to test. Always confirm this before running. **Active (dynamic) testing runs only
against a local or staging instance - never against production or any system
serving real user data.** No DoS, no destructive mutations, no detection evasion.

---

## Modes

Pick the mode from what the user asked for. Modes combine.

| Mode | Use when | Where |
|---|---|---|
| **A - External passive scan** | "audit/scan this site", "check headers", a bare domain/URL | This file (Workflow below) |
| **B - White-box code audit** | "find vulnerabilities in my app", "audit my code", source access available | → `appsec.md` (Mode B) |
| **C - Dynamic pentest** | "try to hack my app", "pentest it", active probing | → `appsec.md` (Mode C) - **local/staging only** |

- Bare domain / external posture → **Mode A**, follow the Workflow below.
- "Find vulnerabilities / hack my app" with a repo present → **Modes B + C**:
  read `appsec.md` first (guardrails, vuln classes, dynamic probes, severity model,
  and the **rendered HTML report**), then execute. Confirm the dynamic target is
  local/staging before any active probe.
- All modes end with the report (terminal + HTML for B/C).

---

## Workflow (Mode A - external passive scan)

1. Parse and normalize the target URL → extract hostname
2. Confirm with user if domain looks unusual or sensitive
3. Run all check modules in parallel (see below)
4. Compute score + grade
5. Output the full HackGuard report

---

## Step 1 - Parse Target

Extract the clean hostname from whatever the user provides:
- `https://example.com/path?q=1` → `example.com`
- `example.com` → `example.com`
- `sub.example.com` → `sub.example.com`

Store as `$TARGET` for all subsequent commands.

---

## Step 2 - Run All Checks

Run these bash commands. Collect stdout + exit codes. Continue even if individual
checks fail (use `|| true`).

Read the full check references before running:
- → `/src/references/checks.md` for all commands + what to look for
- → `/src/references/scoring.md` for scoring weights

### Check Modules

**A. HTTP Headers** - fetch live headers, analyze security posture
**B. TLS/SSL** - certificate validity, HTTPS redirect, HSTS
**C. DNS Records** - A, MX, TXT, NS, CNAME resolution
**D. Email Security** - SPF, DMARC, DKIM hints
**E. Misconfigurations** - exposed files, admin panels, directory listing
**F. Technology Fingerprint** - server/framework exposure
**G. Subdomain Hints** - common subdomains (www, mail, admin, api, dev, staging)
**H. Open Ports** (if nmap available) - common web ports

---

## Step 3 - Score & Grade

Read `/src/references/scoring.md` for weights.

- Start at **100**
- Deduct per fail/warn per check
- Floor at **0**

| Grade | Score |
|-------|-------|
| A+    | 95–100 |
| A     | 85–94  |
| B     | 70–84  |
| C     | 55–69  |
| D     | 40–54  |
| F     | 0–39   |

---

## Step 4 - Output Report

Use this exact report format:

```
╔══════════════════════════════════════════════════╗
║           HACKGUARD SECURITY REPORT              ║
║              mysiteishackable.com                ║
╚══════════════════════════════════════════════════╝

Target  : example.com
Scanned : 2024-01-15 14:32:11 UTC
Duration: 8.3s

┌─────────────────────────────────────────────────┐
│  SCORE: 67/100          GRADE: C                │
└─────────────────────────────────────────────────┘

// HTTP HEADERS ──────────────────────────────────
✓ PASS   X-Content-Type-Options    nosniff
✓ PASS   X-Frame-Options           SAMEORIGIN
✗ FAIL   Content-Security-Policy   missing         [-10]
⚠ WARN   Strict-Transport-Security max-age too low  [-5]
✗ FAIL   Permissions-Policy        missing          [-5]
ℹ INFO   Server                    nginx (no version leak)

// TLS/SSL ────────────────────────────────────────
✓ PASS   HTTPS Available           yes
✓ PASS   HTTP→HTTPS Redirect       301 redirect OK
✗ FAIL   Certificate Expiry        expires in 12 days  [-8]
✓ PASS   TLS Version               TLS 1.3

// DNS ─────────────────────────────────────────────
✓ PASS   A Record                  104.21.x.x (Cloudflare)
✓ PASS   MX Records                present (3 records)
ℹ INFO   CDN/WAF                   Cloudflare detected

// EMAIL SECURITY ──────────────────────────────────
✓ PASS   SPF Record                v=spf1 present
✗ FAIL   DMARC Record              missing          [-8]
⚠ WARN   DKIM                      no common selectors found [-3]

// MISCONFIGURATIONS ───────────────────────────────
✓ PASS   /.git/HEAD                not exposed
✓ PASS   /.env                     not exposed
⚠ WARN   /admin                    returns 200      [-5]
✓ PASS   Directory Listing         disabled
ℹ INFO   /robots.txt               present
✗ FAIL   security.txt              missing (/.well-known/security.txt) [-2]

// TECHNOLOGY ──────────────────────────────────────
⚠ WARN   X-Powered-By              exposed: Express  [-5]
✓ PASS   Server Header             no version leak

// SUBDOMAINS ──────────────────────────────────────
ℹ INFO   api.example.com           resolves → worth auditing
ℹ INFO   staging.example.com       resolves → ensure not public-facing

═══════════════════════════════════════════════════
CRITICAL FIXES (do these first):
  1. Add Content-Security-Policy header
  2. Add DMARC record for _dmarc.example.com
  3. Renew TLS certificate (expires in 12 days!)

IMPROVEMENTS:
  4. Increase HSTS max-age to 31536000+
  5. Remove X-Powered-By header
  6. Review /admin exposure
  7. Add /.well-known/security.txt

PASSING:
  ✓ HTTPS + redirect working
  ✓ No exposed .git or .env
  ✓ Cloudflare WAF detected
  ✓ SPF email record present

Full remediation guide: mysiteishackable.com/docs
═══════════════════════════════════════════════════
```

Adapt the report to actual findings. Always show remediation for every FAIL/WARN.

---

## Error Handling

- If a command times out: mark as `ℹ INFO - could not reach (timeout)`
- If DNS doesn't resolve: abort early, report "domain does not resolve"
- If HTTPS entirely unavailable: mark TLS section as full FAIL, adjust score
- Never crash the full audit because one check failed
