# HackGuard — Scoring Reference

Start at **100**. Deduct points for each FAIL or WARN finding.
Floor at **0** — score never goes negative.

---

## Deduction Table

### HTTP Headers

| Check | FAIL | WARN |
|-------|------|------|
| Content-Security-Policy missing | -10 | -5 (weak policy) |
| Strict-Transport-Security missing | -10 | -5 (max-age too low) |
| X-Frame-Options missing | -5 | — |
| X-Content-Type-Options missing | -5 | — |
| Referrer-Policy missing | -3 | — |
| Permissions-Policy missing | -3 | — |
| Server header leaks version | — | -3 |
| X-Powered-By present | -5 | — |
| X-XSS-Protection set (deprecated) | — | -2 |

### TLS / SSL

| Check | FAIL | WARN |
|-------|------|------|
| HTTPS not available | -30 | — |
| No HTTP→HTTPS redirect | -10 | — |
| Certificate expired | -20 | — |
| Certificate expires < 15 days | — | -8 |
| TLS 1.0 accepted | -10 | — |
| TLS 1.1 accepted | — | -5 |
| Self-signed certificate | — | -8 |

### DNS / Infrastructure

| Check | FAIL | WARN |
|-------|------|------|
| No A record | -10 | — |
| No MX record (if email used) | — | -3 |

### Email Security

| Check | FAIL | WARN |
|-------|------|------|
| SPF missing | -8 | -3 (too permissive +all) |
| DMARC missing | -8 | -3 (p=none, no enforcement) |
| DKIM no selectors found | — | -3 |

### Misconfigurations

| Check | FAIL | WARN |
|-------|------|------|
| /.git/HEAD exposed | -20 | — |
| /.git/config exposed | -20 | — |
| /.env exposed | -20 | — |
| /.env.local / .env.production | -15 | — |
| /phpmyadmin/ exposed | -15 | — |
| backup files exposed (.zip, .sql) | -12 | — |
| /server-status exposed | — | -5 |
| /.DS_Store exposed | — | -3 |
| /wp-admin/ exposed | — | -5 |
| /admin/ exposed | — | -5 |
| Directory listing enabled | -8 | — |
| /.well-known/security.txt missing | — | -2 |

### Technology Fingerprint

| Check | FAIL | WARN |
|-------|------|------|
| PHP version exposed (old) | -5 | — |
| Server version exposed | — | -3 |
| X-Powered-By any value | -5 | — |

### Subdomains

| Check | FAIL | WARN |
|-------|------|------|
| dev/staging/test resolves publicly | — | -5 |

---

## Grade Thresholds

| Grade | Score Range | Meaning |
|-------|-------------|---------|
| A+    | 95 – 100 | Excellent — hardened |
| A     | 85 – 94  | Good — minor improvements |
| B     | 70 – 84  | Decent — some gaps |
| C     | 55 – 69  | Needs work |
| D     | 40 – 54  | Significant exposure |
| F     | 0 – 39   | Critical issues present |

---

## Severity Tiers for Report Ordering

Always list findings in this order (most critical first):

1. **CRITICAL** — exposed .git, .env, phpmyadmin, no HTTPS
2. **HIGH** — missing CSP, DMARC, cert expiring, backup files
3. **MEDIUM** — missing HSTS, SPF issues, admin panels
4. **LOW** — missing Referrer-Policy, version leaks
5. **INFO** — CDN detected, subdomains found, security.txt
