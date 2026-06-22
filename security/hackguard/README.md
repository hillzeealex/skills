# HackGuard ⚡

> Professional website security auditing skill for Claude Code.  
> Built by [mysiteishackable.com](https://mysiteishackable.com)

[![Install in Claude](https://img.shields.io/badge/Claude_Code-Install_Skill-00ff41?style=flat&logo=anthropic&logoColor=black)](https://github.com/yourname/hackguard-skill/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What is HackGuard?

HackGuard is a Claude Code skill that turns Claude into a full security auditor.  
Just type `audit https://yourdomain.com` and get a complete security report in seconds.

**Free tier** → [mysiteishackable.com](https://mysiteishackable.com) — paste a URL, get a quick scan in your browser.  
**HackGuard skill** → install once in Claude Code, get deep audits from your terminal anytime.

---

## What it checks

| Category | Checks |
|----------|--------|
| 🔒 HTTP Headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, version leaks |
| 🔐 TLS / SSL | HTTPS availability, HTTP redirect, cert expiry, TLS version (1.0/1.1/1.2/1.3) |
| 🌐 DNS | A, AAAA, MX, NS, TXT records, CDN/WAF detection |
| 📧 Email Security | SPF, DMARC, DKIM selectors, MTA-STS |
| ⚠️ Misconfigurations | Exposed .git, .env, phpMyAdmin, admin panels, backup files, directory listing, 20+ paths |
| 🔍 Fingerprinting | Server/framework version exposure, X-Powered-By |
| 🌍 Subdomains | dev, staging, api, admin — flags publicly exposed pre-prod environments |
| 🔌 Open Ports | Common web ports via nmap (if available) |

---

## Install

### 1. Download the skill

Download `hackguard.skill` from the [latest release](https://github.com/yourname/hackguard-skill/releases/latest).

### 2. Install in Claude Code

```bash
claude skill install hackguard.skill
```

Or drag and drop `hackguard.skill` into your Claude Project settings.

### 3. Use it

```
audit https://yourdomain.com
```

```
check security headers for api.mycompany.com
```

```
scan my website mystore.com
```

---

## Example Output

```
╔══════════════════════════════════════════════════╗
║           HACKGUARD SECURITY REPORT              ║
║              mysiteishackable.com                ║
╚══════════════════════════════════════════════════╝

Target  : example.com
Scanned : 2024-01-15 14:32:11 UTC

┌─────────────────────────────────────────────────┐
│  SCORE: 67/100          GRADE: C                │
└─────────────────────────────────────────────────┘

// HTTP HEADERS
✓ PASS   X-Content-Type-Options    nosniff
✗ FAIL   Content-Security-Policy   missing        [-10]
⚠ WARN   Strict-Transport-Security max-age too low [-5]

// TLS/SSL
✓ PASS   HTTPS Available
✗ FAIL   Certificate Expiry        expires in 12 days [-8]

// EMAIL SECURITY
✓ PASS   SPF Record                v=spf1 present
✗ FAIL   DMARC Record              missing        [-8]

// MISCONFIGURATIONS
✗ FAIL   /.git/HEAD                EXPOSED        [-20]

═══════════════════════════════════════════════
CRITICAL FIXES:
  1. 🚨 /.git/HEAD is exposed — take down immediately
  2. Renew TLS certificate (12 days left!)
  3. Add DMARC record
  4. Add Content-Security-Policy header
═══════════════════════════════════════════════
```

---

## Ethics & Safety

HackGuard performs **non-intrusive, read-only passive checks only**.

- No exploitation attempts
- No fuzzing or brute-forcing  
- No crawling beyond the root domain
- Identifies itself via `User-Agent: HackGuard-Scanner/1.0`

**Only scan domains you own or have explicit permission to test.**

---

## Requirements

- Claude Code (any version)
- `curl`, `dig`, `openssl` — available by default on macOS/Linux
- `nmap` — optional, for port scanning

---

## License

MIT — free to use, modify, and distribute.  
Built with ❤️ by [mysiteishackable.com](https://mysiteishackable.com)
