---
name: ask-hillzeealex
description: Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
disable-model-invocation: true
---

# Ask Hillzeealex

You don't remember every skill, so ask.

A **flow** is a path through the skills. Most paths run along one **main flow**, and two **on-ramps** merge onto it. Everything else is standalone.

## The main flow: idea → ship

The route most work travels. You have an idea and want it built.

1. **`/grill-with-docs`** — sharpen the idea by interview. Start here when you **have a codebase**: it's stateful, retaining what it learns in `CONTEXT.md` and ADRs. (No codebase? Use `/grill-me` — see Standalone. Idea too big to resolve in one session? Use **`/decision-mapping`** to break it into a sequenced map of investigation tickets — Research / Prototype / Discuss — each sized to one session, then drive them one at a time.)
2. **Branch — can you settle every question in conversation?** If a question needs a runnable answer (state, business logic, a UI you have to see), detour through a prototype, bridged by **`/handoff`** in both directions (see Crossing sessions):
   - **`/handoff`** out, then open a fresh session against that file,
   - **`/prototype`** to answer the question with throwaway code,
   - **`/handoff`** back what you learned, and reference it from the original idea thread.
3. **Branch — is this a multi-session build?**
   - **Yes** → **`/to-prd`** (turn the thread into a PRD) → **`/to-issues`** (split the PRD into independently-grabbable issues). Because the issues are independent, **clear context between each one**: start a fresh session per issue and kick off **`/implement`** by passing it the PRD and the single issue to work on.
   - **No** → **`/implement`** right here, in the same context window.

### Context hygiene

Keep steps 1–3 in **one unbroken context window** — don't compact or clear until after `/to-issues` — so the grilling, PRD, and issues all build on the same thinking. Each `/implement` then starts fresh, working from the issue.

The limit on this is the **[smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone)**: the window (~120k tokens on state-of-the-art models) within which the model still reasons sharply. If a session approaches it before `/to-issues`, don't push on degraded — `/handoff` and continue in a fresh thread.

## On-ramps

A starting situation that generates work, then merges onto the main flow.

- **Bugs and requests piling up** → **`/triage`**. It moves issues through triage roles and produces agent-ready issues, which **`/implement`** later picks up.

  Triage is only for issues **you didn't create** — bug reports, incoming feature requests, anything that arrives raw. Issues that `/to-issues` produced are already agent-ready, so **don't triage them**.

- **A security concern about a live site** → **`/hackguard`**. It runs a passive, read-only audit of a domain (HTTPS/TLS, DNS, headers, SPF/DMARC, misconfigs, exposed files) and produces a scored report. Findings that need fixing _generate ideas_ you can take into the main flow at `/grill-with-docs`. Only scan domains you own or are authorised to test.

## Codebase health

Not feature work — upkeep.

- **`/improve-codebase-architecture`** — run whenever you have a spare moment to keep the codebase good for agents to operate in. It surfaces deepening opportunities; picking one _generates an idea_ you can take into the main flow at `/grill-with-docs`.
- **`/git-guardrails-claude-code`** — install hooks that block dangerous git commands (push, reset --hard, clean, branch -D) before they run. One-time hardening of a repo you work in.
- **`/setup-pre-commit`** — add Husky + lint-staged (Prettier), typecheck, and tests on commit. One-time setup per repo.

## Crossing sessions

- **`/handoff`** — when a thread is full or you need to branch off (e.g. into a `/prototype` session), this compacts the conversation into a markdown file. You don't continue in place — you **open a new session and reference that file** to carry the context across. It's the bridge between context windows, in either direction. Use it when you want a **fresh session** but need the **current conversation preserved**.
- **`/compact`** (built-in) — stay in the **same conversation**, letting the earlier turns be summarized. Use it at **intentional breaks between phases**, when you don't mind losing the verbatim history. Don't compact mid-phase — the agent can lose its way. `/handoff` forks; `/compact` continues.

## Standalone

Off the main flow entirely.

- **`/grill-me`** — the same relentless interview as `/grill-with-docs`, but for when you have **no codebase**. Stateless: it saves nothing locally, builds no `CONTEXT.md`. Reach for it to sharpen any plan or design that doesn't live in a repo.
- **`/teach`** — learn a concept over multiple sessions, using the current directory as a stateful workspace.
- **`/obsidian-vault`** — find, create, and organise notes in the Obsidian vault with wikilinks and index notes.
- **`/edit-article`** — restructure and tighten an existing article draft, section by section.
- **`/writing-great-skills`** — reference for writing and editing skills well.
- **Writing from raw material** (work-in-progress skills): **`/writing-fragments`** to mine and collect fragments before structure, then **`/writing-shape`** or **`/writing-beats`** to turn the pile into an article.

## Always-on (auto skills)

You don't invoke these — they're **model-invoked**, so they fire on their own when relevant. Listed here only so you know they exist and what they cover:

- **`codebase-design`** — the shared vocabulary for deep modules (module, interface, depth, seam, adapter, leverage, locality). Underpins every design discussion.
- **`domain-modeling`** — actively builds and sharpens the domain model (`CONTEXT.md`, ADRs) as you design.
- **`diagnosing-bugs`** — the diagnosis loop for hard bugs and perf regressions; builds a tight feedback loop first.
- **`tdd`** — test-driven development through public interfaces, vertical slices over horizontal.
- **`resolving-merge-conflicts`** — works through an in-progress merge/rebase, preserving both intents.
- **`review`** — two-axis review (Standards + Spec) of the diff since a fixed point, in parallel sub-agents.
- **`grilling`** — the relentless plan-stressing interview (`grill-me` / `grill-with-docs` are the manual wrappers).
- **`scaffold-exercises`** — scaffolds lint-passing exercise directory structures.
- **`migrate-to-shoehorn`** — migrates test files from `as` assertions to `@total-typescript/shoehorn`.

## Other routers

- **`/ask-matt`** — the upstream router this one is based on. Same main flow, without my additions (hackguard, git/pre-commit setup, the writing flow, decision-mapping).

## Deprecated

Superseded — kept only for reference; reach for the replacement instead:

- **`/ubiquitous-language`** → use **`domain-modeling`**.
- **`design-an-interface`** → folded into **`codebase-design`**.
- **`request-refactor-plan`** → use **`/to-issues`** / **`/triage`**.
- **`qa`** → use **`/triage`**.

## Precondition

**`/setup-matt-pocock-skills`** — run before your first engineering flow to configure the issue tracker, triage labels, and doc layout the other skills assume. Custom issue trackers also work.
