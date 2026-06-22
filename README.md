# My Claude Code Skills

A personal collection of [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) for Claude Code — workflows and shared vocabulary I reuse across projects, versioned in one place and easy to reinstall.

The bulk of this collection is mirrored from [**@mattpocock/skills**](https://github.com/mattpocock/skills) ("Skills For Real Engineers"), kept faithful to upstream so I can pull updates. My own skills live under [`security/`](security/).

---

## 30-second install

```bash
git clone https://github.com/hillzeealex/skills.git
cd skills
./install.sh
```

`install.sh` finds every folder containing a `SKILL.md` and copies it into `~/.claude/skills/`. Start a new Claude Code session and they're live. Re-run anytime to sync updates.

Install a single skill by hand instead:

```bash
cp -R engineering/codebase-design ~/.claude/skills/
```

> **Tip** — a skill is fully self-contained: a `SKILL.md` (frontmatter `name` + `description`, then instructions) plus any supporting files in its folder. Nothing else is needed.

---

## How skills get invoked

Claude reads each skill's `description` and invokes it **automatically** when it's relevant.

Skills tagged **`manual`** below set `disable-model-invocation: true` — Claude won't trigger them on its own; you call them by name (e.g. *"use the prototype skill"*). These are the heavier, intentional workflows you want to opt into rather than have fire automatically.

---

## Skills

### 🛠 Engineering

The core engineering loop: model the domain, design deep modules, drive work through issues, implement, and debug.

| Skill | | What it does |
|---|---|---|
| [codebase-design](engineering/codebase-design/) | auto | Shared vocabulary for designing **deep modules** — a lot of behaviour behind a small interface, at a clean seam, testable through it. |
| [domain-modeling](engineering/domain-modeling/) | auto | Build and sharpen a project's domain model, pin down the ubiquitous language, and record decisions as ADRs. |
| [diagnosing-bugs](engineering/diagnosing-bugs/) | auto | A diagnosis loop for hard bugs and performance regressions. Triggers on "diagnose" / "debug this" / something broken or slow. |
| [tdd](engineering/tdd/) | auto | Test-driven development — red-green-refactor, build features and fix bugs test-first. |
| [resolving-merge-conflicts](engineering/resolving-merge-conflicts/) | auto | Work through an in-progress git merge/rebase conflict safely. |
| [improve-codebase-architecture](engineering/improve-codebase-architecture/) | **manual** | Scan a codebase for deepening opportunities, render them as a visual HTML report, then grill through whichever one you pick. |
| [grill-with-docs](engineering/grill-with-docs/) | **manual** | A relentless interview to sharpen a plan, producing ADRs + a glossary as you go. |
| [prototype](engineering/prototype/) | **manual** | Build a throwaway prototype — a runnable terminal app for logic questions, or several toggleable UI variations. |
| [implement](engineering/implement/) | **manual** | Implement a piece of work from a PRD or a set of issues. |
| [to-prd](engineering/to-prd/) | **manual** | Turn the current conversation into a PRD and publish it to the issue tracker. |
| [to-issues](engineering/to-issues/) | **manual** | Break a plan/spec/PRD into independently-grabbable issues using tracer-bullet vertical slices. |
| [triage](engineering/triage/) | **manual** | Move issues and external PRs through a triage state machine, ending in agent-ready briefs. |
| [setup-matt-pocock-skills](engineering/setup-matt-pocock-skills/) | **manual** | One-time setup for the engineering flow — issue tracker, triage labels, domain doc layout. |
| [ask-matt](engineering/ask-matt/) | **manual** | A router that recommends which skill or flow fits your current situation. |

### ⚡ Productivity

| Skill | | What it does |
|---|---|---|
| [grilling](productivity/grilling/) | auto | Interview you relentlessly about a plan or design to stress-test it before any code is written. |
| [grill-me](productivity/grill-me/) | **manual** | The same relentless interview, on demand. |
| [handoff](productivity/handoff/) | **manual** | Compact the current conversation into a handoff doc for another agent to pick up. |
| [teach](productivity/teach/) | **manual** | Teach you a new skill or concept inside this workspace. |
| [writing-great-skills](productivity/writing-great-skills/) | **manual** | Reference for the vocabulary and principles that make a skill predictable — for writing your own. |

### 📝 Personal

| Skill | | What it does |
|---|---|---|
| [obsidian-vault](personal/obsidian-vault/) | auto | Search, create, and organise notes in an Obsidian vault with wikilinks and index notes. |
| [edit-article](personal/edit-article/) | **manual** | Restructure, clarify, and tighten an article draft. |

### 🔧 Misc

Repo-setup and migration helpers.

| Skill | | What it does |
|---|---|---|
| [git-guardrails-claude-code](misc/git-guardrails-claude-code/) | auto | Claude Code hooks that block dangerous git commands (push, reset --hard, clean, branch -D) before they run. |
| [setup-pre-commit](misc/setup-pre-commit/) | auto | Husky pre-commit hooks with lint-staged (Prettier), type-checking, and tests. |
| [scaffold-exercises](misc/scaffold-exercises/) | auto | Scaffold exercise directories (sections, problems, solutions, explainers) that pass linting. |
| [migrate-to-shoehorn](misc/migrate-to-shoehorn/) | auto | Migrate test files from `as` assertions to `@total-typescript/shoehorn`. |

### 🔒 Security *(mine)*

| Skill | | What it does |
|---|---|---|
| [hackguard](security/hackguard/) | auto | Professional website security audit — HTTPS/TLS, DNS, headers, SPF/DMARC, misconfigs, exposed files. Powers the auditor at [mysiteishackable.com](https://mysiteishackable.com). |

---

### 🚧 In progress

Upstream work-in-progress — useful but rougher edges. *(auto unless noted)*

| Skill | | What it does |
|---|---|---|
| [review](in-progress/review/) | auto | Review changes since a fixed point along two axes — **Standards** (repo coding standards) and **Spec** (matches the originating issue/PRD) — in parallel sub-agents, side by side. |
| [writing-shape](in-progress/writing-shape/) | auto | Shape a markdown pile of notes into an article, paragraph by paragraph, arguing format at each step. |
| [writing-fragments](in-progress/writing-fragments/) | auto | A grilling session that mines you for writing fragments and collects them as raw material. |
| [writing-beats](in-progress/writing-beats/) | auto | Assemble an article as a journey of beats, choose-your-own-adventure style. |
| [decision-mapping](in-progress/decision-mapping/) | **manual** | Turn a loose idea into a sequenced map of investigation tickets, then drive them to resolution. |

### 🗄 Deprecated

Kept for reference; superseded by the skills above. *(auto unless noted)*

| Skill | | Superseded by |
|---|---|---|
| [ubiquitous-language](deprecated/ubiquitous-language/) | **manual** | → `domain-modeling` |
| [design-an-interface](deprecated/design-an-interface/) | auto | → `codebase-design` |
| [request-refactor-plan](deprecated/request-refactor-plan/) | auto | → `to-issues` / `triage` |
| [qa](deprecated/qa/) | auto | → `triage` |

---

## Structure

```
skills/
├── install.sh          # copies every SKILL.md folder into ~/.claude/skills/
├── engineering/        # design, model, implement, debug (mirrored)
├── productivity/       # grilling, handoff, teach (mirrored)
├── personal/           # writing & notes (mirrored)
├── misc/               # repo setup & migrations (mirrored)
├── in-progress/        # upstream WIP (mirrored)
├── deprecated/         # superseded, kept for reference (mirrored)
└── security/           # hackguard — mine
```

Folders are categories for humans; Claude only cares that a skill's folder lands under `~/.claude/skills/` after install.

## Credits & license

Engineering, productivity, personal, misc, in-progress, and deprecated skills are mirrored from [@mattpocock/skills](https://github.com/mattpocock/skills) — full credit to Matt Pocock. `security/hackguard` is mine. Each skill keeps its upstream license; treat the collection as MIT — hack around, adapt, make them yours.
