# My Claude Code Skills

A personal collection of [Agent Skills](https://docs.claude.com/en/docs/claude-code/skills) for Claude Code — workflows and shared vocabulary I reuse across projects, versioned in one place and easy to reinstall.

Most of this collection is mirrored faithfully from [**@mattpocock/skills**](https://github.com/mattpocock/skills) ("Skills For Real Engineers") so I can pull updates. My own skill lives under [`security/`](security/).

---

## 30-second install

```bash
git clone https://github.com/hillzeealex/skills.git
cd skills
./install.sh
```

`install.sh` finds every folder containing a `SKILL.md` and copies it into `~/.claude/skills/`. Start a new Claude Code session and they're live. Re-run anytime to sync updates. Install just one by hand instead:

```bash
cp -R engineering/codebase-design ~/.claude/skills/
```

> A skill is fully self-contained: a `SKILL.md` (frontmatter `name` + `description`, then instructions) plus any supporting files in its folder.

## Auto vs manual

Claude reads each skill's `description` and fires an **auto** skill on its own when it's relevant. A **manual** skill sets `disable-model-invocation: true` — it never fires automatically; you invoke it by name (e.g. *"use the prototype skill"*). Manual is for the heavier, intentional workflows you want to opt into. Each skill below is tagged accordingly.

---

## 🛠 Engineering

These chain into one **idea → ship** flow: grill the idea, model the domain, design deep modules, turn it into a PRD and issues, implement test-first, review. `ask-matt` is the map over all of them.

**[ask-matt](engineering/ask-matt/)** · *manual* — A router over the whole repo. You don't remember every skill, so this one names the main flow (idea → ship), the on-ramps that merge onto it, and the standalone skills, and tells you which to reach for. Start here when you're unsure.

**[codebase-design](engineering/codebase-design/)** · *auto* — The shared vocabulary for designing **deep modules**: a lot of behaviour behind a small interface, placed at a clean seam, testable through it. Defines the exact terms (module, interface, implementation, depth, seam, adapter, leverage, locality) so every other design skill speaks the same language instead of drifting into "component/service/API".

**[domain-modeling](engineering/domain-modeling/)** · *auto* — The *active* discipline of building a project's domain model: challenging terms, inventing edge-case scenarios, and writing the glossary (`CONTEXT.md`) and decisions (ADRs) down the moment they crystallise. For when you're changing the model, not just reading it.

**[diagnosing-bugs](engineering/diagnosing-bugs/)** · *auto* — A diagnosis loop for hard bugs and performance regressions. Its core lesson: build a **tight feedback loop** first (a failing test, a curl script, a replay harness, a bisection loop…) — with a signal that goes red on *this* bug, you'll find the cause; without one, staring at code won't save you.

**[tdd](engineering/tdd/)** · *auto* — Test-driven development done right: test behaviour through public interfaces, never implementation details. Enforces **vertical slices** (one test → one impl → repeat) over the horizontal "write all tests, then all code" anti-pattern that produces tests insensitive to real changes.

**[grill-with-docs](engineering/grill-with-docs/)** · *manual* — A `grilling` interview combined with `domain-modeling`: it sharpens a plan by relentless questioning **and** drops ADRs + glossary entries as you go. The stateful starting point when you have a codebase.

**[prototype](engineering/prototype/)** · *manual* — Build throwaway code that answers one question. Two branches: a runnable **terminal app** to pressure-test a state/logic model, or several **radically different UI variations** toggleable from one route. Throwaway from day one, no persistence, no polish — capture the answer, then delete.

**[implement](engineering/implement/)** · *manual* — Implement a piece of work from a PRD or a set of issues. Uses `tdd` at pre-agreed seams, runs typecheck and tests as it goes, then `review` at the end and commits to the current branch.

**[to-prd](engineering/to-prd/)** · *manual* — Turn the current conversation into a PRD and publish it to the issue tracker — no interview, pure synthesis of what you've already discussed. Sketches the test seams (prefer the fewest, highest seams) and writes an extensive set of user stories.

**[to-issues](engineering/to-issues/)** · *manual* — Break a plan/spec/PRD into independently-grabbable issues using **tracer-bullet vertical slices** — each a thin but complete path through every layer (schema → API → UI → tests), demoable on its own, with explicit "blocked by" dependencies.

**[triage](engineering/triage/)** · *manual* — Move issues and external PRs through a small state machine of triage roles (category: bug/enhancement; states: needs-triage → needs-info → ready-for-agent…), ending in agent-ready briefs. Every posted comment carries an "AI-generated during triage" disclaimer.

**[resolving-merge-conflicts](engineering/resolving-merge-conflicts/)** · *auto* — Work through an in-progress merge/rebase: understand the original intent behind each side (commits, PRs, issues), preserve both where possible, pick the one matching the merge's goal where not, run the project's checks, and always finish — never `--abort`.

**[setup-matt-pocock-skills](engineering/setup-matt-pocock-skills/)** · *manual* — One-time per-repo setup the engineering skills assume: where issues live (GitHub or local markdown), the triage label vocabulary, and where `CONTEXT.md` + ADRs go. Prompt-driven — explore, confirm, write. Run once before first use.

---

## ⚡ Productivity

**[grilling](productivity/grilling/)** · *auto* — Interview you relentlessly about every aspect of a plan, walking down each branch of the design tree one decision at a time, resolving dependencies, and offering a recommended answer for each question. Stress-tests a design before any code is written.

**[grill-me](productivity/grill-me/)** · *manual* — The same relentless interview, invoked on demand (a thin manual wrapper over `grilling`).

**[handoff](productivity/handoff/)** · *manual* — Compact the current conversation into a handoff document (saved to the OS temp dir, not the repo) so a fresh agent can continue — including a "suggested skills" section, references to existing artifacts instead of duplication, and redaction of secrets.

**[teach](productivity/teach/)** · *manual* — Teach you a topic across multiple sessions, treating the current directory as a stateful teaching workspace: a `MISSION.md`, reference cheat-sheets, learning records (ADR-style), and self-contained HTML lessons scoped to the mission.

**[writing-great-skills](productivity/writing-great-skills/)** · *manual* — The reference for authoring skills well. A skill exists to wrangle **predictability** out of a stochastic system; this covers the levers — model- vs user-invocation and their context/cognitive-load tradeoffs, how to write a triggering description, router skills — that make a skill fire the same process every run.

---

## 📝 Personal

**[obsidian-vault](personal/obsidian-vault/)** · *auto* — Search, create, and organise notes in an Obsidian vault using `[[wikilinks]]` and index notes, with the vault's conventions baked in (title case, flat structure, links over folders).

**[edit-article](personal/edit-article/)** · *manual* — Edit an article by splitting it into sections, ordering them so information dependencies are respected (treat info as a DAG), then rewriting each section for clarity with a tight per-paragraph length budget.

---

## 🔧 Misc

Repo-setup and migration helpers.

**[git-guardrails-claude-code](misc/git-guardrails-claude-code/)** · *auto* — Install a PreToolUse hook that blocks dangerous git commands before Claude runs them — `push` (incl. `--force`), `reset --hard`, `clean -f`, `branch -D`, `checkout .` — surfacing a "not authorised" message instead.

**[setup-pre-commit](misc/setup-pre-commit/)** · *auto* — Set up Husky pre-commit hooks with lint-staged (Prettier), plus typecheck and test scripts, auto-detecting the package manager from the lockfile.

**[scaffold-exercises](misc/scaffold-exercises/)** · *auto* — Scaffold exercise directory structures (sections, `problem/` / `solution/` / explainer variants) that pass the AI Hero lint, with the project's dash-case numbering convention.

**[migrate-to-shoehorn](misc/migrate-to-shoehorn/)** · *auto* — Migrate **test** files from `as` type assertions to `@total-typescript/shoehorn`, keeping partial test data type-safe (test code only — never production).

---

## 🔒 Security *(mine)*

**[hackguard](security/hackguard/)** · *auto* — A professional, non-intrusive website security auditor. Runs passive, read-only checks against a domain in parallel — HTTPS/TLS, DNS, security headers, SPF/DMARC, misconfigs, exposed files — and produces a scored, graded report with remediation guidance. Enforces an ethics rule (only scan what you own or are authorised to test). Powers the auditor at [mysiteishackable.com](https://mysiteishackable.com).

---

## 🚧 In progress

Upstream work-in-progress — useful but rougher edges.

**[review](in-progress/review/)** · *auto* — Two-axis review of the diff since a fixed point you supply: **Standards** (does it follow the repo's documented coding standards?) and **Spec** (does it implement the originating issue/PRD?), run as parallel sub-agents so they don't pollute each other's context, then aggregated side by side.

**[decision-mapping](in-progress/decision-mapping/)** · *manual* — Turn a loose idea too big for one session into a stateful, git-tracked **decision map**: numbered tickets (Research / Prototype / Discuss), each sized to one ~100K-token session, driven to resolution one at a time.

**[writing-fragments](in-progress/writing-fragments/)** · *auto* — A grilling session that mines you for **fragments** — sharp sentences, vignettes, half-thoughts, claims — and appends them to one document as raw material, deliberately *before* imposing any structure.

**[writing-shape](in-progress/writing-shape/)** · *auto* — Take a markdown pile of raw material (read-only) and shape it into a separate article through a conversational loop — drafting openings, growing it paragraph by paragraph, arguing format (lists, tables, callouts) at each step.

**[writing-beats](in-progress/writing-beats/)** · *auto* — Assemble an article as a journey of **beats**, choose-your-own-adventure style: you pick a starting beat from the raw material, it writes only that beat, then offers next directions, beat by beat, until a natural end.

---

## 🗄 Deprecated

Kept for reference; superseded by the skills above.

**[ubiquitous-language](deprecated/ubiquitous-language/)** · *manual* — Extract a DDD glossary from the conversation to `UBIQUITOUS_LANGUAGE.md`, flagging ambiguities/synonyms. → superseded by **domain-modeling**.

**[design-an-interface](deprecated/design-an-interface/)** · *auto* — "Design It Twice": generate 3+ radically different interface designs via parallel sub-agents, then compare. → folded into **codebase-design**.

**[request-refactor-plan](deprecated/request-refactor-plan/)** · *auto* — Interview-driven refactor plan broken into tiny always-green commits, filed as a GitHub issue. → superseded by **to-issues** / **triage**.

**[qa](deprecated/qa/)** · *auto* — Conversational QA session that files durable, user-focused GitHub issues, exploring the codebase in the background for domain language. → superseded by **triage**.

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
