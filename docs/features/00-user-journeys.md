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
map → **variant A (Vertical list)**; Practice complete → **variant A (Momentum
ring / Round complete)** + **variant C (Coverage milestone)** as the two states of
one end-of-round screen. The wireframe also contains alternative treatments (Home
A/B, Map B/C, Practice-complete B "Recap" / D "Quiet sheet") which are **not** the
spec'd design — `practice-complete-app.jsx` pins A and C as the chosen designs.

> Legacy note: the repo already contains `app/language-learning/*` from the *old*
> (pre-v2.0) design (vocabulary-practice, sentence-practice, sources). It is not
> the basis for these features and is expected to be replaced by the v2.0 build.

## Journeys

| # | Journey | Goal | Screen sequence |
|---|---------|------|-----------------|
| J1 | Check standing & continue | See my CEFR level + progress and resume my current module | Home dashboard → (Continue) → Module overview |
| J2 | Browse the level & start a module | See all modules of my level and open the active one | Home dashboard → Module map → Module overview |
| J3 | Learn a module's grammar | Read the module's grammar concepts before practising | Module overview → Grammar intro |
| J4 | Practise a module | Work through practice rounds until every module word is covered | Module overview → Practice session → Practice complete (round recap → *Practice another round* loops back, or *Back to module*) → … → Practice complete (coverage milestone) → Module overview |
| J5 | Take the module test | Pass the gated, scored test to complete the module and unlock the next | Module overview → Module test (locked countdown → ready → in-test → submit → result) → (Review) → Home / Module overview |
| J6 | Take the level test | Once all modules of the level are complete, pass the level-wide test to be promoted to the next CEFR level | Home dashboard → (Take the Level Test) → Level test (ready → in-test → submit → result: pass promotes / fail retry) → (Review) → Home (promoted level) |

## Screen Inventory

Every screen reachable in any journey above, mapped to its owning feature.

| Screen | Route (proposed) | Owning Feature (capability) | Notes |
|--------|------------------|-----------------------------|-------|
| Home dashboard | `/language-learning` | `01-home-dashboard` | Variant C (Level track). Motivational hub. |
| Module map | `/language-learning/level/[level]` | `02-module-map` | Variant A (Vertical list). Modules of the current level. |
| Module overview | `/language-learning/module/[moduleId]` | `03-module-overview` | Module hub: theme, goal, 3-step flow, lock states. |
| Grammar intro | `/language-learning/module/[moduleId]/grammar` | `04-grammar-introduction` | Step 1 — paged instructional concept cards. |
| Practice session | `/language-learning/module/[moduleId]/practice/[practiceId]` | `05-practice-session` | Step 2 — one screen rendering the 6 exercise types within a session; sessions repeat until full module vocabulary coverage. |
| Practice complete | `/language-learning/module/[moduleId]/practice/[practiceId]/results` | `05-practice-session` | End-of-round recap. Two states: **Round complete** (every round before full coverage) and **Coverage milestone** (only when the round reaches full coverage). User chooses *Practice another round* or *Back to module*. |
| Module test | `/language-learning/module/[moduleId]/test` | `06-module-test` | Step 3 — gated, scored flow as internal phases: locked → ready → in-test → submit → result (pass/fail) → review. Reuses the practice exercise interface. |
| Level test | `/language-learning/level-test` | `07-level-test` | Level-wide, gated, scored flow as internal phases: ready → in-test → submit → result (pass promotes CEFR level / fail with retry cooldown) → review. Entry CTA lives on the Home dashboard (owned by `01`); the in-test / submit / fail / review phases reuse `06-module-test`. |

## Desktop responsive layout

The app is a **single responsive codebase** branching at the **layout** level at
a Tailwind `lg:` breakpoint. Below `lg:` the existing phone layout is unchanged;
above it the app re-lays into a browser-width layout:

- **Persistent left sidebar** replaces the mobile `TomeHeader` hamburger button,
  which on mobile navigates to a full-screen `/menu` page instead of opening a
  slide-in panel. Contains brand, vertical nav (Home, Modules, Analyze,
  Knowledge, Sources), Settings, and a level badge. Only Home and Modules
  navigate; others are decorative placeholders.
- **Home dashboard** → multi-column layout: page header with weekly session stat,
  level path, two-column Continue card + weekly chart band, stat tiles, "Up next"
  4-card module strip.
- **Module map** → 4-column responsive grid of module cards instead of the mobile
  vertical list.
- **Module flow (two-pane)** → on desktop, Module overview and its active step
  render together: a left rail (module meta + 3 steps) and a right content pane
  (grammar concepts, practice status, or test locked/ready state).

On desktop, J1/J3/J4 collapse "Module overview → step" into the single two-pane
Module flow (mobile journeys unchanged).

Wireframe reference: `docs/ui-design/tome-language-learning/desktop-*.jsx` +
`Tome Desktop.html`.

## Cross-cutting shared components

The desktop sidebar (`DesktopSidebar`) is a shared layout component used across
all screens on desktop viewports.

| Shared component | Used by screens | Owning Feature |
|------------------|-----------------|----------------|
| DesktopSidebar | All (via root layout), desktop only | Cross-cutting (layout) |
| TomeHeader + `/menu` full-screen page | All (via root layout), mobile only | Cross-cutting (layout) |

## Skipped — not yet covered (no wireframe)

These belong to the v2.0 idea but have **no wireframe** yet, so no features are
produced for them. Listed here so the gap is explicit and tracked.

| Idea ref | Skipped scope | Why skipped |
|----------|---------------|-------------|
| §3.4 / §5 | **"Explain my mistake"** AI panel (after wrong answers, practice & test) | No wireframe for the panel; the button is rendered (stub) in practice & test. |
| §3.4 | **AI answer verification** for `translation_active` (on-demand) | No wireframe. |
| §3.5 | **Level Test — weak-areas summary** (the post-test breakdown of grammar concepts / vocabulary the user underperformed on) | No wireframe. The Level Test flow itself is now covered by `07-level-test` (wireframe: `level-test-screens.jsx`); only the weak-areas summary lacks a design. The `GetLevelTestReview` endpoint already returns the data, so it can be folded into the Review phase once a design exists. |
| §3.6 | **Analyze Content** — paste text → Content Report → actions (Home "Analyze" button destination) | No wireframe. |
| §3.2 / US-05 | **Knowledge base** — vocabulary mastery view (Home "Knowledge" button destination) | No wireframe. |
| §3.2.3 / US-10 | **Add user vocabulary** | No wireframe. |
| §3.1.3 / US-02 | **Create custom module from a prompt** | No wireframe. |

