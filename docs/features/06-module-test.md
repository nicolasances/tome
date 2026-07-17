# Module Test — module step 3 (gated, scored assessment)

![Status](https://img.shields.io/badge/status-planned-blue?style=flat-square)

## 1. Purpose & Scope

Delivers **Step 3 of the module flow**: the **Module Test** — the gated, scored
sibling of practice. It is one uninterrupted job that runs through a sequence of
phases: **locked** (spaced-repetition countdown) → **ready** → **in-test**
(answering questions) → **submit** (confirmation) → **result** (pass / fail) →
**review** (every question, your answer vs. correct). Because these phases form a
single continuous flow the user moves through without choosing a separate
destination, they are **one capability / one feature** spanning several screens —
not one feature per screen.

The in-test questions reuse the **exact same exercise interface as practice
(`05-practice-session`)** — the same six exercise types, the same `ResultSheet`,
`AnswerBox`, `Verdict`, immediate per-answer feedback and mistake reveal. The
test's only distinct chrome is the **"Module Test" header** + a single **linear
question-progress bar** (no mastered/deferred segmentation). The test is scored
(**80% to pass**) and gated; passing marks the module `completed` and unlocks the
next module. Mastery still updates, exactly as in practice (§3.1.1 Step 3).

Design: `test-screens.jsx` (`TestLocked`, `TestReady`, `TestShell`, `TestMC`,
`TestReorder`, `TestTranslation`, `TestSubmit`, `TestResultPass`,
`TestResultFail`, `ReviewCorrect`, `ReviewWrong`, `TestReview`), reusing the
shared exercise primitives from `exercise-screens.jsx` (`PromptBlock`, `WordTile`,
`AnswerBox`, `Verdict`, `ResultSheet`, `SheetBtn`, `RoundButton`, `FauxInput`,
`Bar`, `Ring`).

Participates in journey **J5** (take the module test). It is launched from the
Module overview (`03-module-overview`) Test step and returns the user to Home or
the overview when done.

**Out of scope**:
- The Module overview that launches the test and renders the Test step row /
  lock tag (owned by `03-module-overview`). The overview owns the step *row*; this
  feature owns the full-screen test flow the row navigates to.
- The Practice session and its exercise bodies' *source design* (owned by
  `05-practice-session`). This feature **reuses** those exercise renderings; it
  does not redefine them.
- **"Explain my mistake"** AI panel — the *button* is rendered in the in-test
  `ResultSheet` and in the `ReviewWrong` row; the panel it opens is **skipped**
  (no wireframe; tracked with practice's stub, issue #275).
- The **Level Test** (§3.5) — a separate cross-module assessment, still skipped
  (no wireframe).

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | See how long until the test unlocks while it is locked | I accept the spaced-repetition delay and know when to return (§3.1.1) |
| 2 | See what the test involves before I start (question count, pass threshold) | I know what I'm walking into (US-03) |
| 3 | Answer a run of questions covering the module's vocabulary and grammar | I'm assessed on what the module taught (US-03) |
| 4 | Deliberately finish the test and reveal my overall result | I get a clear "answering → verdict" transition and trigger scoring on purpose, not by accident |
| 5 | See my score and whether I passed | I know if the module is complete (US-06-adjacent) |
| 6 | Retry the test after a cooldown if I fail | I'm not blocked; I can keep improving (US-07) |
| 7 | Review every question with my answer vs. the correct one | I learn from what I got wrong (US-04) |
| 8 | Have my test answers count towards my mastery scores | my progress reflects the test, same as practice (US-05, §3.1.1) |

## 3. Interfaces

**Screen(s):** Module test, per `test-screens.jsx`. One route rendering all
phases as internal states (locked / ready / in-test / submit / result / review).
The in-test and review phases use the **"Module Test" / "Review"** `TomeScreen`
chrome; the in-test phase uses `TestShell` (linear `Bar`, "q / total" counter).

**Components:**

| Screen (phase) | Component Name | Description | Expected Behavior |
|----------------|----------------|-------------|-------------------|
| Locked | Lock countdown (`TestLocked`) | Large `Ring` with a lock glyph, an "unlocks in" sub-label, a big `3h 12m`-style remaining-time readout, an explanatory line ("test opens 4 hours later…"), and a disabled "Start test" button. | Shown when the test route is reached but `testUnlocksAt` is still in the future. Counts down live; "Start test" is disabled. |
| Ready | Ready summary (`TestReady`) | Module kicker + title, intro line, and a 4-row feature list (question count "20 questions", "80% to pass", "Instant feedback", "Counts toward mastery") with icon medallions, plus a primary "Start test" button. | Shown when unlocked and no test is in progress. Question count and pass threshold come from module config. "Start test" begins the test. |
| In-test | Test shell (`TestShell`) | Top chrome: module kicker label, a "q / total" counter, a single **linear** progress `Bar`, and the per-exercise instruction label. Hosts the exercise body + footer. | Distinct test chrome (no mastered/deferred segmentation). The bar advances one step per answered question, monotonically 1 → total. |
| In-test | Exercise bodies (MC, Reorder, Fill-blank, Conjugation, Error-correction, Translation) | The **same six exercise renderings as `05-practice-session`** (`TestMC`, `TestReorder`, `TestTranslation` shown in the wireframe; the remaining three reuse practice's bodies). | Reused as-is from practice. Input, inline correct/wrong coloring and `AnswerBox` behave identically to practice. |
| In-test | Result sheet (`ResultSheet`) | The same bottom sheet as practice: after every answer, slides up with **correct** (green `Verdict` + "Correct!") or **wrong** (red `Verdict` + "Not quite", correct answer revealed, `SheetBtn` actions) state. | Immediate per-answer feedback (see §4 and OQ-1). `ContinueBtn` advances to the next question. "Explain my mistake" on all wrong states is a stub; **"Check with AI" on Translation wrong is wired** — it opens the same `AIVerifyTray` as practice (F13), reusing the practice rendering. |
| In-test | AI verify tray (`AIVerifyTray`) | The same deep-teal tray as practice (loading → accepted/not-accepted), reused as-is from `05-practice-session`. | On `valid: true` the backend flips `isCorrect` on the `ModuleTestAttempt` **at answer time, before scoring on submit** (F13/F11); the client counts the answer correct locally. Cancel returns to the `ResultSheet`. |
| Submit | Submit confirmation (`TestSubmit`) | "All answered · N / N", a dot grid of the N questions, a finish-and-reveal prompt (e.g. "Ready to see your result?"), and a single primary "Submit test" button. **No "Back to questions" link.** | Shown after the last question. "Submit test" triggers `POST .../submit` (scoring + finalisation). **Not** an answer-locking gate — answers were already recorded per-question (see §4); this is a deliberate finish-and-reveal step, so the obsolete "you can't change answers" copy is dropped. |
| Result · pass | Pass result (`TestResultPass`) | Score `Ring` (e.g. 85% · 17/20) with restrained celebration ticks, "Module passed!" headline, "Module NN is now unlocked" line, a `ThresholdBar` showing the score against the 80% pass marker, and two buttons: **"Home"** (→ Home dashboard, `01-home-dashboard`) and **"Review answers"** (→ Review phase). | Shown when score ≥ pass threshold. Module is now `completed`; next module unlocked. "Home" navigates to the Home dashboard, which reflects the new progress on its own load. |
| Result · fail | Fail result (`TestResultFail`) | Score `Ring` (e.g. 70% · 14/20), "So close" headline, encouragement line referencing the 80% threshold, a `ThresholdBar`, a "Retry in mm:ss" lock pill, and a "Review answers" button. | Shown when score < pass threshold. Retry is locked until `testRetryAvailableAt`; the pill counts down. |
| Review | Review header + list (`TestReview`, `ReviewCorrect`, `ReviewWrong`) | "Review" `TomeScreen`: header with module kicker, "X / N correct", a percentage pill and a `Bar`; then a scrollable list of every question. **Correct** rows: green `Verdict` + prompt + answer. **Wrong** rows: red `Verdict` + prompt + "You" (struck-through wrong) vs. "Answer" (correct) + `SheetBtn` actions. | Reachable from either result screen. Lists all N questions in order; wrong rows expose the "Explain my mistake" stub. **"Check with AI" is not offered in Review** — verification only applies in-test, before the attempt is scored on submit. |

**Additional Notes:**
- **Phase routing on entry**: opening the test route resolves the phase from
  per-user progress — `testUnlocksAt` in the future → **Locked**; unlocked with no
  in-progress test → **Ready**; an in-progress test → resume into **In-test** (or
  **Submit** if all answered); a just-finished test → **Result/Review**.
- **Loading**: the test is created server-side on "Start test"; the response
  contains the full ordered question list. No per-question spinner; no AI in
  selection. The locked/ready chrome renders from already-loaded progress + module
  config.
- **Result reuse of exercise feedback**: the in-test `ResultSheet`/`AnswerBox`
  treatments are identical to practice — this feature does not introduce new
  feedback visuals, only the test header + linear bar.
- **Resume**: like practice, an interrupted test should resume into the correct
  phase/question rather than restart (see OQ-3); the authoritative answer log is
  the basis for reconstruction, consistent with `05-practice-session`.
- **Empty/edge states**: a module whose test has already been passed should route
  to the overview (test step shows completed), not re-open the test, unless an
  explicit "retake" affordance is offered (out of scope here).

## 4. Business Logic

- **Gating (§3.1.1 / §3.1.2)**: the test is **locked** until `testUnlockDelayHours`
  (default 4h) after Step 2 completion. The locked phase shows the live countdown
  to `testUnlocksAt`; once elapsed the phase becomes **Ready**.
- **Question set**: **N questions** (`testQuestionCount`, idea range 30–40) drawn
  from the **same module exercise bank** as practice, using the **same
  mastery-aware selection (§3.4.3)** — but **without** the practice-only coverage
  override. Selection is server-side; the client renders the ordered list.
- **Exercise order**: questions follow the same recognition → production type
  ordering as practice (§3.1.1); only types present in the bank appear.
- **Immediate per-answer feedback (per wireframe)**: each answer is checked the
  moment it is given and the `ResultSheet`/`AnswerBox` reveal correctness, exactly
  as in practice. **This deviates from idea §3.1.1 Step 3 point 4** ("answers are
  not shown during the test"); the updated wireframe overrides the idea here — see
  OQ-1.
- **Single pass, no retry-until-correct**: unlike practice, the test does **not**
  re-present missed questions. The progress bar is linear 1 → N; each question is
  answered once and that answer is what counts toward the score. (Contrast
  practice, which retries missed exercises until correct.) See OQ-2.
- **Submit step (finalise & reveal, not answer-locking)**: after the last question,
  the **Submit** phase is a deliberate gate that triggers `POST .../submit` to
  compute the aggregate score, run mastery updates, and finalise the attempt. Because
  feedback is immediate and the test is single-pass, **answers are already recorded as
  the user goes** — submitting does not lock anything that wasn't already locked, and
  there is no risk of submitting an unanswered/partial test (the phase is only reached
  at N/N). The screen therefore shows a finish-and-reveal prompt (e.g. "Ready to see
  your result?") and a **single** "Submit test" action; there is **no "Back to
  questions"** affordance.
- **Scoring & pass/fail (§3.1.1)**:
  - Score = % of questions answered correctly on their single attempt.
  - **Pass** when score ≥ `testPassThreshold` (default **80%**) → module status →
    `completed`; the next module unlocks.
  - **Fail** → the attempt (score + timestamp) is recorded in the module's test
    history; retry is locked until `testRetryAvailableAt`
    (= now + `testRetryDelayMinutes`, default 20m); a retry draws a **new**
    selection from the bank.
- **Mastery updates (§3.1.1)**: the test updates mastery scores for the linked
  vocabulary item / grammar concept of each answered question, **exactly as
  practice does** — there is no "test doesn't count" mode. Updates are applied on
  submit (server-side), consistent with practice's `/complete`.
- **The test does not need to cover every vocabulary item** — it is a sample-based
  check (§3.1.1 Step 3 point 3), unlike practice's coverage gate.
- **AI answer verification ("Check with AI") — in-test Translation only**: on a
  wrong Translation answer the user may tap "Check with AI", opening the shared
  `AIVerifyTray` (F13, `POST /exercises/:exerciseId/verifyAnswer` with
  `sessionId` = the attempt id). On `valid: true` the backend flips `isCorrect`
  on the `ModuleTestAttempt` **at answer time, before scoring on submit** — so the
  aggregate score computed on `/submit` already reflects the overturn and there is
  **no retroactive score change** for the client to handle; the client only mirrors
  the verdict locally (counts the answer correct). One verification per
  `(attemptId, exerciseId)` (repeat → 409); non-Translation → 400.
- **Read-back of results**: the **Review** phase shows every question with the
  user's answer vs. the correct answer; wrong rows offer the (stubbed) "Explain my
  mistake" action only — "Check with AI" is in-test only.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]/test`; all phases are internal states of this one route. | Mirrors how `05-practice-session` renders one route with internal states; the test is one continuous job. |
| 2 | One screen renders all phases and all six exercise bodies via a shared shell; reuse the practice exercise components rather than re-implementing them. | The wireframe states the in-test interface is identical to practice; reuse keeps the two in lockstep and avoids divergence. |
| 3 | Distinct test chrome = "Module Test" header + a single linear `Bar` (no mastered/deferred segmentation); everything else (bodies, `ResultSheet`, `AnswerBox`) is shared with practice. | Per the wireframe, the only test-specific chrome is the header + linear progress. |
| 4 | Question selection is server-side (mastery-aware §3.4.3, **no** coverage override). The client receives a ready ordered list. | Selection logic lives in the backend (consistent with practice F08/F10); the coverage override is practice-only (§3.4.3). |
| 5 | Answer checking is server-side; the client submits the raw answer and renders `{ isCorrect, correctAnswer }`. No AI call at answer time. | §3.4.3 bounded-cost rule, identical to practice. |
| 6 | Scoring, pass/fail, module-status update, retry-timer (`testRetryAvailableAt`) and mastery (SRS) updates are all computed server-side on submit; the client renders the returned result. | §3.1.1 — keep scoring + mastery atomic on the server to avoid partial-write races and client-side score tampering. |
| 7 | On the test route, gating (lock state, unlock time, retry-available time) is read from the authoritative `GET .../testEligibility` (F11); question count / pass threshold from module config. The overview's Test step row still uses the dashboard progress fields it already loads. | A dedicated eligibility endpoint exists for the test flow; the overview avoids an extra call by reusing the progress data it already has. |
| 8 | Resume reconstructs phase/position from the authoritative answer log, never inferring completion from a derived empty queue. | Consistency with the practice resume model (`05-practice-session` §4) and its hard-won correctness rule. |
| 9 | `ResultSheet` positioned `absolute; bottom:0` within the screen, as in practice. | Continue is always reachable without page scroll. |
| 10 | "Explain my mistake" renders as a stub (no panel), tracked with practice issue #275. **"Check with AI" is wired** in-test for Translation, reusing the practice `AIVerifyTray` + F13 (issue #288). | "Explain my mistake" still has no wireframe; "Check with AI" is now designed and backed by F13. |
| 11 | **Intentional deviation from the `TestSubmit` wireframe**: drop the "Back to questions" link and the "you can't change answers once you submit" copy; the Submit screen has a single "Submit test" action + a finish-and-reveal prompt. | Immediate feedback + single-pass make those obsolete — answers are recorded per-question, so there is nothing to lock or go back and change (OQ-6). |

### 5.1 API Integrations

All endpoints are on `tome-ms-language` (basepath
`NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT`).

The Module Test backend (`tome-ms-language` feature **F11**) is implemented. The
endpoints below are confirmed in that service's `index.ts`. The frontend wrapper
`TomeModuleTestAPI` (`api/TomeModuleTestAPI.ts`) has since been added, exposing
all six methods (eligibility / start / get / answer / submit / review) with their
response interfaces.

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Phase resolution on entry (Locked vs. Ready), Locked countdown, Fail-retry pill | `GET /users/:userId/modules/:moduleId/testEligibility` | Authoritative gating for the test route: whether the user may start, the unlock time (Locked countdown), and the retry-available time after a fail (Fail-retry pill). Used when the user navigates into the test. |
| Ready → "Start test" | `POST /users/:userId/modules/:moduleId/tests` (`StartModuleTest`) | Starts a scored test attempt; runs mastery-aware selection (no coverage override) server-side and returns the attempt id + the full ordered question list. |
| Resume into the correct phase/question | `GET /users/:userId/moduleTests/:attemptId` (`GetModuleTest`) | Full attempt state (ordered exercises + answers so far + status) to resume an interrupted, not-yet-submitted test into the right phase/question. |
| In-test answer submission | `POST /users/:userId/moduleTests/:attemptId/answers` (`SubmitTestAnswer`) — body `{ exerciseId, userAnswer }` | Returns `{ isCorrect, correctAnswer }` for the immediate `ResultSheet`/`AnswerBox` feedback. Records the answer for scoring; does **not** re-queue wrong answers (single-pass). |
| AI verify tray (`AIVerifyTray`), via in-test "Check with AI" | `POST /exercises/:exerciseId/verifyAnswer` (F13) — body `{ userAnswer, sessionId, cefrLevel }` (`sessionId` = the attempt id) | Re-verifies a wrong Translation answer with AI → `{ valid, explanation? }`. On `valid: true` the backend flips `isCorrect` on the `ModuleTestAttempt` before scoring on submit; the client mirrors it locally. One verification per `(attemptId, exerciseId)` (repeat → 409); non-Translation → 400. Shared with `05-practice-session`. |
| Submit confirmation → "Submit test" | `POST /users/:userId/moduleTests/:attemptId/submit` (`SubmitModuleTest`) | Finalises and scores the attempt → score, pass/fail (vs. `testPassThreshold`). Server updates mastery (SRS), sets module status to `completed` on pass, and records the attempt + retry-available time on fail. Drives the Result phase. |
| Review phase | `GET /users/:userId/moduleTests/:attemptId/review` (`GetTestReview`) | Per-question review for the Review screen: every question with the user's answer vs. the correct answer. |
| Ready summary (question count, pass threshold), result `ThresholdBar` | `GET /modules/:id` (`TomeModuleAPI.getModule`, shared with `03`) | Reads `testQuestionCount` and `testPassThreshold` for the Ready feature list and the 80% pass marker. **Existing.** |
| Module overview hand-off (Test step row state) | `GET /me/progress` (owned by `03-module-overview`) | The overview's Test step row reads `status`/`step`/`testUnlocksAt`/`testRetryAvailableAt` to decide when to route here. Not called from within the test screen itself (which uses `testEligibility`). |

**Missing**

None — all test-flow endpoints exist in `tome-ms-language` (F11), and the
`TomeModuleTestAPI` wrapper around them is already implemented
(`api/TomeModuleTestAPI.ts`), with request/response shapes mirroring the F11
delegates (`StartModuleTest`, `SubmitTestAnswer`, `SubmitModuleTest`,
`GetTestReview`, `GetModuleTest`, `GetTestEligibility`).

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | While locked, the screen shows a live countdown to `testUnlocksAt` and "Start test" is disabled. | §3.1.1 spaced repetition. |
| 2 | Once unlocked, the Ready screen shows the configured question count and 80% pass threshold, and "Start test" begins the test. | §3.1.2 from module config. |
| 3 | The in-test phase shows the "Module Test" header + a linear progress bar advancing 1 → N, and renders each applicable exercise type with the same input/feedback as practice. | Wireframe. |
| 4 | Each answer is checked immediately and the `ResultSheet`/`AnswerBox` reveal correctness; Continue advances; missed questions are **not** re-presented. | Wireframe + OQ-1/OQ-2. |
| 5 | After the last question the Submit screen shows a single "Submit test" action (no "Back to questions"); "Submit test" triggers scoring via `POST .../submit`. | Wireframe + OQ-6. |
| 6 | Score ≥ 80% → Pass screen, module `completed`, next module unlocked. | §3.1.1. |
| 7 | Score < 80% → Fail screen with a "Retry in …" countdown to `testRetryAvailableAt`; retry draws a new selection. | §3.1.1 / `testRetryDelayMinutes`. |
| 8 | Review lists every question in order; correct rows show the answer, wrong rows show user-vs-correct + the (stubbed) "Explain my mistake" action ("Check with AI" is in-test only). | Wireframe. |
| 9 | Test answers update mastery scores, exactly as practice. | §3.1.1. |
| 10 | Reopening an in-progress test resumes into the correct phase/question, never restarting or wrongly finalising. | OQ-3 / practice resume parity. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| ~~1~~ | ~~Immediate feedback during the test contradicts idea §3.1.1 Step 3 point 4.~~ | **Resolved** — idea §3.1.1 Step 3 updated (2026-06-12): answers are checked and shown immediately, single-pass, to stay coherent with the practice flow. The wireframe is now the spec. |
| ~~2~~ | ~~Does a wrong in-test answer ever re-enter a retry queue, or is it strictly single-pass?~~ | **Resolved** — strictly **single-pass**: a wrong answer is shown and the user continues; the question is never re-presented, and the first answer is what counts toward the score. Retry-until-correct is practice-only. |
| ~~3~~ | ~~Resume semantics for an interrupted test.~~ | **Resolved** — `GET /users/:userId/moduleTests/:attemptId` (F11 `GetModuleTest`) returns the attempt's exercises + answers, so the client resumes the exact phase/question from server state (parity with practice). |
| ~~4~~ | ~~Are test answers persisted per-answer or buffered client-side until submit?~~ | **Resolved** — server-persisted per-answer: `POST .../answers` records each answer; `GET .../review` reads them back. Review and resume both come from the server. |
| ~~5~~ | ~~On Pass, "Home" vs. "Review" then back — where does the user land?~~ | **Resolved** — the primary "Home" button returns to the **Home dashboard** (`01-home-dashboard`); "Review answers" opens the Review phase. (The Home dashboard reflects the completed module / unlocked next module via its own progress load.) |
| ~~6~~ | ~~Submit-screen copy and "Back to questions" now that feedback is immediate + single-pass.~~ | **Resolved** — "Back to questions" is **removed**: the last question leads straight to the Submit confirmation with only "Submit test". The obsolete "you can't change answers once you submit" copy is reworded to a finish-and-reveal prompt (e.g. "Ready to see your result?"). |
