# HackGuard - Check Commands Reference

All commands use `$TARGET` (clean hostname, e.g. `example.com`).
Set timeout to 5s on all curl calls. Use `|| true` to prevent early exit.

---

## A. HTTP Headers

```bash
# Fetch full response headers (follow redirects, max 3)
curl -sI --max-redirs 3 --connect-timeout 5 --max-time 8 \
  -A "HackGuard-Scanner/1.0 (mysiteishackable.com)" \
  "https://$TARGET" 2>/dev/null

# Also fetch HTTP (non-TLS) to check redirect
curl -sI --max-redirs 0 --connect-timeout 5 --max-time 5 \
  -A "HackGuard-Scanner/1.0 (mysiteishackable.com)" \
  "http://$TARGET" 2>/dev/null
```

**What to check in response headers:**

| Header | PASS condition | FAIL condition |
|--------|---------------|----------------|
| `Strict-Transport-Security` | present, max-age ≥ 31536000 | missing = FAIL, max-age < 31536000 = WARN |
| `Content-Security-Policy` | present (any value) | missing = FAIL |
| `X-Frame-Options` | DENY or SAMEORIGIN | missing = WARN |
| `X-Content-Type-Options` | nosniff | missing = WARN |
| `Referrer-Policy` | present | missing = WARN |
| `Permissions-Policy` | present | missing = WARN |
| `X-XSS-Protection` | absent or `0` | `1; mode=block` = WARN (deprecated) |
| `Server` | absent or no version | exposes version (e.g. `Apache/2.4.1`) = WARN |
| `X-Powered-By` | absent | any value = WARN (exposes stack) |
| `X-AspNet-Version` | absent | any value = WARN |

HTTP → HTTPS redirect: check if `http://` returns `301`/`302` to `https://`.

---

## B. TLS / SSL

```bash
# Check certificate details
echo | openssl s_client -connect "$TARGET:443" -servername "$TARGET" \
  -showcerts 2>/dev/null | openssl x509 -noout -dates -subject -issuer 2>/dev/null

# Check TLS version support
curl -sI --tls-max 1.1 --connect-timeout 5 "https://$TARGET" 2>/dev/null
# If this succeeds → TLS 1.1 or lower supported (WARN)

# Check cert expiry in days
echo | openssl s_client -connect "$TARGET:443" -servername "$TARGET" 2>/dev/null \
  | openssl x509 -noout -enddate 2>/dev/null
```

**What to check:**

| Check | PASS | WARN | FAIL |
|-------|------|------|------|
| HTTPS available | connects OK | - | connection refused/timeout |
| HTTP redirect | 301/302 to https | - | no redirect |
| Cert expiry | > 30 days | 15–30 days | < 15 days or expired |
| TLS version | TLS 1.2+ only | TLS 1.1 accepted | TLS 1.0 or SSL accepted |
| Cert issuer | trusted CA | self-signed = WARN | - |

---

## C. DNS Records

```bash
# A records
dig +short A "$TARGET" 2>/dev/null

# AAAA (IPv6)
dig +short AAAA "$TARGET" 2>/dev/null

# MX records
dig +short MX "$TARGET" 2>/dev/null

# NS records
dig +short NS "$TARGET" 2>/dev/null

# TXT records (SPF lives here)
dig +short TXT "$TARGET" 2>/dev/null

# CNAME
dig +short CNAME "$TARGET" 2>/dev/null
```

**CDN/WAF Detection from A record IPs or response headers:**

| Signal | Detected provider |
|--------|------------------|
| `cf-ray` header or Cloudflare IP range | Cloudflare |
| `x-served-by` header | Fastly |
| `x-cache` with `AkamaiGHost` | Akamai |
| `x-amz-cf-id` header | AWS CloudFront |
| `x-vercel-id` header | Vercel |

---

## D. Email Security

```bash
# SPF record (look for v=spf1 in TXT records)
dig +short TXT "$TARGET" 2>/dev/null | grep "v=spf1"

# DMARC record
dig +short TXT "_dmarc.$TARGET" 2>/dev/null

# DKIM - check common selectors
for selector in google default selector1 selector2 k1 mail dkim; do
  result=$(dig +short TXT "${selector}._domainkey.$TARGET" 2>/dev/null)
  if [ -n "$result" ]; then
    echo "DKIM found: selector=$selector"
    break
  fi
done

# MTA-STS (modern email security)
dig +short TXT "_mta-sts.$TARGET" 2>/dev/null
```

**What to check:**

| Check | PASS | WARN | FAIL |
|-------|------|------|------|
| SPF | `v=spf1` present | `+all` = too permissive | missing |
| DMARC | `v=DMARC1` present | `p=none` = no enforcement | missing |
| DKIM | any selector found | - | no selectors found |
| BIMI | `v=BIMI1` in TXT | - | - (info only) |

---

## E. Misconfigurations

```bash
# Probe sensitive paths - check HTTP status code only
for path in \
  "/.git/HEAD" \
  "/.git/config" \
  "/.env" \
  "/.env.local" \
  "/.env.production" \
  "/wp-admin/" \
  "/wp-login.php" \
  "/phpmyadmin/" \
  "/phpmyadmin/index.php" \
  "/admin/" \
  "/administrator/" \
  "/backup/" \
  "/backup.zip" \
  "/backup.sql" \
  "/db.sql" \
  "/config.php" \
  "/config.yml" \
  "/config.yaml" \
  "/.DS_Store" \
  "/server-status" \
  "/elmah.axd" \
  "/.well-known/security.txt"; do
  status=$(curl -o /dev/null -s -w "%{http_code}" \
    --connect-timeout 3 --max-time 5 \
    -A "HackGuard-Scanner/1.0 (mysiteishackable.com)" \
    "https://$TARGET$path" 2>/dev/null)
  echo "$status $path"
done
```

**Interpretation:**

| Path | 200 status = | Note |
|------|-------------|------|
| `/.git/HEAD` | FAIL (critical) | Entire git history may be exposed |
| `/.git/config` | FAIL (critical) | Repo config + remote URLs exposed |
| `/.env*` | FAIL (critical) | Credentials likely exposed |
| `/backup*`, `*.sql` | FAIL (high) | Data exposure |
| `/wp-admin/` | WARN | WordPress admin exposed |
| `/phpmyadmin/` | FAIL (high) | DB admin panel exposed |
| `/admin/` | WARN | Admin panel exposed |
| `/server-status` | WARN | Apache server status exposed |
| `/.well-known/security.txt` | PASS (good practice) | Security contact present |
| `/.DS_Store` | WARN | macOS artifact, reveals filenames |

**Directory listing check:**
```bash
# Check if homepage body contains directory listing indicators
body=$(curl -s --connect-timeout 5 --max-time 8 \
  -A "HackGuard-Scanner/1.0" "https://$TARGET/" 2>/dev/null | head -c 2000)
echo "$body" | grep -qi "Index of /" && echo "DIRECTORY_LISTING_DETECTED"
```

---

## F. Technology Fingerprint

Analyze headers already collected in section A.

Look for:
- `Server: Apache/2.4.x` → version leak → WARN
- `Server: nginx/1.x.x` → version leak → WARN  
- `Server: Microsoft-IIS/10.0` → version leak → WARN
- `X-Powered-By: PHP/7.x` → FAIL (exposes outdated PHP)
- `X-Powered-By: Express` → WARN
- `X-Powered-By: ASP.NET` → WARN
- `X-Generator: WordPress 6.x` → WARN

---

## G. Subdomain Hints

```bash
# Check common subdomains
for sub in www mail api dev staging admin portal app beta test; do
  result=$(dig +short A "$sub.$TARGET" 2>/dev/null)
  if [ -n "$result" ]; then
    echo "RESOLVES: $sub.$TARGET → $result"
  fi
done
```

Report all that resolve as `ℹ INFO`. Flag `dev`, `staging`, `test` as WARN if they resolve publicly - they may lack security hardening.

---

## H. Open Ports (if nmap available)

```bash
# Check if nmap is available first
if command -v nmap &>/dev/null; then
  # Scan common web ports only - non-intrusive, no SYN scan
  nmap -p 80,443,8080,8443,8888,3000,5000 --open -T3 \
    --host-timeout 10s "$TARGET" 2>/dev/null | grep "open"
else
  echo "nmap not available - skipping port scan"
fi
```

Flag unexpected open ports (8080, 8888, 3000, 5000) as WARN - often development servers exposed publicly.
