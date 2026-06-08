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
| Module overview | Step list | Three step rows — **Grammar** (3 concepts), **Practice** (20 a round · no pressure), **Module Test** (30–40 questions · 80% to pass) — each with a numbered medallion and a state element: available → "Start"; upcoming → muted; locked → "4h after practice" lock tag. | Reflects per-step state; the available step is the entry point. |
| Module overview | Practice coverage bar | On the **active Practice step row only**: a progress `Bar` + "*seen* / *total* words" count, showing how many of the module's vocabulary items the user has encountered across practice sessions so far (e.g. "18 / 30 words"). | Fills as the user completes practice sessions; reaches full when Step 2 completes and the test-unlock countdown begins. |
| Module overview | Primary CTA | Full-width dark button, e.g. "Start grammar" / "Continue practice", reflecting the current actionable step. | Navigates into the current step (Grammar `04` / Practice `05`). |

**Additional Notes:**
- **Loading**: skeleton for header + step list while module + progress load.
- The Test step is always shown but, in this breakdown, only as a **locked/upcoming** row — tapping it (when unlocked) leads to the skipped Module Test feature.
- Step CTA label/target adapt to where the user is: "Start grammar" → "Continue practice" → (locked) "Test unlocks in …". While practice is active, the CTA reads "Continue practice" and the coverage bar communicates remaining coverage.
- **Practice is a loop**: because Step 2 runs multiple sessions until full vocabulary coverage (§3.1.1), the overview is the hub the user returns to between practice sessions; its coverage bar is the persistent indicator of how close Step 2 is to completing.

## 4. Business Logic

- The module runs through **3 ordered steps** (§3.1.1): Grammar Introduction → Contextual Exercises (Practice) → Module Test.
- **Step gating**:
  - Grammar is available immediately.
  - Practice becomes available after Grammar has been seen.
  - **Practice completes** only when the user has reached **full vocabulary coverage** — every module vocabulary item shown at least once, accumulated across however many sessions Step 2 takes (§3.1.1). The Practice step stays `in_progress` (showing the coverage bar) until then.
  - The **Module Test is locked** until `testUnlockDelayHours` (default 4h) have elapsed after **Practice completion** — i.e. measured from `practiceCompletedAt` (the moment full coverage is reached), not from the end of any single session. The lock tag communicates this delay; once elapsed the step becomes available.
- **Coverage bar** on the active Practice step shows `vocabularyItemsPracticed.length / total module vocabulary items` (§3.1.1 / data model `UserModuleProgress`).
- Configurable display values come from module parameters (§3.1.2): practice session size (20), test question count (30–40), pass threshold (80%), unlock delay (4h).
- The current actionable step drives the primary CTA's label and destination.
- **Mastery is not updated on this screen** — it is a read-only hub. Mastery is updated inside the Practice (`05`) and Module Test steps, continuously (§3.1.1).

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]`. | Module-scoped hub. |
| 2 | Render step states from UserModuleProgress + timing (practice-completed timestamp + unlock delay). | Lock logic is per-user and time-based. |
| 3 | Step parameters (sizes, thresholds, delays) read from module config, not hard-coded. | §3.1.2 configurable. |
| 4 | Reuse `TomeModuleAPI` (module document) and `TomeLearningDashboardAPI` (per-user progress, owned by `01-home-dashboard`), fetched in parallel with `Promise.all`. | Avoids a waterfall — both are needed before any content renders; reuses the same progress endpoint as `01`/`02` rather than adding a module-specific progress call. |
| 5 | Module number (01, 02 …) is derived from the index of `moduleId` in `progress.modules`, not from the module document (which has no numeric position field). | The ordered per-level module list from `GET /me/progress` is the authoritative source, matching how `ModuleRow` computes the number on the module-map screen. |
| 6 | Lock label: static `${testUnlockDelayHours}h after practice` when step = practice (test not yet reached); live countdown when step = test and `testUnlocksAt` is in the future. | Static text is accurate and avoids a timer before the user has even completed practice; the countdown shows only once the timer is actually running. |
| 7 | CTA "Start test" is rendered but disabled. | The Module Test feature is out of scope; the placeholder avoids a dead-end UX and will be wired up when that feature ships. |
| 8 | Wrap backend calls in `/api` classes; `RoundButton`/buttons per style guide. | Project conventions. |

### API Integrations

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Module header, Scope chips, Step list | `GET /modules/:id` (`tome-ms-language`, via `TomeModuleAPI.getModule`) | Returns the module document: theme, communication goal, grammar-concept IDs, vocabulary count, and the configurable step parameters (`practiceSessionSize`, `testQuestionCount`, `testPassThreshold`, `testUnlockDelayHours`). |
| Step list, Practice coverage bar, Primary CTA | `GET /me/progress` (`tome-ms-language`, via `TomeLearningDashboardAPI.getMeProgress`, shared with `01`/`02`) | Returns the user's per-module progress entries (status, current step, completion %, `testUnlocksAt`). Drives step lock/available/locked states, the module's numeric index, the coverage-bar inputs, and the primary CTA's target step. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | Theme, goal, grammar chips and word count render correctly. | US-03. |
| 2 | The three steps show correct available/upcoming/locked states. | §3.1.1. |
| 3 | The test step shows the unlock-delay lock tag; the unlock timer is measured from full-coverage completion (`practiceCompletedAt`), not from a single session. | Spaced repetition. |
| 4 | Primary CTA launches the correct current step. | J3/J4. |
| 5 | Returning to the overview after grammar/practice reflects updated step states. | Hub behaviour. |
| 6 | While Practice is active, the coverage bar shows seen / total words and fills as sessions are completed. | §3.1.1 coverage gate. |
| 7 | Practice stays `in_progress` until full vocabulary coverage is reached; only then does the test-unlock countdown begin. | §3.1.1. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Once the test is unlocked, does the CTA point at the (skipped) Test, or does the step row handle it? | Depends on Module Test feature design. CTA currently shows "Start test" (disabled) until that feature is built. |
| 3 | Can the user re-enter Grammar or re-run Practice after completing them? | Affects step row interactivity post-completion. Currently completed steps render as a muted row with a checkmark medallion; they are not tappable. |
