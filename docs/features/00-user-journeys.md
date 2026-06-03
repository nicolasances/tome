# User Journeys — Tome Language Learning (v2.0 frontend)

This file maps the journeys through the v2.0 Language Learning experience, the
complete screen inventory, and the navigation map. It is the backbone for the
feature breakdown and the coverage check.

**Source of truth for screens:** the wireframe in
`docs/ui-design/tome-language-learning/project/` (Claude Design handoff).
**Idea:** `docs/specs/language-learning/idea.md` (v2.0).

**Scope note (important):** the wireframe only partially covers the v2.0 idea.
This breakdown covers **only the wireframe-covered screens**. The idea scope that
has no wireframe coverage is **deliberately skipped** and listed at the bottom of
this file (see *Skipped — not yet covered*). Those areas will get features once a
wireframe exists for them.

**Design variants chosen:** Home dashboard → **variant C (Level track)**; Module
map → **variant A (Vertical list)**. The wireframe also contains alternative
treatments (Home A/B, Map B/C) which are not the spec'd design.

> Legacy note: the repo already contains `app/language-learning/*` from the *old*
> (pre-v2.0) design (vocabulary-practice, sentence-practice, sources). It is not
> the basis for these features and is expected to be replaced by the v2.0 build.

## Journeys

| # | Journey | Goal | Screen sequence |
|---|---------|------|-----------------|
| J1 | Check standing & continue | See my CEFR level + progress and resume my current module | Home dashboard → (Continue) → Module overview |
| J2 | Browse the level & start a module | See all modules of my level and open the active one | Home dashboard → Module map → Module overview |
| J3 | Learn a module's grammar | Read the module's grammar concepts before practising | Module overview → Grammar intro |
| J4 | Practise a module | Work through the practice exercise session | Module overview → Practice session |

## Screen Inventory

Every screen reachable in any journey above, mapped to its owning feature.

| Screen | Route (proposed) | Owning Feature (capability) | Notes |
|--------|------------------|-----------------------------|-------|
| Home dashboard | `/language-learning` | `01-home-dashboard` | Variant C (Level track). Motivational hub. |
| Module map | `/language-learning/level/[level]` | `02-module-map` | Variant A (Vertical list). Modules of the current level. |
| Module overview | `/language-learning/module/[moduleId]` | `03-module-overview` | Module hub: theme, goal, 3-step flow, lock states. |
| Grammar intro | `/language-learning/module/[moduleId]/grammar` | `04-grammar-introduction` | Step 1 — paged instructional concept cards. |
| Practice session | `/language-learning/module/[moduleId]/practice` | `05-practice-session` | Step 2 — one screen rendering the 6 exercise types within a fixed-size session. |

## Cross-cutting shared components

No capability-level cross-cutting component is split out. The per-screen
`TomeScreen` title/header chrome is a layout shell (not a feature), and shared
primitives (progress `Bar`, `RoundButton`) come from the kit / `toto-react`
library — they are referenced inside each feature, not spun out.

| Shared component | Used by screens | Owning Feature |
|------------------|-----------------|----------------|
| — | — | — |

## Skipped — not yet covered (no wireframe)

These belong to the v2.0 idea but have **no wireframe** yet, so no features are
produced for them. Listed here so the gap is explicit and tracked.

| Idea ref | Skipped scope | Why skipped |
|----------|---------------|-------------|
| §3.1.1 Step 3 | **Module Test** — test-taking screen + results (score, per-question review, weak spots) | No wireframe; overview shows the locked step only. |
| §3.4 / §5 | **"Explain my mistake"** AI panel (after wrong answers, practice & test) | No wireframe; not shown on exercise screens. |
| §3.4 | **AI answer verification** for `translation_active` (on-demand) | No wireframe. |
| §3.5 | **Level Test** — taking + results + weak-areas summary | No wireframe. |
| §3.6 | **Analyze Content** — paste text → Content Report → actions (Home "Analyze" button destination) | No wireframe. |
| §3.2 / US-05 | **Knowledge base** — vocabulary mastery view (Home "Knowledge" button destination) | No wireframe. |
| §3.2.3 / US-10 | **Add user vocabulary** | No wireframe. |
| §3.1.3 / US-02 | **Create custom module from a prompt** | No wireframe. |

Additionally, within `05-practice-session`, the **correct/incorrect feedback
visual states** are not in the wireframe (only input states are). The
answer-checking *behaviour* is specified in the idea and kept in scope; the
*visual treatment* of feedback is flagged as an open question in that feature.
