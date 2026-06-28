<div align="center">

# ⚡ Claude Code Skills

### A curated arsenal of [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) that turn Claude Code into a senior engineer, a security auditor, and a relentless design partner.

<br/>

![Claude Code](https://img.shields.io/badge/Claude%20Code-skills-D97757?style=for-the-badge)
![Skills](https://img.shields.io/badge/skills-35+-2563eb?style=for-the-badge)
![Security](https://img.shields.io/badge/security-suite-00ff41?style=for-the-badge&labelColor=000)
![License](https://img.shields.io/badge/license-MIT-22c55e?style=for-the-badge)
![PRs](https://img.shields.io/badge/PRs-welcome-ff8800?style=for-the-badge)

[**Install**](#-30-second-install) · [**Security suite**](#-security-suite--the-flagship) · [**Catalog**](#-the-catalog) · [**How it works**](#-auto-vs-manual)

</div>

---

**Skills are reusable playbooks that Claude Code loads on demand** - a folder with a `SKILL.md` (when to use it + the exact process) plus any scripts or templates it needs. Drop them in once and Claude reaches for the right one automatically, running the *same* battle-tested process every time instead of improvising.

This repo is a working toolbox: a full **idea → ship** engineering flow (faithfully mirrored from [**@mattpocock/skills**](https://github.com/mattpocock/skills)) **plus an original security suite** forged on a real Swiss nLPD/RGPD compliance product.

---

## 🛡️ Security suite - the flagship

Three skills that find the holes, plug them, and keep your docs honest. Built while hardening a production app (cross-tenant IDOR, stored XSS, PII encryption at rest - the real stuff).

| Skill | What it does |
|---|---|
| 🎯 **[hackguard](security/hackguard/)** | Security auditor with three modes: **external scan** (TLS/DNS/headers/SPF), **white-box code audit** (IDOR, injection, SSRF, upload, secrets - by vuln class with `file:line` proof), and **non-destructive dynamic pentest** (local/staging only). Ships a rendered HTML report. Powers [mysiteishackable.com](https://mysiteishackable.com). |
| 🔐 **[security-baseline](security/security-baseline/)** | Drops a proven baseline into any Node/TS backend: **field-level PII encryption at rest** (AES-256-GCM + blind index, tested modules you copy in), tenant-scoping against IDOR, upload validation, log redaction, CORS/error fail-closed. |
| 🧪 **[vibesec](security/vibesec/)** | Preventive secure-coding co-pilot - guides Claude to write IDOR/XSS/SSRF-safe code *as you build*. Complements the two above (catch vs prevent). Credit: [@BehiSecc](https://github.com/BehiSecc/VibeSec-Skill). |

> **Combo:** `vibesec` prevents the bug → `security-baseline` sets the guardrails → `hackguard` proves it's clean.

---

## 🚀 30-second install

```bash
git clone https://github.com/hillzeealex/skills.git
cd skills
./install.sh
```

`install.sh` copies every `SKILL.md` folder into `~/.claude/skills/`. Start a fresh Claude Code session and they're live. Re-run anytime to sync. Or grab just one:

```bash
cp -R security/security-baseline ~/.claude/skills/
```

---

## 📚 The catalog

### 🏗️ Engineering - the *idea → ship* flow
*Grill the idea, model the domain, design deep modules, turn it into a PRD and issues, implement test-first, review.* Mirrored from [@mattpocock/skills](https://github.com/mattpocock/skills).

| Skill | One-liner |
|---|---|
| **[codebase-design](engineering/codebase-design/)** | Shared vocabulary for designing **deep modules** (small interface, lots of behaviour, clean seam). |
| **[domain-modeling](engineering/domain-modeling/)** | Actively build the domain model - glossary + ADRs the moment terms crystallise. |
| **[improve-codebase-architecture](engineering/improve-codebase-architecture/)** | Scan for deepening opportunities, render a visual HTML report, then grill the chosen one. |
| **[diagnosing-bugs](engineering/diagnosing-bugs/)** | Build a tight red-on-this-bug feedback loop *first*, then find the cause. |
| **[tdd](engineering/tdd/)** | Test behaviour through public interfaces, vertical slices (one test → one impl → repeat). |
| **[auditing-doc-drift](engineering/auditing-doc-drift/)** | Confront every verifiable claim in a README/doc/memory against the real code. Catches "delivered" lies. |
| **[grill-with-docs](engineering/grill-with-docs/)** | Relentless design interview that drops ADRs + glossary as it goes. |
| **[prototype](engineering/prototype/)** · **[implement](engineering/implement/)** | Throwaway prototypes to answer one question · ship a PRD/issues test-first. |
| **[to-prd](engineering/to-prd/)** · **[to-issues](engineering/to-issues/)** · **[triage](engineering/triage/)** | Conversation → PRD → tracer-bullet issues → triage state machine. |
| **[resolving-merge-conflicts](engineering/resolving-merge-conflicts/)** | Resolve a merge/rebase by understanding both sides' intent. Always finishes, never `--abort`. |

### ⚡ Productivity
| Skill | One-liner |
|---|---|
| **[grilling](productivity/grilling/)** / **[grill-me](productivity/grill-me/)** | Interview you relentlessly down every branch of a design tree before any code. |
| **[handoff](productivity/handoff/)** | Compact the conversation into a handoff doc so a fresh agent continues cleanly. |
| **[teach](productivity/teach/)** | Teach you a topic across sessions in a stateful workspace (mission, cheat-sheets, HTML lessons). |
| **[writing-great-skills](productivity/writing-great-skills/)** | The reference for authoring skills that fire the same process every run. |

### 🔧 Setup & migration
| Skill | One-liner |
|---|---|
| **[git-guardrails-claude-code](misc/git-guardrails-claude-code/)** | Hook that blocks dangerous git (`push --force`, `reset --hard`, `clean -f`…) before they run. |
| **[setup-pre-commit](misc/setup-pre-commit/)** | Husky + lint-staged (Prettier) + typecheck + tests, auto-detecting the package manager. |
| **[scaffold-exercises](misc/scaffold-exercises/)** · **[migrate-to-shoehorn](misc/migrate-to-shoehorn/)** | Exercise scaffolds · migrate test `as` casts to shoehorn. |

### ✍️ Writing & notes
| Skill | One-liner |
|---|---|
| **[obsidian-vault](personal/obsidian-vault/)** | Search/create/organise an Obsidian vault with wikilinks + index notes. |
| **[writing-fragments](in-progress/writing-fragments/)** · **[writing-shape](in-progress/writing-shape/)** · **[writing-beats](in-progress/writing-beats/)** | Mine raw fragments → shape into an article → assemble beat by beat. |
| **[edit-article](personal/edit-article/)** | Restructure an article as an info-DAG, then tighten each section. |

> `ask-hillzeealex` / `ask-matt` are routers over the whole repo - start there when unsure which skill fits.

---

## 🤖 Auto vs manual

Claude reads each skill's `description` and fires an **auto** skill on its own when relevant. A **manual** skill (`disable-model-invocation: true`) never fires automatically - you invoke it by name (*"use the prototype skill"*). Manual is for the heavier, intentional workflows you opt into.

---

## 🙏 Credits & license

- **Engineering · productivity · personal · misc · in-progress** - faithfully mirrored from [**@mattpocock/skills**](https://github.com/mattpocock/skills), "Skills For Real Engineers". Full credit to Matt Pocock.
- **security/hackguard** - original, powers [mysiteishackable.com](https://mysiteishackable.com).
- **security/security-baseline** · **engineering/auditing-doc-drift** - original, extracted from real production security work.
- **security/vibesec** - by [@BehiSecc](https://github.com/BehiSecc/VibeSec-Skill) (Apache-2.0).

Each skill keeps its upstream license; treat the collection as **MIT** - hack around, adapt, make them yours.

<div align="center">
<br/>

**⭐ Star it if it saved you a few hours.**

</div>
