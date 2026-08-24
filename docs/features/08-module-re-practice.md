# 08 — Module Re-practice

![Status](https://img.shields.io/badge/status-open-blue?style=flat-square)

## 1. Purpose & Scope

Delivers the **user-facing side of Module Re-practice**: the ability to open a module you have already completed and start it over — grammar, practice, test — so that its proficiency signal can change. It answers a dead end the app currently has: the four-bar signal on the module map (`02-module-map`, #333) tells the user a module went badly and gives them nothing to do about it.

This is a deliberately **small** feature, because the backend does the work by resetting the module's progress record (→ `tome-ms-language` `F25`). A reset module returns to `available` and renders as a module the user has never started — so there is **no re-practice mode, no new screen, no new route and no new state** on the Module overview. What is left is three things: the **entry point** (completed modules must become reachable), the **trigger** on the Module overview, and the **confirmation** that guards it.

The confirmation is the load-bearing part. A reset is **irreversible** — there is no undo and no abandon — and while a pass is unfinished the module's proficiency score is hidden and the level test is closed. Everywhere else in the app a tap is recoverable; here it is not.

It reverses one decision recorded as resolved in `02-module-map`: *"Completed rows are non-interactive (same as locked)"*. Opening the module you want to re-practise is impossible while that holds. It also fixes a live defect: on desktop a completed module already renders a **"Keep practicing"** CTA (`page.tsx:203`) with no matching branch in `handleDesktopCta`, so the button does nothing.

**Out of scope**:
- The reset itself, the pass counter and the score recomputation (→ `tome-ms-language` `F25-module-re-practice.md`)
- The grammar, practice and test screens (→ `04-grammar-introduction`, `05-practice-session`, `06-module-test`); a re-practice pass renders through them identically, because to them it is a first pass
- The Module overview's ordinary step states (→ `03-module-overview`); this feature replaces one disabled CTA and adds nothing else
- The proficiency signal icon and its thresholds (→ `02-module-map`); this feature changes *when the score moves*, not how it is drawn
- `TomeLearningDashboardAPI` itself (→ `01-home-dashboard`); this feature adds one call to it

---

## 2. Core Concepts & Requirements

### 2.1. Core Concepts

| Term | Definition |
|------|-----------|
| Re-practice | Starting a completed module over from the beginning. Implemented as a reset of the user's progress for that module |
| Pass | One journey through a module, from first opening it to passing its test. Re-practice begins a new pass |
| Commit warning | The confirmation shown before a reset, stating what is irreversible and what is temporarily lost |

### 2.2. Requirements

#### 2.2.3. UI States

| # | Where | Condition | State |
|---|-------|-----------|-------|
| S1 | Module map | Module is `completed` | Row and card are **tappable** and navigate to the Module overview, as in-progress ones do. Styling is unchanged — completed still reads as completed |
| S2 | Module overview | `step === 'done'` | A **Re-practice** block below the step list explains what a pass involves: the module starts over from the grammar introduction and the proficiency score is replaced by the new result. Primary CTA becomes **"Re-practice this module"**, enabled, on both breakpoints |
| S3 | Commit warning | CTA tapped | Confirmation naming, in the user's words, the three things that are true: it starts over from the beginning, it cannot be undone, and the current proficiency score is hidden until the module is completed again. Confirm / Cancel |
| S4 | Module overview | Reset succeeded | The page refreshes in place and renders as a fresh module — step 1 available, CTA **"Start grammar"**. The user sees the reset happen rather than being teleported into it |
| S5 | Module overview | Reset refused — practice still open | The backend returns `409` with the open `sessionId`. The user is told they have an unfinished practice round and offered **"Finish practice round"**, which resumes it. The module is untouched; they can re-practise once the round is done |
| S6 | Module overview | Reset failed for any other reason | The page stays as it was with an inline error. A failed reset must never leave the module looking half-started |

After S4 there are no further re-practice states anywhere in the app. The module is an ordinary in-progress module and every screen treats it as one.

#### 2.2.4. Business Logic

**Entry point (the tappability reversal).**
`ModuleRow.tsx:86` and `ModuleCard.tsx:15` both define `isActive = status === 'in_progress' || status === 'available'`. Both gain `|| status === 'completed'`. This deliberately reverses `02-module-map`'s resolved Q2, and that document must be amended rather than left contradicting this one. Locked rows stay non-interactive — nothing here makes an unearned module reachable.

**The trigger.**
`deriveCtaInfo`'s `'done'` case currently returns `{ label: 'Module complete', disabled: true }`. It becomes the enabled re-practice CTA. On desktop the same case is reached differently: a completed module lands on `selectedStep: 'test'` via `deriveDefaultStep`, which labels the CTA `"Keep practicing"` because `stepStates.test !== 'available'` — but `handleDesktopCta` branches only on `test === 'available'` and `test === 'locked'`, so the button is inert. Rather than adding a third branch, the desktop CTA is folded into the same derivation as mobile, so the two breakpoints stop deciding their labels independently. That divergence is what produced the defect.

**The confirmation.**
Shown every time, never suppressed, never remembered. It must state all three consequences plainly:
- the module starts over from the grammar introduction — this is not a quick re-test;
- it **cannot be undone**;
- the module's current proficiency score is **hidden** until the module is completed again, and the level test is unavailable while the pass is open.

It must not imply the score can only improve. A pass walks the same ladder and is graded the same way, so the new score is a fair comparison — which means it can be lower.

**Refusal when work is still open.**
A reset is refused while a practice session or test attempt for that module is open (→ `F25`). This is reachable in ordinary use: finishing the ladder, starting one more practice round, abandoning it, and then passing the test leaves a completed module with an open session. The client must handle the `409` rather than treat it as an error — the user has unfinished work, not a broken app.

Recovery reuses machinery that already exists: `TomePracticeSessionAPI.startPracticeSession` resumes a session straight from a 409 body (`api/TomePracticeSessionAPI.ts:23-31`), so **"Finish practice round"** is the same call the practice CTA already makes. Nothing is discarded on the user's behalf; the round they abandoned is the round they come back to.

**Performing the reset.**
Confirm calls `POST /users/:userId/modules/:moduleId/rePractice` through `TomeLearningDashboardAPI`, then refetches `GET /me/progress` and re-renders. The existing `isStartingPractice`-style in-flight guard is reused so the call cannot be issued twice. The user is **not** auto-navigated into the grammar screen: landing back on a visibly reset overview is what confirms the destructive action actually happened.

**What this feature does not do.**
It does not track a pass, does not badge a re-practised module, and does not render progress differently for one. If any screen outside the module map's entry point needs to know a re-practice is happening, the reset model has leaked and the design should be revisited rather than patched.

---

## 3. Key Consumer Stories

| # | As a User, I want to… | So that… |
|---|----------------------|----------|
| US-01 | Open a module I have already completed | I can look at it again and act on a weak proficiency signal |
| US-02 | Start a completed module over from its own page | The signal that told me it went badly leads somewhere |
| US-03 | Be told exactly what I am giving up before I commit | I do not lose my score and my level test to a tap I did not understand |
| US-04 | Go through the module the same way I did the first time | There is nothing new to learn about how to re-practise |
| US-05 | See my proficiency signal change after I finish | The work is visibly rewarded |

---

## 4. Constraints and Assumptions

- **Constraint** — Only `completed` modules become tappable on the module map (v2.0 change — replaces `02-module-map`'s "completed rows are non-interactive"). Locked rows are unaffected.
- **Constraint** — Re-practice is entered **only** from the Module overview. The module map is the way in to the module; it never triggers a reset.
- **Constraint** — The confirmation is mandatory and unconditional. There is no "don't ask again".
- **Constraint** — A `409` from the reset is a first-class state, not an error toast: it must name the unfinished practice round and offer to resume it.
- **Constraint** — Mobile and desktop derive the CTA from one shared derivation (vs today, where `deriveCtaInfo` and `desktopCtaLabel` diverge — the cause of the dead desktop button).
- **Constraint** — No new screen and no new route. Every state above belongs to a screen that already exists.
- **Assumption** — `POST .../rePractice` exists and `GET /me/progress` reports a reset module as `available` (owned by `tome-ms-language` `F25`). Nothing here works before that ships.
- **Assumption** — A reset module reading as "available" on the module map is acceptable even though the level then shows two non-locked modules, contradicting `02-module-map`'s "exactly one module is the user's current focus". Visual only, and it self-heals when the pass finishes — but it has not been through a design pass.
- **Assumption** — The level progress header visibly dropping by one (e.g. 8/12 → 7/12) reads as honest rather than as data loss. Untested, and the most likely thing to alarm a user who has just re-practised.

---

## 5. Open Questions

| # | Question | Resolution |
|---|----------|-----------|
| OQ-01 | How does the user reach the module page of a completed module, given completed rows are non-interactive? | **Resolved**: completed rows and cards become tappable. `02-module-map` is amended. |
| OQ-02 | Does re-practice need its own screen, route or mode? | **Resolved**: no. The backend resets the module, so it renders through the existing flow as a fresh module. |
| OQ-03 | After a reset, does the app drop the user into the grammar screen or back on the overview? | **Resolved**: back on the overview, refreshed. Seeing the module reset is the confirmation that an irreversible action succeeded. |
| OQ-04 | Should the module map distinguish a re-practised score from an original one? | **Open**: `passNumber` is available on the proficiency object. `02-module-map` currently renders every basis identically and there is a case for keeping it that way. |
| OQ-05 | Should a reset module be visually distinguished from a never-started one on the module map? | **Open**: they are identical today, which is the point of the reset model — but a level showing two non-locked modules may need a design answer. |
| OQ-06 | Should the overview show *why* a module scored badly — which items were missed — before asking the user to redo the whole thing? | **Open**: it is the obvious next question after deciding to re-practise, and nothing in this feature answers it. Arguably the more valuable feature of the two. |
