---
name: auditing-doc-drift
description: Use when checking whether a README, doc, or project memory file is still accurate against the actual code and config - before a release or demo, after refactors or migrations, when onboarding, or whenever docs claim a version, branch, file path, env var, security posture, or "feature delivered" status that may have drifted from reality.
---

# Auditing Doc Drift

Documentation rots silently: the code moves, the prose doesn't. This skill confronts every **verifiable claim** in a document against the real code/config/git, and reports the gaps. The danger is not vague staleness - it's a *specific false statement* a reader will act on (a broken setup command, a wrong deploy branch, a security feature claimed-but-absent).

## When to use

- Verifying a README, runbook, architecture doc, or onboarding guide is current
- Auditing project memory (`memory/project_*.md`, `CLAUDE.md`) where "delivered / to-do" status can lie
- Before a release, investor/audit demo, or handing the repo to someone new
- After a migration, refactor, dependency bump, or infra change

**Not for:** prose style, typos, or opinions. Only check claims that can be **proven true or false** against the repo.

## Method

### 1. Extract verifiable claims
Read the whole document. Pull out only statements checkable against the repo. High-yield categories - hunt these first, they drift most and hurt most:

| Claim type | Example | Where to verify |
|---|---|---|
| Versions | "PostgreSQL 16", "Node 20" | lockfiles, Dockerfiles, compose, `package.json` engines |
| Deploy / branches | "master not yet active", "deploys from X" | `.github/workflows/*`, CI config |
| Setup commands | `cp .env.staging .env` | does that file / script actually exist? |
| File & dir paths | "Zod schemas in `schemas/`" | `ls` the path |
| Env var names | `ENV_FILE_STAGING` | grep the workflow / code that reads it |
| **Feature "delivered"** | "SP11 encryption PII = Livré" | grep for the actual implementation; **absence = false claim** |
| Security posture | "AES-256 at rest", "Basic Auth on prod" | the config that would enforce it (nginx, crypto module) |

The most dangerous drifts are **"delivered" / security claims that aren't true** - they mislead auditors and users. Weight them heavily.

### 2. Verify against reality
Prefer cheap, direct evidence: `grep`, reading the exact file, `git log`. For a large doc with many independent claims, dispatch parallel read-only explore agents, one per claim cluster, then synthesize - don't verify 30 claims serially.

A claim is **confirmed** only with evidence (file:line). "I think it's fine" is not verification. For "feature delivered" claims, prove the implementation exists; if a grep for the mechanism comes back empty, the claim is **false**, not "probably true".

### 3. Report as a drift table
One row per claim. Cite the evidence. Rate severity by what a reader does with the false belief:

- 🔴 **Grave** - false security/compliance/"delivered" claim, or broken core instruction (setup/deploy)
- 🟡 **Moyen** - wrong version, stale framing, missing-but-recoverable detail
- 🟢 **OK** - verified accurate (list a few, so the report shows you actually checked)

```
| Claim (doc:line) | Reality (evidence) | Severity | Suggested fix |
```

Lead with the single most dangerous drift in one sentence before the table.

### 4. Correct only after approval
Propose fixes in the table, then **stop and let the user pick** what to apply. Never silently rewrite a doc. When applying: make the *minimal* edit that makes the claim true (or move a "Delivered" item to "To-do"), preserving the doc's voice. Re-verify each edit.

## Common mistakes

- **Trusting the doc's self-description.** "It says it's in production" is the claim under test, not evidence.
- **Checking only what's easy to grep.** The security/"delivered" claims are the whole point - chase them even when verification is harder.
- **Reporting vibes.** Every drift needs a file:line or a confirmed-absent grep.
- **Auto-fixing.** Signal first; correct on approval, one item at a time.
- **Stopping at the README.** Project memory (`project_*.md`) drifts the same way and is trusted more.
