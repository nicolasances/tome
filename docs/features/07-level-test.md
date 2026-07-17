# Level Test — CEFR-level assessment (gated, scored, promotes the level)

![Status](https://img.shields.io/badge/status-planned-blue?style=flat-square)

## 1. Purpose & Scope

Delivers the **Level Test**: the CEFR-level sibling of the Module Test (§3.5). It
is the cross-module assessment that, on passing, **promotes the learner to the
next CEFR level** (A1 → A2 → …). Like the Module Test it is one uninterrupted job
that runs through a sequence of phases: **ready** → **in-test** (answering
questions) → **submit** (confirmation) → **result** (pass / fail) → **review**
(every question, your answer vs. correct). Because these phases form a single
continuous flow the user moves through without choosing a separate destination,
they are **one capability / one feature** spanning several screens — not one
feature per screen.

The Level Test differs from the Module Test in only three places, and reuses
everything else as-is:
- **Gate & entry** — it is not gated by a per-module spaced-repetition lock. It
  becomes available on the Home dashboard once **all curated modules at the
  current level are `completed`** (the entry CTA is owned by
  `01-home-dashboard`; this feature owns the flow it launches).
- **Ready intro** — the scope is the **whole level** ("40 questions, sampled
  across all 12 modules"), and passing **promotes** the user rather than
  completing a module.
- **Promotion result** — the pass screen shows the **A1 → A2 promotion** and
  routes into the new level.

The **in-test, submit, and review phases are identical to the Module Test
(`06-module-test`) and are reused as-is** — same `TestShell` (linear question
bar), same six exercise renderings from practice (`05-practice-session`), same
`ResultSheet` / `AnswerBox` / `Verdict` immediate per-answer feedback, same
Submit confirmation, same Review list. The test is scored (**75% to pass** — see
§4 and OQ-1), single-pass, and mastery updates exactly as in practice.

Design: `level-test-screens.jsx` (`HomeLevelTest` — the entry CTA, owned by
`01-home-dashboard`; `LevelTestReady`; `LevelTestPass`). The in-test / submit /
fail / review phases reuse `test-screens.jsx` (`TestShell`, `TestSubmit`,
`TestResultFail`, `TestReview`, `ReviewCorrect`, `ReviewWrong`) and the shared
exercise primitives from `exercise-screens.jsx`.

Participates in journey **J6** (take the Level Test). It is launched from the
Home dashboard's "Take the Level Test" CTA (`01-home-dashboard`) and returns the
user to Home (now on the promoted level) or, on fail, keeps them on the current
level with a retry countdown.

**Out of scope**:
- The **Home entry CTA** ("Level Test unlocked · A1 → A2" card + "Take the Level
  Test" button) and its eligibility gate — owned by `01-home-dashboard`, which
  owns the Home screen the CTA lives on. This feature owns the full-screen flow
  the CTA navigates to. (Mirrors how `03-module-overview` owns the Test step row
  and `06-module-test` owns the flow.)
- The **in-test exercise bodies' source design** and the Module Test's
  `TestShell` / `TestSubmit` / `TestResultFail` / `TestReview` **source design**
  — owned by `05-practice-session` and `06-module-test`. This feature **reuses**
  those renderings; it does not redefine them.
- **"Explain my mistake"** AI panel — the *button* is rendered on wrong states
  (in-test `ResultSheet`, `ReviewWrong` row); the panel it opens is **skipped**
  (no wireframe; tracked with practice's stub, issue #275).
- **Weak-areas summary** (idea §3.5 / US-08) — **skipped**: no wireframe covers
  it. The backend already returns weak vocabulary/grammar in the review response,
  so it can be added later without a data change. See `00-user-journeys.md` →
  *Skipped* and OQ-3.
- The **Level Test bank seeding** (AI generation of the ~60-exercise level bank)
  — a backend/dev-time concern in `tome-ms-language`, not a frontend screen.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | Take a Level Test once all modules of my level are complete | I can unlock the next CEFR level (US-06) |
| 2 | See what the test involves before I start (question count, pass threshold, that it promotes me) | I know what I'm walking into |
| 3 | Answer a run of questions sampled across the whole level's vocabulary and grammar | I'm assessed on everything the level taught |
| 4 | Deliberately finish the test and reveal my overall result | I trigger scoring on purpose, not by accident |
| 5 | See my score, whether I passed, and — on a pass — that I've been promoted to the next level | I know the level is complete and the next one is open (US-06) |
| 6 | Retry the test after a cooldown if I fail | I'm not blocked; I can keep improving (US-07) |
| 7 | Review every question with my answer vs. the correct one | I learn from what I got wrong (US-04) |
| 8 | Have my test answers count towards my mastery scores | my progress reflects the test, same as practice (US-05) |

## 3. Interfaces

**Screen(s):** Level test, per `level-test-screens.jsx` + reused
`test-screens.jsx`. One route (`/language-learning/level-test`) rendering all
phases as internal states (ready / in-test / submit / result / review). The
in-test and review phases use the **"Level Test" / "Review"** `TomeScreen`
chrome; the in-test phase uses `TestShell` (linear `Bar`, "q / total" counter).

**Components:**

| Screen (phase) | Component Name | Description | Expected Behavior |
|----------------|----------------|-------------|-------------------|
| Ready | Ready summary (`LevelTestReady`) | Level kicker ("A1 · Foundation → A2"), a "Ready to level up?" headline + intro line, and a 4-row feature list ("40 questions · sampled across all 12 modules", "75% to pass · promotes you to A2", "Instant feedback", "Counts toward mastery") with icon medallions, plus a primary "Start Level Test" button. | Shown when the user is eligible and no attempt is in progress. Question count / pass threshold / next level come from backend config + `/me` progress. "Start Level Test" begins the test (`POST …/levelTests`). |
| In-test | Test shell (`TestShell`) | **Reused from `06-module-test`.** Top chrome: "Level Test" kicker, a "q / total" counter, a single **linear** progress `Bar`, and the per-exercise instruction label. Hosts the exercise body + footer. | The bar advances one step per answered question, monotonically 1 → total. No mastered/deferred segmentation. |
| In-test | Exercise bodies (MC, Reorder, Fill-blank, Conjugation, Error-correction, Translation) | **Reused as-is from `05-practice-session`.** The same six exercise renderings; the start response returns the full `Exercise[]` objects, identical in shape to a practice session. | Input, inline correct/wrong coloring and `AnswerBox` behave identically to practice. |
| In-test | Result sheet (`ResultSheet`) | **Reused from practice/module test.** After every answer, slides up with **correct** (green `Verdict`) or **wrong** (red `Verdict`, correct answer revealed, `SheetBtn` actions) state. | Immediate per-answer feedback (§4). `ContinueBtn` advances. "Explain my mistake" on wrong states is a stub. "Check with AI" on a wrong Translation is **also a stub for now** — the verify endpoint does not yet accept a level-test attempt (OQ-2). |
| Submit | Submit confirmation (`TestSubmit`) | **Reused from `06-module-test`.** "All answered · N / N", a dot grid of the N questions, a finish-and-reveal prompt, and a single primary "Submit test" button. No "Back to questions". | Shown after the last question. "Submit test" triggers `POST …/levelTests/:attemptId/submit` (scoring + finalisation + promotion). |
| Result · pass | Promotion result (`LevelTestPass`) | Score `Ring` (e.g. 88% · 35/40) with celebration ticks, an **A1 → A2 promotion** badge pair, a "You're now A2!" headline, a "Foundation is complete. The Elementary modules are now open." line, a `ThresholdBar` at the pass marker, and two buttons: **"Start A2"** (→ **Home dashboard**, `/language-learning`) and **"Review answers"** (→ Review phase). | Shown when score ≥ pass threshold. The user's CEFR level has been advanced server-side; "Start A2" returns to the Home dashboard, which on its own load now shows the new level as current and points its Continue CTA at the first module of that level (OQ-4). |
| Result · fail | Fail result (`TestResultFail`) | **Reused from `06-module-test`.** Score `Ring` (e.g. 60% · 24/40), "So close" headline, encouragement referencing the pass threshold, a `ThresholdBar`, a "Retry in mm:ss" lock pill, and a "Review answers" button. **No promotion badge, no module-unlocked line.** | Shown when score < pass threshold. The user stays on the current level. Retry is locked until the cooldown elapses; the pill counts down to `retryAvailableAt`. **Exit is the standard `TomeScreen` header back arrow** (top-left), which returns to Home — no dedicated "Home"/"Done" button is added to the body. |
| Review | Review header + list (`TestReview`, `ReviewCorrect`, `ReviewWrong`) | **Reused from `06-module-test`.** "Review" `TomeScreen`: header with "X / N correct", a percentage pill and a `Bar`; then a scrollable list of every question. Correct rows: green `Verdict` + prompt + answer. Wrong rows: red `Verdict` + prompt + "You" (struck-through) vs. "Answer" (correct) + `SheetBtn` actions. | Reachable from either result screen. Lists all N questions in order; wrong rows expose the (stubbed) "Explain my mistake" action. The weak-areas summary is **not** rendered here (skipped, OQ-3). |

**Additional Notes:**
- **Phase routing on entry**: opening the level-test route resolves the phase
  from the backend eligibility call `GET /users/:userId/levelTest/eligibility`
  (§5.1) — an `activeAttemptId` → **resume** into the
  right phase/question (via `GET …/levelTests/:attemptId`); eligible with no
  active attempt → **Ready**; a cooldown in effect → route back to Home (or show
  the fail/retry state) rather than a startable Ready. A just-finished attempt →
  **Result/Review**.
- **Loading**: the attempt is created server-side on "Start Level Test"; the
  response contains the full ordered question list. No per-question spinner; no AI
  in selection. The Ready chrome renders from the eligibility + `/me` data
  already loadable on entry.
- **Result reuse of exercise feedback**: the in-test `ResultSheet` / `AnswerBox`
  treatments are identical to practice — this feature introduces no new feedback
  visuals, only the "Level Test" header + linear bar (both already shared with the
  module test).
- **Resume**: an interrupted test resumes into the correct phase/question rather
  than restarting; the authoritative answer log reconstructs it (parity with the
  module test and practice).
- **Empty/edge states**: a user not yet eligible (modules incomplete) never
  reaches this route — the Home CTA is not shown (`01-home-dashboard`). Reaching
  the route directly while ineligible should redirect to Home.

## 4. Business Logic

- **Eligibility / gate (§3.5)**: the Level Test is available when **all curated
  (non-user-generated) modules at the user's current level are `completed`**.
  User-generated modules do not block; a level with no curated modules is not
  eligible. This rule is **not** evaluated client-side — the authoritative gate is
  a backend call to `GET /users/:userId/levelTest/eligibility` on `tome-ms-language`
  (delegate `GetLevelTestEligibility`; full request/response in §5.1). The client
  reads the returned verdict rather than computing eligibility itself.
- **Question set**: **40 questions** (`LEVEL_TEST_SIZE`) drawn from the
  **level-wide exercise bank** (not the module banks), using the **same
  mastery-aware selection (§3.4.3)** as module sessions — lowest-mastery
  vocabulary and grammar prioritized — **without** the practice-only coverage
  override. Selection is server-side; the client renders the ordered list.
- **Immediate per-answer feedback**: each answer is checked the moment it is
  given and the `ResultSheet` / `AnswerBox` reveal correctness, exactly as in
  practice and the module test.
- **Single pass, no retry-until-correct**: the test does **not** re-present missed
  questions. The progress bar is linear 1 → N; each question is answered once and
  that answer counts toward the score.
- **Submit step (finalise & reveal)**: after the last question, the Submit phase
  triggers `POST …/submit` to compute the aggregate score, run mastery updates,
  finalise the attempt, and — on a pass — advance the CEFR level. Answers are
  already recorded per-question, so there is nothing to lock; the screen is a
  deliberate finish-and-reveal step with a single "Submit test" action.
- **Scoring & pass/fail (§3.5)**:
  - Score = % of the 40 questions answered correctly on their single attempt;
    unanswered questions count as wrong.
  - **Pass** when score ≥ **75%** → the backend **promotes the user to the next
    CEFR level** (`advancedTo`); no-op if already at C2. The pass screen shows the
    promotion. The threshold itself is a **backend-only constant**
    (`LEVEL_TEST_PASS_THRESHOLD` in `tome-ms-language`'s `Config.ts`): it is used
    server-side to compute `passed` and is **never sent to the frontend**. The
    client **does not store it and never computes pass/fail** — it renders the
    returned `passed`. (Caveat: the *display* values "75% to pass" / "40 questions"
    on the Ready screen and the `ThresholdBar` marker are a separate concern — no
    endpoint serves them, so today they are hardcoded presentational constants.
    See §5.1 *Missing* and OQ-5.)
  - **Fail** → the attempt (score + timestamp) is recorded; retry is locked for a
    **30-minute cooldown** (`LEVEL_TEST_RETRY_DELAY_MINUTES`) since the last
    submitted attempt; a retry draws a **new** selection from the bank. See OQ-1
    (idea says "no cooldown"; the backend implements 30 min — backend is
    authoritative).
- **Mastery updates (§3.5)**: the test updates mastery scores for the linked
  vocabulary item / grammar concept of each answered question, exactly as
  practice does — applied server-side on submit.
- **The test is sample-based** — it does not need to cover every vocabulary item
  in the level; it draws 40 from the bank.
- **Active-attempt guard**: `POST …/levelTests` returns **409** with the active
  `attemptId` if an un-submitted attempt already exists; the client resumes it
  rather than starting a new one.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/level-test`; all phases are internal states of this one route. | Mirrors `06-module-test` — the test is one continuous job. The Level Test is level-scoped, not module-scoped, so it is not nested under `/module/[moduleId]`. |
| 2 | Reuse the Module Test's `TestShell`, `TestSubmit`, `TestResultFail`, `TestReview` and the practice exercise bodies rather than re-implementing them. Only `LevelTestReady` and `LevelTestPass` are new. | The wireframe states the in-test / submit / review screens are identical to the Module Test; reuse keeps them in lockstep and matches the explicit reuse note in `level-test-screens.jsx`. |
| 3 | Entry CTA lives on the Home dashboard (owned by `01-home-dashboard`), gated by `GET …/levelTest/eligibility`; this feature owns the flow the CTA launches. | Parity with module test (`03` owns the Test row, `06` owns the flow). The CTA is a component of the Home screen, not a screen of its own. |
| 4 | Question selection, scoring, pass/fail, level promotion, retry cooldown and mastery updates are all computed **server-side** (`StartLevelTest` / `SubmitLevelTest`); the client renders the returned data. | Keep scoring + promotion atomic on the server; avoid client-side score tampering. Consistent with the module test. |
| 5 | Answer checking is server-side; the client submits the raw answer and renders `{ isCorrect, correctAnswer }`. | §3.4.3 bounded-cost rule, identical to practice / module test. |
| 6 | Add a `TomeLevelTestAPI` frontend wrapper around the six `tome-ms-language` level-test endpoints, mirroring the **existing** `TomeModuleTestAPI` (`api/TomeModuleTestAPI.ts`). | Project convention: one API class per backend area under `/api`. `TomeModuleTestAPI` is already implemented with the same six-method shape (eligibility / start / get / answer / submit / review) and their response interfaces — copy its structure. Only `TomeLevelTestAPI` is new. |
| 7 | **Pass threshold = 75%**, not the "80%" shown in `level-test-screens.jsx`. | The implemented backend (`LEVEL_TEST_PASS_THRESHOLD = 75`) and idea §3.5 both say 75%; the wireframe copy is stale. The Ready feature list and the `ThresholdBar` pass marker must read 75%. (OQ-1.) |
| 8 | The **authoritative threshold is backend-only** and is never sent to the client — the frontend renders the server-computed `passed`, never recomputes pass/fail, and does not store the threshold for the decision. The *displayed* "75%" / "40 questions" are, until an endpoint exists, hardcoded presentational constants. | Single source of truth for the decision stays on the server (no client-side score tampering). The display values are the one place the numbers currently leak into the frontend — flagged as Missing + OQ-5 so they don't silently drift. |
| 9 | **Weak-areas summary is skipped** (no wireframe); the Review phase reuses the module-test review list only. | Per the create-features partial-wireframe rule — do not invent an unspecified screen. The review endpoint already returns the data, so it can be added later without a backend change. (OQ-3.) |

### 5.1 API Integrations

All endpoints are on `tome-ms-language` (basepath
`NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT`). The Level Test backend
(`tome-ms-language`, delegates under `src/dlg/levelTests`) is **implemented and
route-registered** in that service's `index.ts`. A frontend wrapper
(`TomeLevelTestAPI`) does **not** exist yet and must be added. `:userId` is the
caller's own id (from `GET /me`).

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Phase resolution on entry; resume gate; (Home CTA gate, owned by `01`) | `GET /users/:userId/levelTest/eligibility` (`GetLevelTestEligibility`) | Authoritative eligibility: `{ eligible, reason?, retryAvailableAt?, remainingMs?, activeAttemptId? }`. `activeAttemptId` → resume; `retryAvailableAt` → cooldown; `eligible:true` with neither → startable Ready. |
| Ready → "Start Level Test" | `POST /users/:userId/levelTests` (`StartLevelTest`) | Starts an attempt: server-side mastery-aware selection of 40 exercises from the level bank; returns `{ attemptId, cefrLevel, exercises: Exercise[], startedAt }`. **409** (with `attemptId`) if an active attempt exists → resume it. 400 if not all curated modules complete or cooldown not elapsed; 404 if no level bank. |
| Resume into the correct phase/question | `GET /users/:userId/levelTests/:attemptId` (`GetLevelTest`) | Full attempt state (ordered exercises + answers so far + status) to resume an interrupted, not-yet-submitted test. |
| In-test answer submission | `POST /users/:userId/levelTests/:attemptId/answers` (`SubmitLevelTestAnswer`) — body `{ exerciseId, userAnswer }` | Returns `{ isCorrect, correctAnswer }` for the immediate `ResultSheet` / `AnswerBox` feedback. Records the answer for scoring; does not re-queue wrong answers (single-pass). |
| Submit confirmation → "Submit test" | `POST /users/:userId/levelTests/:attemptId/submit` (`SubmitLevelTest`) | Finalises and scores → `{ score, passed, advancedTo }`. Server updates mastery (SRS), records the attempt (+ cooldown on fail), and on pass advances the CEFR level (`advancedTo`, null if already C2 or on fail). Drives the Result phase. |
| Review phase | `GET /users/:userId/levelTests/:attemptId/review` (`GetLevelTestReview`) | Per-question review: every question with the user's answer vs. the correct answer. **Also returns weak vocabulary/grammar** — consumed later if the weak-areas summary is un-skipped (OQ-3); not rendered now. |
| Ready summary (level name, next level), Promotion result | `GET /me/progress` (`TomeLearningDashboardAPI.getMeProgress`, shared with `01`) | Current CEFR level + level names for "A1 · Foundation → A2" and "You're now A2!". |

**Missing**

| Component or Screen | Missing API endpoint |
| ------------------- | -------------------- |
| Ready summary ("75% to pass", "40 questions") + result `ThresholdBar` marker | **No endpoint exposes `LEVEL_TEST_PASS_THRESHOLD` (75) or `LEVEL_TEST_SIZE` (40).** The threshold is used server-side only (baked into `passed`, never returned); the size surfaces only via the returned `exercises` array, i.e. *after* the test starts — not in time for the Ready screen. So these display values would have to be hardcoded in the frontend, duplicating the backend constants and risking drift. To keep a single source of truth, expose them — e.g. add `passThreshold` + `questionCount` to the **eligibility** response (already fetched on entry) or add a small `GET /levelTest/config`. Unlike the module test, which reads `testPassThreshold`/`testQuestionCount` from `GET /modules/:id`, the level test has no per-entity carrier for these. See OQ-5. |
| In-test "Check with AI" on Translation | **Not wired for the Level Test today.** The shared `POST /exercises/:exerciseId/verifyAnswer` (F13, `PostExerciseAnswerVerification`) resolves `sessionId` against `PracticeSessionStore` then `ModuleTestAttemptStore` **only** — a Level Test attempt id is not recognised and returns **404**. The plumbing is otherwise present: `LevelTestAttemptStore` already implements `flipAnswerToCorrect` + `addVerifiedExerciseId`, and `LevelTestAttempt` carries `verifiedExerciseIds`. Wiring it is a **small backend change** — add a third `LevelTestAttemptStore.findById` lookup + branch in the verify delegate. Until that ships, "Check with AI" must be a **stub** in the Level Test (like "Explain my mistake"). See OQ-2. |

Otherwise **none** — all six core level-test endpoints exist and are registered.
The only guaranteed frontend work is the `TomeLevelTestAPI` wrapper; read the
exact request/response field names from the delegates (`GetLevelTestEligibility`,
`StartLevelTest`, `GetLevelTest`, `SubmitLevelTestAnswer`, `SubmitLevelTest`,
`GetLevelTestReview`) when writing it.

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | The Ready screen shows the level scope ("40 questions… all 12 modules"), the **75%** pass threshold, and that passing **promotes** the user; "Start Level Test" begins the test. | §3.5 + config. |
| 2 | The in-test phase shows the "Level Test" header + a linear progress bar 1 → 40, rendering each applicable exercise type with the same input/feedback as practice. | Reuse of `06`/`05`. |
| 3 | Each answer is checked immediately and the `ResultSheet`/`AnswerBox` reveal correctness; Continue advances; missed questions are **not** re-presented. | Single-pass. |
| 4 | After the last question the Submit screen shows a single "Submit test" action; submitting scores via `POST …/submit`. | Finish-and-reveal. |
| 5 | Score ≥ 75% → Promotion (pass) screen showing A(n) → A(n+1); the user's CEFR level is advanced; "Start A2" returns to the **Home dashboard**, which reflects the new level on its own load. | §3.5 / `advancedTo` / OQ-4. |
| 6 | Score < 75% → Fail screen with a "Retry in …" countdown to `retryAvailableAt` (30-min cooldown); the user stays on the current level; retry draws a new selection. | OQ-1. |
| 7 | Review lists every question in order; correct rows show the answer, wrong rows show user-vs-correct + the (stubbed) "Explain my mistake". | Reuse of `06`. |
| 8 | Level-test answers update mastery scores, exactly as practice. | §3.5. |
| 9 | Reopening an in-progress test resumes into the correct phase/question (via `activeAttemptId` + `GetLevelTest`), never restarting or wrongly finalising. | Resume parity. |
| 10 | Starting when an active attempt exists (409) resumes it instead of creating a duplicate. | `StartLevelTest` guard. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| OQ-1 | **Pass threshold and retry cooldown**: idea §3.5 says **75%** and "retry freely (no cooldown for v2)"; the wireframe says **80%**; the implemented backend says **75%** + a **30-minute** cooldown. | **Resolved to the backend** (authoritative + implemented): **75%** pass, **30-min** retry cooldown. The wireframe's "80%" copy is stale and must be corrected to 75% in the UI. Flagged so the discrepancy is explicit. |
| OQ-2 | "Check with AI" (AI answer verification of a wrong Translation) is **not wired** for the Level Test — the verify delegate 404s on a level-test attempt id. Do we make the small backend change to wire it, or ship it as a stub in v1? | **Verified:** `PostExerciseAnswerVerification` only resolves practice + module-test sessions; the level-test store methods (`flipAnswerToCorrect`, `addVerifiedExerciseId`) and model field (`verifiedExerciseIds`) already exist, so wiring is just one extra lookup/branch in the delegate. Decision needed: (a) add that branch so the feature reuses `AIVerifyTray` fully, or (b) render "Check with AI" as a stub (like "Explain my mistake") until then. Frontend reuse is identical either way — it only depends on whether the endpoint accepts the attempt id. |
| OQ-3 | The **weak-areas summary** (idea §3.5 / US-08) is skipped for lack of a wireframe, though `GetLevelTestReview` already returns weak vocabulary/grammar. | Left out by decision (see §1 Out of scope, `00-user-journeys.md` → *Skipped*). Add a weak-areas band to the Review phase once a design exists — no backend change needed. |
| ~~OQ-4~~ (pass) | ~~On a **pass**, does "Start A2" go to the next-level Module map or Home?~~ | **Resolved** — "Start A2" navigates to the **Home dashboard** (`/language-learning`). Home already reflects the promoted level on its own load and points its Continue CTA at the first module of the new level, so the user resumes from the familiar hub rather than being dropped into the map. |
| ~~OQ-4~~ (fail) | ~~On a **fail**, does the user land on Home or stay on the result screen with the retry pill?~~ | **Resolved** — the user **stays on the fail result** (with the "Retry in …" countdown + "Review answers"); to leave, they tap the **standard `TomeScreen` header back arrow** (top-left, a flipped `point-right` glyph), which returns to Home. No dedicated "Home"/"Done" button is added to the fail body. |
| OQ-5 | The **displayed** pass threshold (75%) and question count (40) have **no source endpoint** — the backend constants are used server-side only. Should we expose them, or accept hardcoded display copy? | The pass/fail *decision* is backend-only and returned as `passed` (frontend never stores it). But the Ready screen and `ThresholdBar` need the literal numbers. **Recommend** exposing `passThreshold` + `questionCount` on the eligibility response (or a `GET /levelTest/config`) so the frontend never duplicates the constants; otherwise document them as presentational copy kept in manual sync with `Config.ts`. See §5.1 *Missing*. |
