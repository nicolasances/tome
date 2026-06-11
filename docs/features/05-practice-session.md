# Practice Session — module step 2

![Status](https://img.shields.io/badge/status-implemented-brightgreen?style=flat-square)

## 1. Purpose & Scope

Delivers **Step 2 of the module flow**: a **repeating practice loop** that
introduces the module's vocabulary implicitly through exercises, ordered
recognition → production. Step 2 is **not a single session** — the user runs
`practiceSessionSize`-sized sessions back-to-back until **every vocabulary item
in the module has appeared in at least one exercise** (§3.1.1). Each exercise
updates the mastery score of its linked item, in practice exactly as in the test.
This capability owns the **practice exercise screen**, which renders all **six
exercise types** within a session, plus the shared session progress bar and
answer footers. It is one uninterrupted job (the practice run), so it is a single
feature spanning the six exercise renderings rather than six features.

Design: `exercise-screens.jsx` (`ExShell`, `ExMultipleChoice`, `ExReorder`,
`ExFillBlank`, `ExConjugation`, `ExErrorCorrection`, `ExTranslation`,
`ResultSheet`, `AnswerBox`, `Verdict`, `ContinueBtn`, `SheetBtn`).

Participates in journey **J4** (practise a module).

**Out of scope**:
- The Module overview that launches practice and tracks coverage progress between sessions (owned by `03-module-overview`). It also owns the test-unlock countdown that begins once Step 2 reaches full coverage.
- The **Module Test** (§3.1.1 Step 3) — **skipped** (no wireframe). Practice and the test now update mastery identically; the difference is that the test is scored/gated and practice is not.
- **"Explain my mistake"** AI panel — the *button* is rendered in `ResultSheet` on all wrong-answer states; the panel it opens is **skipped** (no wireframe for the panel itself).
- **AI answer verification** ("Check with AI") — the *button* is rendered in the Translation wrong-answer `ResultSheet`; the panel/flow it triggers is **skipped** (no wireframe).

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | Work through a set of exercises that get progressively more demanding | I build from recognition to production (US-03) |
| 2 | See my progress through the session (done / remaining) | I know how much is left |
| 3 | Be shown the correct answer when I'm wrong and move on | I learn without being blocked |
| 4 | Retry the ones I missed until I get them right | I consolidate before the test |
| 5 | Keep practising until I've seen every word in the module at least once | the test only assesses material the module actually taught me (§3.1.1) |
| 6 | Have my practice answers count towards my mastery scores | my progress reflects everything I do, not just the test (US-05, §3.1.1) |

## 3. Interfaces

**Screen(s):** Practice exercise screen (one screen, six exercise-type bodies),
per `exercise-screens.jsx`. `TomeScreen` titled "Practice".

**Components (all part of this one screen):**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Practice | Session bar (`SessionBar`) | Top progress bar segmented into mastered / remaining / deferred, with an "n / total" counter. | Advances as the user completes exercises in the session. |
| Practice | Instruction label | Per-exercise instruction (e.g. "Choose the correct word", "Arrange the words"). | Reflects the current exercise type. |
| Practice | Exercise body — Multiple Choice | Sentence with a blank + 4 lettered options (A–D); one selectable. | Receptive recognition; select → enables Check. |
| Practice | Exercise body — Sentence Reorder | A build area + a word bank of draggable/tappable tiles. | User arranges all provided words; Check enabled when filled. |
| Practice | Exercise body — Fill in the Blank | Sentence with an inline text input for the missing word/form; optional "Hint" chip. | Controlled production; typed answer submitted via Send. |
| Practice | Exercise body — Conjugation Drill | Verb chip (infinitive + gloss), subject → present-tense input box. | Targeted production of a verb form; submitted via Send. |
| Practice | Exercise body — Error Correction | A sentence with tappable words (tap the wrong one) + a correction input. | User identifies the wrong word and types the fix; Check. |
| Practice | Exercise body — Translation (active) | English prompt + a text input for the Danish translation; optional "Hint" chip. | Free production; submitted via Send. |
| Practice | Check footer (`CheckFooter`) | Full-width "Check" button with enabled/disabled state. | Used by Multiple Choice, Sentence Reorder, and Error Correction; disabled until answerable. |
| Practice | Send footer (`SendFooter`) | Text input + send `RoundButton`, with a "Hint" chip. | Used by Fill in the Blank and Translation only. Conjugation Drill uses a standalone `RoundButton` (right-aligned, no hint chip). |
| Practice | Result sheet (`ResultSheet`) | Bottom sheet pinned to the bottom of the screen; appears after every answer submission, overlaying the exercise body. | **Correct**: dark teal sheet, green `Verdict` badge + "Correct!", `ContinueBtn`. **Wrong**: dark teal sheet, red `Verdict` badge + "Not quite", correct answer revealed in lime text (truncated to 2 lines; tap or drag-up to expand; "Show more / Show less" toggle for long answers), action buttons (`SheetBtn`), `ContinueBtn`. |
| Practice | Answer box (`AnswerBox`) | Inline display of the submitted answer inside the exercise body, shown after submission for typed-answer exercises (Fill in the Blank, Conjugation Drill, Error Correction, Translation). | Green border + ✓ if correct; red border + strikethrough + ✕ if wrong. |
| Practice | Verdict badge (`Verdict`) | Circular icon badge rendered inside `ResultSheet`. | Green (lime) + ✓ for correct; red + ✕ for wrong. |
| Practice | Continue button (`ContinueBtn`) | Full-width button at the bottom of `ResultSheet`. | Lime-on-dark styling; always advances to the next exercise in the session. |
| Practice | Sheet action buttons (`SheetBtn`) | Light outline buttons shown inside the wrong-answer `ResultSheet`. | "Explain my mistake" (magic icon) appears on all wrong-answer states. "Check with AI" (teacher icon) appears only on Translation wrong-answer states. Both are stubs — the panels they open are out of scope. |

**Additional Notes:**
- **Order of types**: exercises are presented recognition → production — Multiple Choice → Sentence Reorder → Fill in the Blank → Conjugation Drill → Error Correction → Translation (§3.1.1). Only types present in the module's exercise bank appear.
- **Loading**: the session is created server-side on screen entry (`POST /practiceSessions`); the response contains the full ordered exercise list. No per-exercise spinner; no AI involved in selection.
- **Answer feedback — `ResultSheet`**: After every submission (Check or Send), a `ResultSheet` bottom sheet slides up and overlays the exercise content. The Continue button in the sheet is always reachable without scrolling. Tapping Continue advances to the next exercise.
- **Per-exercise inline feedback** (in the exercise body, alongside the `ResultSheet`):
  - *Multiple Choice*: The chosen wrong option turns red (✕ badge); the correct option turns green (✓ badge). Both inline changes appear with the `ResultSheet`.
  - *Sentence Reorder*: All word tiles in the build area turn green (correct) or red (wrong).
  - *Fill in the Blank, Conjugation Drill, Error Correction, Translation*: The user's typed answer is replaced by an `AnswerBox` — green + ✓ if correct, red + strikethrough + ✕ if wrong.
- **End of session**: after the full exercise list is completed, missed exercises are retried until all are answered correctly, then `POST .../complete` is called and the session ends.
- **End of Step 2 (full coverage)**: after calling `POST .../complete`, the client checks `step2Complete` in the response. When `true`, control returns to the overview (which starts the test-unlock countdown). When `false`, the client starts a new session. Between-session coverage progress is shown on the overview (owned by `03-module-overview`).
- **Session resume reconstruction**: when the app reopens and the backend returns a 409 for `POST /practiceSessions`, the client calls `GET .../practiceSessions/:sessionId` and reconstructs its presentation state from the response. The backend's `currentPosition` is a flat index across the combined sequence `[primaryExercises..., retryQueue...]`. Client state is reconstructed as follows:
  - `primaryLength` = `exercises.length`
  - **Primary pass** (`currentPosition < primaryLength`): `queue = exercises[currentPosition..]`, `pendingRetry = retryQueue`, `isRetryPhase = false`
  - **Retry phase** (`currentPosition ≥ primaryLength`): `retryIndex = currentPosition − primaryLength`, `queue = retryQueue[retryIndex..]`, `pendingRetry = []`, `isRetryPhase = true`
  - `masteredCount = answers.filter(isCorrect).length` (all correct answers, including retry-pass corrections)
  - `exerciseNumber = Math.min(answers.length + 1, primaryLength)`
  - If the reconstructed `queue` is empty (all exercises answered), the client calls `POST .../complete` immediately.

## 4. Business Logic

- **Session exercises** are the ordered list returned by `POST /practiceSessions`. The frontend presents them in the order received, with no client-side selection or filtering. The SessionBar derives completed / remaining counts from this list.
- **Multi-session loop**: after calling `POST .../complete`, the client checks `step2Complete` in the response. If `false`, start a new session (call `POST /practiceSessions` again). If `true`, navigate to the module overview.
- **Vocabulary is introduced implicitly** through exercises — there is no separate vocabulary-drilling step.
- **Answer submission triggers a feedback state**: after Check or Send, the exercise transitions from `idle` to `correct` or `wrong`. For Multiple Choice and Sentence Reorder a wrong submission enters `retry` (same visual treatment as `wrong`).
- **`ResultSheet` appears for every outcome**:
  - **Correct**: dark teal bottom sheet; green verdict badge + "Correct!"; `ContinueBtn` (lime). No separate answer text — the correct answer is already visually confirmed in the exercise body.
  - **Wrong / retry**: dark teal bottom sheet; red verdict badge + "Not quite"; correct answer revealed in lime text, clamped to 2 lines, expandable by tapping or dragging the sheet up ("Show more / Show less" for long answers); "Explain my mistake" button (all wrong states); "Check with AI" button (Translation only); `ContinueBtn` (lime).
- **Tapping Continue always advances** to the next exercise (or the retry queue / end-of-session).
- **Answer submission is server-side; no AI call at answer time.** The client submits the raw user answer via `POST .../answers` with no client-side normalisation or comparison. The response `{ isCorrect, correctAnswer }` drives `ResultSheet` and `AnswerBox` rendering.
- After the fixed set, **all missed exercises are retried until answered correctly** (§3.1.1). The client tracks wrong answers locally and re-presents them in sequence until all are correct, then calls `POST .../complete`.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]/practice`. | Sub-route of the module flow. |
| 2 | One screen renders all six exercise types via a shared shell; the type switches the body. | Mirrors `ExShell` in the wireframe; one continuous session. |
| 3 | Session exercise selection is server-side: the client calls `POST /users/:userId/modules/:moduleId/practiceSessions`, which runs the §3.4.3 mastery-aware algorithm with the coverage override on the server and returns the full ordered exercise list. | Selection logic (including the coverage override) lives entirely in the backend (F08 + F10); the client receives a ready-to-use list with no local computation. |
| 4 | Answer checking (incl. normalisation and fuzzy comparison) is server-side: the client calls `POST .../answers` with the raw user answer and receives a correct/wrong verdict plus the canonical answer string. No AI call at answer time. | §3.4.3 bounded-cost rule — comparison runs against pre-generated canonical answers and alternatives in the backend; the client only renders the result. |
| 5 | Mastery updates and vocabulary coverage persistence are triggered by `POST .../complete`; no separate client calls. The backend runs SRS updates and appends encountered vocabulary atomically on session completion. | §3.1.1 — mastery updates are continuous across practice and test; keeping them inside `/complete` avoids partial-write race conditions on the coverage gate. |
| 8 | `POST .../complete` response includes `step2Complete: boolean` and the remaining unseen vocabulary count. The client uses this to decide whether to start another practice session or navigate back to the module overview. | Drives the multi-session loop: the client never has to derive coverage state itself. |
| 6 | `RoundButton` for send/next controls; buttons per style guide. | Project convention. |
| 7 | `ResultSheet` is `position: absolute; bottom: 0` within the screen, max-height `calc(100% - 84px)`. | Overlays the exercise content so the Continue button is always reachable without page scroll, per the wireframe. |

### 5.1 API Integrations

All endpoints are on `tome-ms-language` (basepath `NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT`).

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Practice session screen (on entry) | `POST /users/:userId/modules/:moduleId/practiceSessions` | Starts a new practice session. The server runs mastery-aware selection with the coverage override and returns the complete ordered exercise list (type, prompt, distractors/words where applicable). The client stores this list for the session's duration. |
| Practice session screen (on app re-open) | `GET /users/:userId/practiceSessions/:sessionId` | Fetches the full session state for resume. Response: `{ sessionId, userId, moduleId, exercises: Exercise[], answers: PracticeAnswer[], currentPosition: number, retryQueue: string[], startedAt, completedAt }`. The client reconstructs its presentation state from these fields (see "Session resume reconstruction" in §4). |
| Check/Send footer (every submission) | `POST /users/:userId/practiceSessions/:sessionId/answers` — body: `{ exerciseId, userAnswer }` | Submits one answer. Returns `{ isCorrect, correctAnswer }`. The client renders `ResultSheet` and `AnswerBox` from this response. The backend also appends the exercise to the retry queue on wrong answers. |
| Continue button (end of session) | `POST /users/:userId/practiceSessions/:sessionId/complete` | Marks the session complete. The server updates mastery (SRS) for all answered exercises, appends encountered vocabulary to `vocabularyItemsPracticed`, and evaluates the coverage gate. Returns `{ step2Complete: boolean, unseenVocabularyCount?: number }`. The client routes to a new session or back to the module overview based on `step2Complete`. |
| Module overview navigation / session bar | `GET /me/progress` (owned by `03-module-overview`) | Read-back of `practiceCompletedAt`, `testUnlocksAt`, and the per-module step/status used to render the coverage progress bar on the overview. Not called from within the practice session screen itself. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | The SessionBar shows N / total where total matches the exercise count returned by `POST /practiceSessions` (expected ~20 per session). | §3.1.2. |
| 2 | Exercise types appear in recognition→production order; absent types are skipped. | §3.1.1. |
| 3 | Each of the six exercise types renders and accepts input per its design. | Wireframe. |
| 4 | Wrong answers reveal the correct answer and advance. | §3.1.1. |
| 5 | Missed exercises are retried at the end until all are correct. | §3.1.1. |
| 17 | When `POST .../complete` returns `step2Complete: true`, the client navigates to the module overview instead of starting a new session. | §3.1.1. |
| 8 | The frontend submits raw user answers without client-side normalisation or comparison; the backend returns `{ isCorrect, correctAnswer }`. No AI call at answer time. | §3.4.3 / backend F10 OQ-01. |
| 9 | A `ResultSheet` appears for every answer submission (correct or wrong, all six exercise types). | Wireframe. |
| 10 | Correct sheet shows green verdict + "Correct!" + Continue; no answer text is shown. | Wireframe. |
| 11 | Wrong sheet shows red verdict + "Not quite" + correct answer text + "Explain my mistake" + Continue. | Wireframe. |
| 12 | Wrong Translation sheet additionally shows "Check with AI"; no other exercise type shows it. | Wireframe. |
| 13 | Long correct-answer text in the wrong sheet is clamped to 2 lines and expandable via tap or drag. | Wireframe. |
| 14 | Typed-answer exercises (Fill in the Blank, Conjugation, Error Correction, Translation) show an `AnswerBox` inline: green if correct, red + strikethrough if wrong. | Wireframe. |
| 15 | MC and Reorder show correct/wrong coloring on options/tiles inline alongside the `ResultSheet`. | Wireframe. |
| 16 | Reopening the practice screen mid-primary-pass resumes at the next unanswered exercise, with the progress bar and N/total counter reflecting already-submitted answers. Reopening mid-retry-pass resumes inside the retry queue at the correct position. | §5.1 / session resume reconstruction. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| ~~1~~ | ~~What does the **"Hint"** chip do?~~ | **Resolved** — Hint chip removed entirely from `SendFooter`; not rendered on any exercise type. |
| ~~2~~ | ~~How is "deferred" in the session bar computed?~~ | **Resolved** — `deferred` = retry-queue count: exercises answered wrong in the current pass that are pending re-presentation. |
| 3 | What happens when the user taps **"Explain my mistake"** or **"Check with AI"** in the `ResultSheet`? | **Stub no-op** — buttons render but tap does nothing. Tracked in GitHub issue #275; requires a backend API not yet available. |
| ~~4~~ | ~~Reorder/error-correction interaction details (drag vs tap) on a phone.~~ | **Resolved** — Sentence Reorder: tap-to-place (tap bank word to add, tap build-area word to return). Error Correction: user rewrites the full corrected sentence in a text input; `CheckFooter` enabled when non-empty. |
| ~~5~~ | ~~What endpoints serve the module's exercise bank and persist exercise results / mastery / coverage?~~ | **Resolved** — see §5.1 API Integrations for the implemented endpoints (`POST /practiceSessions`, `POST .../answers`, `POST .../complete`). |
