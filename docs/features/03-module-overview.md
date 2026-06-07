# Module Overview — the module hub

![Status](https://img.shields.io/badge/status-implemented-brightgreen?style=flat-square)

## 1. Purpose & Scope

Delivers the **Module overview**: the hub a user lands on when they open a module.
It presents the module's theme, communication goal, the grammar concepts and
vocabulary scope it covers, and the **three-step execution flow** (Grammar →
Practice → Module Test) with each step's lock/availability state. From here the
user starts the current step. Owns this one screen end-to-end.

Design: `module-screens.jsx` → `ModuleOverview`.

Participates in journeys **J1**, **J3** and **J4** as the branch point into the
module's steps. It is a hub the user returns to between steps (notably while the
test is locked).

**Out of scope**:
- The Grammar intro flow (owned by `04-grammar-introduction`).
- The Practice session (owned by `05-practice-session`).
- The **Module Test** screen and results — **skipped** (no wireframe); this screen only renders the locked Test step.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | See what a module is about (theme, goal, grammar, word count) | I know what I'll learn (US-03) |
| 2 | See the module's steps and which are available, upcoming or locked | I understand the path through the module |
| 3 | Start the current step from here | I can begin learning |
| 4 | Understand why the test is locked | I accept the spaced-repetition delay (§3.1.1) |

## 3. Interfaces

**Screen(s):** Module overview, per `module-screens.jsx`. `TomeScreen` titled "Module".

**Components:**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Module overview | Module header | Kicker (e.g. "A1·01 · Identity & introductions"), large module title, and the communication-goal description. | Renders from the module document. |
| Module overview | Scope chips | Pill chips for the module's grammar concepts (e.g. "Present tense", "Pronouns", "Word order") + a "N words" count. | Summarises grammar focus and vocabulary set size. |
| Module overview | Step list | Three step rows — **Grammar** (3 concepts), **Practice** (15 exercises), **Module Test** (20 questions · 80% to pass) — each with a numbered medallion and a state element: available → "Start"; upcoming → muted; locked → "4h after practice" lock tag. | Reflects per-step state; the available step is the entry point. |
| Module overview | Primary CTA | Full-width dark button, e.g. "Start grammar", reflecting the current actionable step. | Navigates into the current step (Grammar `04` / Practice `05`). |

**Additional Notes:**
- **Loading**: skeleton for header + step list while module + progress load.
- The Test step is always shown but, in this breakdown, only as a **locked/upcoming** row — tapping it (when unlocked) leads to the skipped Module Test feature.
- Step CTA label/target adapt to where the user is: "Start grammar" → "Continue practice" → (locked) "Test unlocks in …".

## 4. Business Logic

- The module runs through **3 ordered steps** (§3.1.1): Grammar Introduction → Contextual Exercises (Practice) → Module Test.
- **Step gating**:
  - Grammar is available immediately.
  - Practice becomes available after Grammar has been seen.
  - The **Module Test is locked** until `testUnlockDelayHours` (default 4h) have elapsed after Practice completion. The lock tag communicates this delay; once elapsed the step becomes available.
- Configurable display values come from module parameters (§3.1.2): practice session size (15), test question count (20), pass threshold (80%), unlock delay (4h).
- The current actionable step drives the primary CTA's label and destination.
- **Mastery is not updated** anywhere on this screen (only during the Test, §3.1.1).

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]`. | Module-scoped hub. |
| 2 | Render step states from UserModuleProgress + timing (practice-completed timestamp + unlock delay). | Lock logic is per-user and time-based. |
| 3 | Step parameters (sizes, thresholds, delays) read from module config, not hard-coded. | §3.1.2 configurable. |
| 4 | Wrap backend calls in an `/api` class; `RoundButton`/buttons per style guide. | Project conventions. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | Theme, goal, grammar chips and word count render correctly. | US-03. |
| 2 | The three steps show correct available/upcoming/locked states. | §3.1.1. |
| 3 | The test step shows the unlock-delay lock tag until the delay elapses. | Spaced repetition. |
| 4 | Primary CTA launches the correct current step. | J3/J4. |
| 5 | Returning to the overview after grammar/practice reflects updated step states. | Hub behaviour. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Once the test is unlocked, does the CTA point at the (skipped) Test, or does the step row handle it? | Depends on Module Test feature design. CTA currently shows "Start test" (disabled) until that feature is built. |
| 3 | Can the user re-enter Grammar or re-run Practice after completing them? | Affects step row interactivity post-completion. Currently completed steps render as a muted row with a checkmark medallion; they are not tappable. |

## 8. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Fetch `GET /modules/:id` and `GET /me/progress` in parallel with `Promise.all`. | Avoids waterfall; both are needed before any content renders. |
| 2 | Module number (01, 02 …) derived from the index of `moduleId` in `progress.modules`. | The module document has no numeric position field; the ordered list from the progress endpoint is the authoritative source, matching how ModuleRow computes the number on the module-map screen. |
| 3 | Lock label: static `${testUnlockDelayHours}h after practice` when step=practice (test not yet reached); live countdown when step=test and testUnlocksAt is in the future. | Static text is accurate and avoids a timer before the user has even completed practice. The countdown is shown only once the timer is actually running. |
| 4 | CTA "Start test" is rendered but disabled. | The Module Test feature (04) is out of scope; the button placeholder avoids a dead-end UX and will be wired up when that feature ships. |
