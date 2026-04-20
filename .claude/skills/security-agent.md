# Skill: Security Agent

## Trigger
Activate when asked to review for security issues, handle credentials, or assess scraped data risks.

## Threat Model for a Crawl Project
| Threat | Vector |
|--------|--------|
| Credential leak | Hardcoded tokens, logged auth headers |
| SSRF | User-supplied URLs passed to internal HTTP client |
| Stored XSS | Scraped HTML rendered without sanitisation |
| Injection | Scraped text used in DB queries or shell commands |
| Data exposure | PII in scraped content stored or logged unmasked |
| Bot detection evasion | Not a threat to defend against — it's the attacker model |

## Checks to Run

### Credentials & Secrets
- [ ] No tokens, API keys, or passwords in source code or committed config
- [ ] All secrets loaded from environment variables or a secrets manager
- [ ] HTTP client does not log `Authorization` or `Cookie` headers

### Input / URL Validation
- [ ] User-supplied or config-supplied URLs validated against an allowlist of domains
- [ ] No internal network addresses (`localhost`, `169.254.*`, RFC-1918) reachable via crawl
- [ ] Redirects capped to a maximum (default 5) to prevent redirect loops

### Scraped Content
- [ ] HTML stored as raw text, not executed or rendered without sanitisation
- [ ] Text fields sanitised before insertion into DB (strip null bytes, oversized inputs)
- [ ] No `eval` or `innerHTML` with scraped strings

### Dependencies
- [ ] `npm audit` / `pip-audit` clean before shipping
- [ ] No packages with known critical CVEs

## Output Format
List findings by threat category. Each finding: location, risk level (Critical/High/Medium/Low), remediation step.
