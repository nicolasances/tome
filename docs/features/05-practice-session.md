# Practice Session — module step 2

![Status](https://img.shields.io/badge/status-implemented-brightgreen?style=flat-square)

## 1. Purpose & Scope

Delivers **Step 2 of the module flow**: a **repeating practice loop** that
introduces the module's vocabulary implicitly through exercises, ordered
recognition → production. Step 2 is **not a single session** — the user runs
`practiceSessionSize`-sized sessions back-to-back until **every vocabulary item
in the module has appeared in at least one exercise** (§3.1.1). Each exercise
updates the mastery score of its linked item, in practice exactly as in the test.
This capability owns two screens delivered as one uninterrupted job: the
**practice exercise screen**, which renders all **six exercise types** within a
session plus the shared session progress bar and answer footers; and the
**practice-complete screen**, the end-of-round recap the user lands on when the
last exercise of a round is answered. The recap is where the user decides to run
**another round** (the loop) or return to the module — so the multi-session loop
is **user-driven**, not an automatic hand-off. Because both screens form a single
practice run, this is one feature rather than several.

Design:
- Exercises — `exercise-screens.jsx` (`ExShell`, `ExMultipleChoice`, `ExReorder`,
  `ExFillBlank`, `ExConjugation`, `ExErrorCorrection`, `ExTranslation`,
  `ResultSheet`, `AnswerBox`, `Verdict`, `ContinueBtn`, `SheetBtn`).
- Practice complete — `practice-complete-screens.jsx` / `practice-complete-app.jsx`.
  Two states are the spec'd design: **A · Round complete** (`PCRoundComplete`,
  momentum ring) shown every round before full coverage, and **C · Coverage
  milestone** (`PCMilestone`) shown only when the round reaches full coverage.
  Variants **B "Recap" (`PCRecap`)** and **D "Quiet sheet" (`PCSheet`)** are
  explorations and are **not** chosen. Shared bits: `AnimRing`, `AnimBar`,
  `SparkBurst`, `SavedChip`, `MiniStat`, `PrimaryBtn`, `GhostBtn`.

Participates in journey **J4** (practise a module).

**Out of scope**:
- The Module overview that launches practice and tracks coverage progress between sessions (owned by `03-module-overview`). It also owns the test-unlock countdown that begins once Step 2 reaches full coverage.
- The **Module Test** (§3.1.1 Step 3) — owned by `06-module-test`. Practice and the test update mastery identically and the test **reuses this feature's six exercise renderings and `ResultSheet`/`AnswerBox` components**; the difference is that the test is scored/gated and single-pass (no retry-until-correct), and practice is not.
- **"Explain my mistake"** AI panel — the *button* is rendered in `ResultSheet` on all wrong-answer states; the panel it opens is **skipped** (no wireframe for the panel itself).

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | Work through a set of exercises that get progressively more demanding | I build from recognition to production (US-03) |
| 2 | See my progress through the session (done / remaining) | I know how much is left |
| 3 | Be shown the correct answer when I'm wrong and move on | I learn without being blocked |
| 4 | Retry the ones I missed until I get them right | I consolidate before the test |
| 5 | Keep practising until I've seen every word in the module at least once | the test only assesses material the module actually taught me (§3.1.1) |
| 6 | Have my practice answers count towards my mastery scores | my progress reflects everything I do, not just the test (US-05, §3.1.1) |
| 7 | See a rewarding recap when I finish a round (how I did + how much closer the module is to its test) | I feel my momentum and know whether to keep going |
| 8 | Decide myself whether to run another round or go back to the module | I stay in control of the practice loop instead of being thrown around automatically |
| 9 | Be told the moment I've covered every word in the module and when the test unlocks | I understand the spaced-repetition wait and what to do next (§3.1.1) |
| 10 | Have my progress saved without a blocking "Saving…" screen | finishing a round feels like a reward, not a wait |

## 3. Interfaces

**Screen(s):**
- **Practice exercise screen** (one screen, six exercise-type bodies), per
  `exercise-screens.jsx`. `TomeScreen` titled "Practice".
- **Practice complete screen** — the end-of-round recap, per
  `practice-complete-screens.jsx`. `TomeScreen` keeps the module title (e.g.
  "Who Are You?"). One screen with two mutually-exclusive states selected by
  whether the round reached full coverage: **Round complete** (`PCRoundComplete`)
  and **Coverage milestone** (`PCMilestone`).

**Components (Practice exercise screen):**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Practice | Session bar (`SessionBar`) | Top progress bar segmented into mastered / remaining / deferred, with an "n / total" counter. | Advances as the user completes exercises in the session. |
| Practice | Instruction label | Per-exercise instruction (e.g. "Choose the correct word", "Arrange the words"). | Reflects the current exercise type. |
| Practice | Exercise body — Multiple Choice | Sentence with a blank + 4 lettered options (A–D); one selectable. Option order is **shuffled** so the correct answer can appear in any position (seeded deterministically per `exercise.id` via `utils/seededShuffle`, so order is stable across re-renders). **Keyboard-navigable**: option A is pre-highlighted on load; Arrow Up/Down moves cursor with wrapping; A–D / 1–4 jumps to an option; Enter selects the cursored option and submits in one action. Keyboard logic is in `utils/multipleChoiceKeyHandler`. | Receptive recognition; select → enables Check. Keyboard: arrow/letter/number to navigate, Enter to select+submit. |
| Practice | Exercise body — Sentence Reorder | A build area + a word bank of draggable/tappable tiles. | User arranges all provided words; Check enabled when filled. |
| Practice | Exercise body — Fill in the Blank | Sentence with an inline, auto-growing text input (`AnswerLineInput`) in place of the blank. | Controlled production; typed directly in the blank, submitted via a standalone send `RoundButton`. |
| Practice | Exercise body — Conjugation Drill | Verb chip (infinitive + gloss), subject → present-tense input box. | Targeted production of a verb form; submitted via Send. |
| Practice | Exercise body — Error Correction | A sentence with tappable words (tap the wrong one) + a correction input. | User identifies the wrong word and types the fix; Check. |
| Practice | Exercise body — Translation (active) | English prompt + a text input for the Danish translation; optional "Hint" chip. | Free production; submitted via Send. |
| Practice | Check footer (`CheckFooter`) | Full-width "Check" button with enabled/disabled state. | Used by Multiple Choice, Sentence Reorder, and Error Correction; disabled until answerable. |
| Practice | Send footer (`SendFooter`) | Text input + send `RoundButton`, with a "Hint" chip. | Used by Translation only. Fill in the Blank and Conjugation Drill instead type inline in the exercise body and show a standalone `RoundButton` (right-aligned, no full footer) — this avoids the iOS Safari issue where opening the keyboard for a bottom-anchored input scrolls the prompt out of view (see issue #315). |
| Practice | Result sheet (`ResultSheet`) | Bottom sheet pinned to the bottom of the screen; appears after every answer submission, overlaying the exercise body. | **Correct**: dark teal sheet, green `Verdict` badge + "Correct!", `ContinueBtn`. For Translation, if the accepted answer was a fuzzy (non-exact) match against the canonical answer, the sheet additionally reveals the canonical phrasing in lime text under an "Exact phrasing" label (same truncate/expand treatment as the wrong-answer reveal) — the verdict stays green/"Correct!". **Wrong**: dark teal sheet, red `Verdict` badge + "Not quite", correct answer revealed in lime text under an "Answer" label (truncated to 2 lines; tap or drag-up to expand; "Show more / Show less" toggle for long answers), action buttons (`SheetBtn`), `ContinueBtn`. |
| Practice | Answer box (`AnswerBox`) | Inline display of the submitted answer inside the exercise body, shown after submission for typed-answer exercises (Fill in the Blank, Conjugation Drill, Error Correction, Translation). | Green border + ✓ if correct; red border + strikethrough + ✕ if wrong. |
| Practice | Verdict badge (`Verdict`) | Circular icon badge rendered inside `ResultSheet`. | Green (lime) + ✓ for correct; red + ✕ for wrong. |
| Practice | Continue button (`ContinueBtn`) | Full-width button at the bottom of `ResultSheet`. | Lime-on-dark styling; always advances to the next exercise in the session. |
| Practice | Sheet action buttons (`SheetBtn`) | Light outline buttons shown inside the wrong-answer `ResultSheet`. | "Explain my mistake" (magic icon) appears on all wrong-answer states and is still a stub. "Check with AI" (teacher icon) appears only on Translation wrong-answer states and is **wired**: tapping it replaces the `ResultSheet` with the `AIVerifyTray` (see below). |
| Practice | AI verify tray — verifying (`AIVerifyTray`, `loading`) | Deep-teal bottom tray (same footprint as `ResultSheet`) shown when "Check with AI" is tapped. Spinner + "Checking with AI…" title, "AI answer check" attribution (teacher icon), the user's answer in a `DarkAnswerChip`, and an explainer line ("Comparing your translation against the meaning — accents and word order count, small variations are fine."). | Replaces the `ResultSheet` while `POST /exercises/:exerciseId/verifyAnswer` is in flight. A **Cancel** button (outline) aborts the request and returns to the wrong-answer `ResultSheet`. |
| Practice | AI verify tray — accepted (`AIVerifyTray`, `valid: true`) | Green `Verdict` badge + "Accepted by AI" title; the user's answer re-styled as accepted (green border + ✓) with a short AI note (magic icon). | The wrong verdict is overturned: the answer now counts as correct (mastery/progress) and is dropped from the in-memory retry queue. **Continue** (lime) advances to the next exercise. |
| Practice | AI verify tray — not accepted (`AIVerifyTray`, `valid: false`) | Red `Verdict` badge + "Not accepted" title; the user's answer chip (no ✓), a "Why it's not accepted" section with the AI `explanation`, and the correct answer in a block `DarkAnswerChip`. | The wrong verdict stands. **"Got it"** advances to the next exercise. |

**Components (Practice complete screen):**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Practice complete | Round label (`Label`) | Kicker reading e.g. "Module 01 · Round 2". | Identifies which module and which round just finished. |
| Practice complete · **Round complete** | Coverage ring (`AnimRing` + `SparkBurst`) | A momentum ring with the new module-coverage % in the center and "module covered" beneath; a restrained lime spark burst plays on mount. | On mount the ring **sweeps from the previous coverage % to the new one** (old→new), so the round's contribution is felt. % = words practised so far ÷ total words in the module. |
| Practice complete · **Round complete** | Headline + subline | Large performance-driven headline ("Round complete") and an encouraging subline. | Tone adapts to how the round went (e.g. strong vs. needs-work). |
| Practice complete · **Round complete** | Round stats (`MiniStat` ×3) | Three figures: **Answered** (exercises in the round), **Mastered** (right on the first try), **Accuracy** (first-try correct ÷ total). | Computed for the round just finished; rise-in on mount. |
| Practice complete · **Round complete** | Primary CTA — "Practice another round" (`PrimaryBtn`, lime) | Full-width lime button. | **Starts a new practice session** (loops back into the practice run). |
| Practice complete · **Round complete** | Secondary CTA — "Back to module" (`GhostBtn`) | Full-width ghost button. | Navigates to the Module overview (`03`). |
| Practice complete · **Coverage milestone** | Milestone medallion | Lime tick medallion with a spark burst; headline "All words covered" + subline naming the module. | Marks the bigger moment: every vocabulary item in the module has now been practised. |
| Practice complete · **Coverage milestone** | Coverage bar (`AnimBar`) | Module-coverage bar with an "N / N words" count. | **Fills to 100%** on mount (ghost shows the pre-round level); the count reads full (e.g. "8 / 8 words"). |
| Practice complete · **Coverage milestone** | Test-unlock card | Dark card with a lock tag: "Module test unlocks in 4h" + a spaced-repetition explanation. | Communicates that Step 2 is complete and the test enters its `testUnlockDelayHours` cool-down. The countdown/lock itself is owned by the Module overview / test (`03`/`06`); this card is the in-context announcement. |
| Practice complete · **Coverage milestone** | Primary CTA — "Back to module" (`PrimaryBtn`) | Full-width dark button. | Navigates to the Module overview (`03`). |
| Practice complete · **Coverage milestone** | Secondary CTA — "Keep practising" (`GhostBtn`) | Full-width ghost button. | Starts a new practice session even though coverage is complete (drill while the test cools down). |
| Practice complete (both states) | Saved chip (`SavedChip`) | Quiet pill — lime ✓ + "Progress saved". | **Replaces the old blocking "Saving progress…" overlay.** Progress is persisted in the background; the chip is a non-blocking acknowledgement, not a modal. |

**Additional Notes:**
- **Order of types**: exercises are presented recognition → production — Multiple Choice → Sentence Reorder → Fill in the Blank → Conjugation Drill → Error Correction → Translation (§3.1.1). Only types present in the module's exercise bank appear.
- **Loading**: the session is created server-side on screen entry (`POST /practiceSessions`); the response contains the full ordered exercise list. No per-exercise spinner; no AI involved in selection.
- **Answer feedback — `ResultSheet`**: After every submission (Check or Send), a `ResultSheet` bottom sheet slides up and overlays the exercise content. The Continue button in the sheet is always reachable without scrolling. Tapping Continue advances to the next exercise.
- **Per-exercise inline feedback** (in the exercise body, alongside the `ResultSheet`):
  - *Multiple Choice*: The chosen wrong option turns red (✕ badge); the correct option turns green (✓ badge). Both inline changes appear with the `ResultSheet`.
  - *Sentence Reorder*: All word tiles in the build area turn green (correct) or red (wrong).
  - *Fill in the Blank, Conjugation Drill, Error Correction, Translation*: The user's typed answer is replaced by an `AnswerBox` — green + ✓ if correct, red + strikethrough + ✕ if wrong.
- **End of round**: after the full exercise list is completed, missed exercises are retried until all are answered correctly, then `POST .../complete` is called. The save happens in the background (no blocking overlay) and the client transitions to the **Practice complete screen** — it does **not** auto-route. Which state shows is selected by `step2Complete` in the `/complete` response: `false` → **Round complete**; `true` → **Coverage milestone**.
- **User-driven loop**: from the **Round complete** state the user chooses "Practice another round" (start a new session via `POST /practiceSessions`) or "Back to module" (navigate to `03-module-overview`). The loop is no longer an automatic hand-off — the recap is the decision point. Between-round coverage progress also remains visible on the overview (owned by `03-module-overview`).
- **End of Step 2 (full coverage)**: when `/complete` returns `step2Complete: true` the **Coverage milestone** state is shown. The test-unlock countdown begins server-side (owned by `03`/`06`); the milestone card announces it in context. From here "Back to module" returns to the overview and "Keep practising" starts another session.
- **Recap data**: round stats (answered, mastered = first-try-correct, accuracy) are derived from the round's local `answers` log. Coverage figures (previous % / new % / practised-and-total word counts) and the milestone's unlock timing come from the backend — see §5.1 and OQ-6/OQ-7 for the exact contract / gaps.
- **Session resume reconstruction**: when the app reopens and the backend returns a 409 for `POST /practiceSessions`, the client calls `GET .../practiceSessions/:sessionId` and reconstructs its presentation state by **replaying the `answers` log** through the same state machine as live play (`handleContinue`). The `answers` array is the single append-only source of truth; `currentPosition` (a monotonic answer counter) and `retryQueue` (grow-only, never compacted when a retry is answered correctly) are **not** used to derive the queue, because the backend writes them in three separate non-atomic updates and they can be transiently inconsistent. Replay:
  - Primary phase: present `exercises` in order. A wrong answer records the id into `pendingRetry`; the head is consumed. When the primary queue empties and `pendingRetry` is non-empty, switch to the retry phase (`queue = pendingRetry`).
  - Retry phase: a correct answer consumes the head; a wrong answer moves the head to the tail.
  - `masteredCount = answers.filter(isCorrect).length`; `exerciseNumber = min(answers.length + 1, primaryLength)`.
  - **The client never infers completion from the reconstructed queue.** A session is finished only when the backend has set `completedAt`, or when the live flow reaches the end and calls `POST .../complete`. Resuming must never call `/complete` based on an empty reconstructed queue — doing so would destroy an active session and spawn a new one on the next start.

## 4. Business Logic

- **Session exercises** are the ordered list returned by `POST /practiceSessions`. The frontend presents them in the order received, with no client-side selection or filtering. The SessionBar derives completed / remaining counts from this list.
- **Multi-session loop is user-driven**: after calling `POST .../complete`, the client shows the **Practice complete screen** (it never auto-routes). `step2Complete` selects the state: `false` → **Round complete**, `true` → **Coverage milestone**. Starting another session (`POST /practiceSessions`) happens only when the user taps "Practice another round" (Round complete) or "Keep practising" (Coverage milestone); returning to the overview happens only when the user taps "Back to module".
- **Recap stats are computed from the round's local answer log** — Answered = exercises in the round; Mastered = answers correct on the **first** try; Accuracy = first-try-correct ÷ total. The retry passes do not change these figures.
- **Coverage ring/bar animate old→new**: the ring (Round complete) and bar (Coverage milestone) start at the module's coverage **before** this round and animate to the coverage **after** it, so the round's contribution is visible. The Coverage milestone is shown iff this round brought coverage to 100% (`step2Complete: true`).
- **Vocabulary is introduced implicitly** through exercises — there is no separate vocabulary-drilling step.
- **Answer submission triggers a feedback state**: after Check or Send, the exercise transitions from `idle` to `correct` or `wrong`. For Multiple Choice and Sentence Reorder a wrong submission enters `retry` (same visual treatment as `wrong`).
- **`ResultSheet` appears for every outcome**:
  - **Correct**: dark teal bottom sheet; green verdict badge + "Correct!"; `ContinueBtn` (lime). No separate answer text — the correct answer is already visually confirmed in the exercise body. **Exception — Translation only**: if the answer was accepted via the backend's fuzzy (Levenshtein) matching rather than an exact match, the canonical `correctAnswer` is additionally revealed (labeled "Exact phrasing") so the user can see how their accepted answer differs from the exact wording; the verdict remains "Correct!". The frontend detects a fuzzy match by normalizing (lowercase/trim/strip punctuation) and comparing its own submitted text against `correctAnswer` — no new backend field is needed.
  - **Wrong / retry**: dark teal bottom sheet; red verdict badge + "Not quite"; correct answer revealed in lime text, clamped to 2 lines, expandable by tapping or dragging the sheet up ("Show more / Show less" for long answers); "Explain my mistake" button (all wrong states); "Check with AI" button (Translation only); `ContinueBtn` (lime).
- **Tapping Continue always advances** to the next exercise (or the retry queue / end-of-session).
- **Answer submission is server-side; no AI call at answer time.** The client submits the raw user answer via `POST .../answers` with no client-side normalisation or comparison. The response `{ isCorrect, correctAnswer }` drives `ResultSheet` and `AnswerBox` rendering.
- **AI answer verification ("Check with AI") — Translation only.** On a wrong Translation answer the user may tap "Check with AI", which calls `POST /exercises/:exerciseId/verifyAnswer` (F13) with `{ userAnswer, sessionId, cefrLevel }` and renders the `AIVerifyTray` (loading → accepted/not-accepted). It is **one-shot per `(sessionId, exerciseId)`**: a repeat returns 409. On `valid: true` the backend overturns the verdict server-side (marks the exercise correct, removes it from the `retryQueue`, appends the phrasing to `userContributedAnswers`); the **client mirrors this in its in-memory state** — it counts the answer as correct in the progress bar / recap and drops the exercise from the in-memory retry queue so it is not re-presented. On `valid: false` stored state is unchanged and the AI `explanation` is shown. Cancelling during `loading` aborts the request and returns to the `ResultSheet`. The request needs the user's CEFR level (from profile/progress).
- After the fixed set, **all missed exercises are retried until answered correctly** (§3.1.1). The client tracks wrong answers locally and re-presents them in sequence until all are correct, then calls `POST .../complete`.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Routes: **exercise** `…/practice/[practiceId]`; **recap** `…/practice/[practiceId]/results`. The flat `…/practice` entry route is removed — callers (module overview, grammar) start a session and push directly to `…/practice/[sid]`. | Deep-linkable, independently testable routes; the recap is a real page that can be refreshed or shared; the exercise page never needs to load/own the recap. The flat entry page was a redirect-only shell that caused a loading flash. |
| 2 | One screen renders all six exercise types via a shared shell; the type switches the body. | Mirrors `ExShell` in the wireframe; one continuous session. |
| 3 | Session exercise selection is server-side: the client calls `POST /users/:userId/modules/:moduleId/practiceSessions`, which runs the §3.4.3 mastery-aware algorithm with the coverage override on the server and returns the full ordered exercise list. | Selection logic (including the coverage override) lives entirely in the backend (F08 + F10); the client receives a ready-to-use list with no local computation. |
| 4 | Answer checking (incl. normalisation and fuzzy comparison) is server-side: the client calls `POST .../answers` with the raw user answer and receives a correct/wrong verdict plus the canonical answer string. No AI call at answer time. | §3.4.3 bounded-cost rule — comparison runs against pre-generated canonical answers and alternatives in the backend; the client only renders the result. |
| 5 | Mastery updates and vocabulary coverage persistence are triggered by `POST .../complete`; no separate client calls. The backend runs SRS updates and appends encountered vocabulary atomically on session completion. | §3.1.1 — mastery updates are continuous across practice and test; keeping them inside `/complete` avoids partial-write race conditions on the coverage gate. |
| 8 | `POST .../complete` response includes `step2Complete: boolean` and the coverage figures the recap renders (see §5.1 / OQ-6). The client uses `step2Complete` to pick the Practice-complete state and the figures to drive the ring/bar/counts. | Drives the user-driven loop and the recap: the client never derives coverage state itself. |
| 9 | The end-of-round experience is a **screen the user dismisses**, not a blocking overlay or an automatic redirect. The save is fire-and-forget against `/complete`; the recap renders immediately and the user chooses the next step. | §3.1.1 — practice should feel rewarding and self-paced; the old "Saving progress…" modal made finishing feel like a wait and removed user control of the loop. |
| 10 | Round recap stats (answered / mastered / accuracy) are computed **client-side** from the round's local answer log; only coverage figures and unlock timing come from the backend. | Those stats are already known on the client from live play — no extra round-trip; coverage/unlock are server-authoritative. |
| 6 | `RoundButton` for send/next controls; buttons per style guide. | Project convention. |
| 7 | `ResultSheet` is `position: absolute; bottom: 0` within the screen, max-height `calc(100% - 84px)`. | Overlays the exercise content so the Continue button is always reachable without page scroll, per the wireframe. |

### 5.1 API Integrations

All endpoints are on `tome-ms-language` (basepath `NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT`).

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Practice session screen (on entry) | `POST /users/:userId/modules/:moduleId/practiceSessions` | Starts a new practice session. The server runs mastery-aware selection with the coverage override and returns the complete ordered exercise list (type, prompt, distractors/words where applicable). The client stores this list for the session's duration. |
| Practice session screen (on app re-open) | `GET /users/:userId/practiceSessions/:sessionId` | Fetches the full session state for resume. Response: `{ sessionId, userId, moduleId, exercises: Exercise[], answers: PracticeAnswer[], currentPosition: number, retryQueue: string[], startedAt, completedAt }`. The client reconstructs its presentation state by replaying the authoritative `answers` log (see "Session resume reconstruction" in §4); `currentPosition` and `retryQueue` are not relied upon. |
| Check/Send footer (every submission) | `POST /users/:userId/practiceSessions/:sessionId/answers` — body: `{ exerciseId, userAnswer }` | Submits one answer. Returns `{ isCorrect, correctAnswer }`. The client renders `ResultSheet` and `AnswerBox` from this response. The backend also appends the exercise to the retry queue on wrong answers. |
| AI verify tray (`AIVerifyTray`), via "Check with AI" | `POST /exercises/:exerciseId/verifyAnswer` (F13) — body: `{ userAnswer, sessionId, cefrLevel }` | Re-verifies a wrong Translation answer with AI. Returns `{ valid, explanation? }`. On `valid: true` the backend overturns the verdict (marks correct, removes from `retryQueue`, appends to `userContributedAnswers`); the client mirrors this locally. One verification per `(sessionId, exerciseId)` — a repeat returns 409; a non-`translation_active` exercise returns 400. **The endpoint exists** (not in *Missing*). |
| Continue button (end of round) → Practice complete screen | `POST /users/:userId/practiceSessions/:sessionId/complete` | Marks the session complete. The server updates mastery (SRS) for all answered exercises, appends encountered vocabulary to `vocabularyItemsPracticed`, and evaluates the coverage gate. Returns `{ step2Complete: boolean, unseenVocabularyCount?: number }` **plus the coverage figures the recap renders** — see *Missing* below for the fields the screen needs that this response does not yet carry. The client transitions to the Practice complete screen (state chosen by `step2Complete`); it does not auto-route. |
| Practice complete · Coverage milestone (test-unlock card) | `GET /me/progress` (owned by `03-module-overview`) | Read-back of `testUnlocksAt` to show "Module test unlocks in 4h" on the milestone card, if the `/complete` response does not already return it. The progress bar itself stays on the overview. |

**Missing**

| Component or Screen | Missing API endpoint / field |
| ------------------- | ---------------------------- |
| Practice complete · coverage ring & bar | The `POST .../complete` response must return the **coverage before and after this round** (or `vocabularyItemsPracticed` count before/after + total module vocabulary count) so the ring/bar can animate old→new and show "N / N words". Today it returns only `step2Complete` (+ `unseenVocabularyCount?`), which is not enough for the old→new sweep. |
| Practice complete · Coverage milestone (test-unlock card) | `testUnlocksAt` (or the remaining cool-down) at the moment the milestone is shown. It may already be obtainable from `GET /me/progress`, but a fresh value on the `/complete` response would avoid a second call right after completion. To confirm with the backend (`tome-ms-language`). |

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | The SessionBar shows N / total where total matches the exercise count returned by `POST /practiceSessions` (expected ~20 per session). | §3.1.2. |
| 2 | Exercise types appear in recognition→production order; absent types are skipped. | §3.1.1. |
| 3 | Each of the six exercise types renders and accepts input per its design. | Wireframe. |
| 4 | Wrong answers reveal the correct answer and advance. | §3.1.1. |
| 5 | Missed exercises are retried at the end until all are correct. | §3.1.1. |
| 17 | When `POST .../complete` returns `step2Complete: true`, the client navigates to the module overview instead of starting a new session. | §3.1.1. |
| 8 | The frontend submits raw user answers without client-side normalisation or comparison; the backend returns `{ isCorrect, correctAnswer }`. No AI call at answer time. The client separately normalises and compares its own submitted text against `correctAnswer` client-side, purely to decide whether to reveal the exact phrasing on a correct Translation answer (see row 10a) — this does not affect what is submitted or how correctness is judged. | §3.4.3 / backend F10 OQ-01. |
| 9 | A `ResultSheet` appears for every answer submission (correct or wrong, all six exercise types). | Wireframe. |
| 10 | Correct sheet shows green verdict + "Correct!" + Continue; no answer text is shown, except for row 10a. | Wireframe. |
| 10a | Correct Translation sheet reveals the canonical `correctAnswer` (labeled "Exact phrasing") when the accepted answer was a fuzzy (non-exact) match — detected by comparing the submitted text to `correctAnswer` after normalizing both (lowercase/trim/strip punctuation). Verdict stays green/"Correct!". Not shown for other exercise types, and not shown when the submitted text normalizes identically to `correctAnswer`. | Issue #305. |
| 11 | Wrong sheet shows red verdict + "Not quite" + correct answer text + "Explain my mistake" + Continue. | Wireframe. |
| 12 | Wrong Translation sheet additionally shows "Check with AI"; no other exercise type shows it. Tapping it opens the `AIVerifyTray`: verifying (with Cancel) → accepted (overturns the verdict; counts correct and drops from the retry queue; Continue) or not-accepted (shows the AI explanation + correct answer; verdict stands; Got it). | Wireframe + F13. |
| 13 | Long correct-answer text in the wrong sheet is clamped to 2 lines and expandable via tap or drag. | Wireframe. |
| 14 | Typed-answer exercises (Fill in the Blank, Conjugation, Error Correction, Translation) show an `AnswerBox` inline: green if correct, red + strikethrough if wrong. | Wireframe. |
| 15 | MC and Reorder show correct/wrong coloring on options/tiles inline alongside the `ResultSheet`. | Wireframe. |
| 16 | Reopening the practice screen mid-primary-pass resumes at the next unanswered exercise, with the progress bar and N/total counter reflecting already-submitted answers. Reopening mid-retry-pass resumes inside the retry queue at the correct position. | §5.1 / session resume reconstruction. |
| 18 | Finishing a round shows the **Practice complete screen** with no blocking "Saving progress…" overlay; the save happens in the background and is acknowledged by the quiet "Progress saved" chip. | New wireframe. |
| 19 | When `step2Complete` is `false`, the **Round complete** state shows the coverage ring sweeping from the previous % to the new %, the round stats (answered / mastered / accuracy), and the CTAs "Practice another round" + "Back to module". | New wireframe (A). |
| 20 | When `step2Complete` is `true`, the **Coverage milestone** state shows the coverage bar filling to 100% with "N / N words", the "Module test unlocks in …" card, and the CTAs "Back to module" + "Keep practising". | New wireframe (C). |
| 21 | "Practice another round" / "Keep practising" start a new session; "Back to module" navigates to the overview. The loop never advances without a user action. | New wireframe — user-driven loop. |
| 22 | Round stats are computed from the round's answer log: Mastered counts first-try-correct only; Accuracy = first-try-correct ÷ total. | New wireframe. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| ~~1~~ | ~~What does the **"Hint"** chip do?~~ | **Resolved** — Hint chip removed entirely from `SendFooter`; not rendered on any exercise type. |
| ~~2~~ | ~~How is "deferred" in the session bar computed?~~ | **Resolved** — `deferred` = retry-queue count: exercises answered wrong in the current pass that are pending re-presentation. |
| ~~3~~ | ~~What happens when the user taps **"Explain my mistake"** or **"Check with AI"** in the `ResultSheet`?~~ | **Split.** **"Check with AI"** is **implemented and designed** (issue #288): it opens the `AIVerifyTray` backed by F13 (`POST /exercises/:exerciseId/verifyAnswer`). **"Explain my mistake"** remains a **stub no-op** (no wireframe); its backend (F12) exists but the frontend panel is still tracked in issue #275. |
| ~~4~~ | ~~Reorder/error-correction interaction details (drag vs tap) on a phone.~~ | **Resolved** — Sentence Reorder: tap-to-place (tap bank word to add, tap build-area word to return). Error Correction: user rewrites the full corrected sentence in a text input; `CheckFooter` enabled when non-empty. |
| ~~5~~ | ~~What endpoints serve the module's exercise bank and persist exercise results / mastery / coverage?~~ | **Resolved** — see §5.1 API Integrations for the implemented endpoints (`POST /practiceSessions`, `POST .../answers`, `POST .../complete`). |
| 6 | Does `POST .../complete` return the **before/after coverage figures** (or counts) the recap needs for the old→new ring/bar sweep, or must the client fetch them separately? | Critical — see §5.1 *Missing*. The recap cannot render the sweep with only `step2Complete`. Confirm the contract with `tome-ms-language`. |
| 7 | Where does the milestone's "**Module test unlocks in 4h**" timing come from at completion — the `/complete` response or a follow-up `GET /me/progress`? | See §5.1 *Missing*. Avoids a second round-trip if `/complete` carries `testUnlocksAt`. |
| 8 | Does the **headline tone** on Round complete have defined thresholds (e.g. accuracy bands for "strong / keep going / needs work")? | The wireframe says the headline is "performance-driven" but does not specify the bands. Needs a content/UX rule before implementation. |
| 9 | On app re-open **after** `/complete` succeeded but before the user dismissed the recap, should the Practice complete screen be re-shown, or should the user resume on the module overview? | Resume behaviour — the recap is transient screen state, not persisted; the session is already `completedAt`. Default: route to the overview on re-open (the recap is not reconstructed). |
