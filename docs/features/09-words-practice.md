# 09 — Words Practice

![Status](https://img.shields.io/badge/status-implemented-brightgreen?style=flat-square)

> **Designed without wireframe.** There is no wireframe for these screens in `docs/ui-design/tome-language-learning`. They are specified by reusing the patterns of screens that *are* wireframed — the practice session's Translation exercise and `ResultSheet` / `AIVerifyTray` (`exercise-screens.jsx`) and the Practice complete screen, variant A (`practice-complete-screens.jsx` → `PCRoundComplete`). See OQ-01: the design must be validated (or a wireframe produced) before UI implementation.

## 1. Purpose & Scope

Delivers **Words Practice** end-to-end: a session in which the user translates single words from the vocabulary of every module they have completed, **English → Danish**, typed, until every word has been answered correctly once — and the results screen that closes it. The purpose is to keep old vocabulary alive in memory and to give the user something useful to do at any time, independently of the module flow.

Owns two screens, which form one uninterrupted job (start → answer all words → see results → practise more or go home):
- **Words Practice session** — one word at a time, typed answer, immediate feedback, "Check with AI" after a wrong answer, missed words retried at the end.
- **Words Practice results** — first-attempt accuracy and the list of words missed.

Also owns the client API wrapper for Words Practice (`TomeWordsPracticeAPI`), used by this feature and by the Home entry point (`01-home-dashboard`), and the **removal of the legacy (pre-v2.0) vocabulary-practice code**, which this feature replaces.

Participates in journey **J7** (Refresh my vocabulary) in `00-user-journeys.md`.

Idea: [`docs/idea/language-learning/2026-11-08-words-practice.md`](../idea/language-learning/2026-11-08-words-practice.md)

Backend: `tome-ms-language` [F26 — Words Practice Session](https://github.com/nicolasances/tome-ms-language/blob/main/docs/features/F26-words-practice-session.md), [F27 — Word Answer Verification](https://github.com/nicolasances/tome-ms-language/blob/main/docs/features/F27-word-answer-verification.md).

**Out of scope**:
- The Home entry point (tile / button, its enabled/resume states) and the "This week" chart segment — owned by `01-home-dashboard`.
- Module practice, module test, level test (`05`, `06`, `07`) — unchanged; this feature reuses some of their components.
- "Explain my mistake" — not offered in Words Practice.
- Danish → English, multiple choice, noun-gender (en/et) feedback, a "weakest words" browsing page.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| US-01 | Translate words from all my completed modules, English → Danish | old vocabulary doesn't fade while I study new modules |
| US-02 | See the word type and its context next to the English prompt | the prompt is never ambiguous (e.g. which "when") |
| US-03 | Be told immediately if I'm right, and see the Danish when I'm wrong | I learn from each word |
| US-04 | Ask the AI to check an answer that was marked wrong | a valid synonym doesn't count against me |
| US-05 | Get my missed words again at the end of the session | I leave having produced every word correctly once |
| US-06 | Leave mid-session and pick it up later from Home | a 40-word session doesn't need one sitting |
| US-07 | See at the end how many I got right first time and which words I missed | I know which words are weak |
| US-08 | Start another session straight from the results | I can keep going if I have time |

## 3. Interfaces

**Screen(s):**
- **Words Practice session** — route `/language-learning/words-practice/[sessionId]`.
- **Words Practice results** — route `/language-learning/words-practice/[sessionId]/results`.

Both render inside the standard `TomeScreen` chrome, titled "Words Practice", with the back button returning to Home (`/language-learning`). Responsive like the module practice screens (phone layout below `lg:`, centred content column above it).

**Components (Words Practice session):**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Session | Session progress bar (`SessionProgressBar`) | Thin bar at the top. | Fills with **words answered correctly ÷ words in the session** (including words accepted by the AI). The green part does not move on a wrong answer; instead the words waiting for a retry fill the lime segment on the right, as in module practice. |
| Session | Kicker | Small uppercase label above the prompt, e.g. "Word 12 of 40", or "Retry · 3 left" once the user is in the retry loop. | Tells the user where they are; switches to the retry wording after the first pass through the list. |
| Session | Prompt card | The English prompt in large type (`english`, including slash variants such as "to live / to reside"), with two small chips beneath: the word **type** (noun, verb, connector …) and, when present, the **context** note. | Always shows type; shows context only when the word has one. Same visual language as the Translation exercise prompt (`ExTranslation`). |
| Session | Answer input (`AnswerAreaInput`) | Borderless, underlined, centred Danish text input (the one used by the Translation exercise) with placeholder "Type the Danish…". | Autofocused on each new word. Keeps the existing æ/ø/å keyboard shortcuts (e.g. Cmd+A → æ). Disabled while an answer is being checked. |
| Session | Check footer (`CheckFooter`) | "Check" button pinned at the bottom. | Enabled when the input is non-empty. Enter submits. Calls the answer endpoint, then shows the result sheet. |
| Session | Result sheet — correct (`ResultSheet`) | Same bottom sheet as module practice, correct state. | Shows "Correct" and the canonical Danish (useful when a typo was accepted, or an article was dropped). **Continue** (or Enter) goes to the next word. |
| Session | Result sheet — wrong (`ResultSheet`) | Same bottom sheet, wrong state, with the user's answer and the correct Danish. Contains one action button: **"Check with AI"** (teacher icon, `SheetBtn`). No "Explain my mistake". | **Continue** re-queues the word at the end of the list and goes to the next word. "Check with AI" (also Cmd+. on desktop) replaces the sheet with the AI verify tray. |
| Session | AI verify tray (`AIVerifyTray`) | Reused from module practice: loading → accepted / not accepted, same copy rules (the AI judges real Danish, not a match with the stored word). | **Accepted**: the word counts as correct — progress bar fills, the word is **not** re-queued; the note shown is the AI `explanation` if present, else the fixed accepted line. **Not accepted**: shows the AI explanation and the correct Danish; "Got it" re-queues the word and moves on. **Cancel** during loading returns to the wrong-answer sheet. One check per answer: the button is not shown again for the same answer. |

**Components (Words Practice results):**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Results | Headline + subline | "Words refreshed" with a subline adapting to first-attempt accuracy (e.g. strong / solid / needs work). | Performance-driven tone, as on the module Practice complete screen. |
| Results | Stats (`MiniStat` ×3) | **Words** (words in the session), **First try** (first-attempt correct, including AI-accepted first attempts), **Accuracy** (First try ÷ Words, %). | Rise-in on mount, as in Practice complete. |
| Results | Missed words list | Title "Words to review" and one row per word missed on the first attempt: English prompt → Danish. | Ordered as presented in the session. When no word was missed: a single positive line ("No misses — every word right first time") instead of the list. |
| Results | Saved chip (`SavedChip`) | "Progress saved". | Non-blocking acknowledgement, as in Practice complete. |
| Results | Primary CTA — "Practice more words" (`PrimaryBtn`, lime) | Full-width. | Starts a new Words Practice session and navigates to it. If the backend reports an open session (409), navigates to that one instead. |
| Results | Secondary CTA — "Back to home" (`GhostBtn`) | Full-width. | Navigates to Home. |

**Additional Notes:**
- **Loading**: skeleton for the prompt card while the session loads; results show skeleton stats while the session loads.
- **Session not found / not the user's** (404): inline error with a "Back to home" button.
- **Opening the session route of a completed session** redirects to its results route; opening the results route of an in-progress session redirects to the session route.
- **Resume**: on load, the client rebuilds its queue from the session: words with no attempt first (in presentation order), then words with only wrong attempts (retry queue). Progress bar and kicker reflect the restored state.
- **Leaving mid-session** (back button, closing the app): nothing to confirm — the session stays open server-side and Home shows *Resume*.
- **End of session**: after the last word is answered correctly, the client calls `complete` and navigates to the results route. No blocking overlay.
- **Error on answer submit**: the input stays filled and an inline error offers to retry; the word is not consumed.
- **Error / timeout on "Check with AI"**: the tray shows an error with "Back", returning to the wrong-answer sheet; the user can try again or continue.

## 4. Business Logic

- **Starting a session** (from the results CTA here, and from Home in `01`): `POST /users/:userId/wordsPracticeSessions`. 201 → navigate to the new session. 409 → navigate to the `sessionId` in the error body (resume). 400 `emptyPool` → should not happen from the UI (Home disables the entry point when the pool is empty); if it does, show "Complete a module to unlock Words Practice" and return Home.
- **Word queue**: words are presented in the session's order. A wrong answer (including a "not accepted" AI verdict, or continuing without checking) appends the word to the end of the queue. The pass through the original list comes first; the retry loop follows and repeats until the queue is empty.
- **Judging is server-side**: the client sends `{ wordKey, userAnswer }` and renders `{ isCorrect, correctAnswer }`. The client never compares answers itself.
- **Mastery is server-side**: the client does nothing to mastery; first-attempt vs retry semantics live in the backend (F26).
- **"Check with AI"**: offered only on the wrong-answer sheet of the answer just given, once per answer. Calls `POST …/answers/verify` with `{ wordKey, cefrLevel }`; the user's CEFR level comes from the user profile / progress already loaded by the app. On `valid: true` the client mirrors the backend: the word becomes correct (progress bar), is removed from the retry queue, and — if it was the word's first attempt — counts as "first try" in the results.
- **Completing**: when the queue is empty, `POST …/complete`. A 400 with `outstandingWordKeys` (client/server drift) puts those words back in the queue and continues the session.
- **Results** are derived from `GET …/:sessionId` (completed session): Words = `words.length`; First try = count of `firstAttemptCorrect = true`; Accuracy = First try ÷ Words; Missed words = words with `firstAttemptCorrect = false`, showing `english` → `danish`. The results page can be reloaded.
- **Legacy removal**: the pre-v2.0 vocabulary practice is deleted with this feature — the `vocabulary-practice` and `summary` routes under `/language-learning`, the `TomeVocabularyPracticeAPI` / `IVocabularyPracticeAPI` / `MockVocabularyPracticeAPI` / `VocabularyPracticeAPIFactory` / `PracticeSessionHelper` API files, the `VocabularyPractice` model, and the `NEXT_PUBLIC_VOCAB_PRACTICE_MOCK` setting. Its backend endpoints no longer exist and nothing in the v2.0 app links to it. The unrelated legacy `sentence-practice` / `sentence-summary` routes are not touched.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Two routes, session and results, as for module practice (`05`, decision 1). | Deep-linkable; the results page can be refreshed; the session page never owns the recap. |
| 2 | Reuse `AnswerAreaInput` / `AnswerBox`, `SessionProgressBar`, `CheckFooter`, `ResultSheet`, `SheetBtn`, `AIVerifyTray`, `MiniStat`, `SavedChip`, `PrimaryBtn`, `GhostBtn`. Components currently under the module practice folder that are needed here are moved to a shared location rather than duplicated. | Same interaction language as module practice; no second copy of the AI tray. The move is a refactor with no behaviour change for `05`/`06`. |
| 3 | All Words Practice calls go through a new `TomeWordsPracticeAPI` class in `/api`, with paths relative to the `tome-ms-language` basepath (AGENTS.md). | Project convention; shared with `01`'s entry point. |
| 4 | The AI tray is driven by a different endpoint than in module practice (F27, not F13). `AIVerifyTray` takes its verify action as an input rather than calling F13 itself, if it does not already. | Keeps one tray component for both flows. |
| 5 | Delete the legacy vocabulary practice code instead of evolving it. | Its data shape and backend no longer exist; `00-user-journeys` already flags it as legacy to be replaced. Keeping it alongside invites confusion. |
| 6 | Screens designed without a wireframe, from wireframed patterns. | User decision for this feature; to be validated (OQ-01). |
| 7 | `AIVerifyTray` already took its phase and answers as props. The verify call is what differs, so `useAnswerVerification` takes an optional verifier (default: F13); Words Practice passes its F27 call. `ResultSheet` takes `exerciseType` instead of a module-practice `Exercise`, plus `showExplain` (default true; false here). | Keeps one tray and one sheet for all flows, with no behaviour change for `05`/`06`/`07`. |
| 8 | Shared practice components live in `components/practice/` (`ResultSheet`, `CheckFooter`, `AIVerifyTray`, `MiniStat`, `SavedChip`, `AnswerBox` / `AnswerAreaInput`). | Moved, not copied. |
| 9 | The queue / resume logic (`utils/wordsPracticeQueue.ts`) and the results derivation (`utils/wordsPracticeResults.ts`) are pure functions with unit tests. | The screens only render them. |
| 10 | On an error or timeout of "Check with AI", the hook returns silently to the wrong-answer sheet (shared behaviour with module practice); no inline error text is shown. | Reused as is; the user can continue. An explicit error message in the tray is not implemented. |

### 5.1. API Integrations

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Results — "Practice more words" (and Home, via `01`) | `POST /users/:userId/wordsPracticeSessions` (F26) | Starts a session; 201 → new session; 409 `{ sessionId }` → resume that one; 400 `emptyPool` when nothing to practise. |
| Session screen, Results screen (load) | `GET /users/:userId/wordsPracticeSessions/:sessionId` (F26) | Full session: `status`, `words[]` with `wordKey`, `english`, `type`, `context`, `danish`, `attempts[]`, `firstAttemptCorrect`, `correct`. Drives resume and the results. |
| Check footer | `POST /users/:userId/wordsPracticeSessions/:sessionId/answers` (F26) — body `{ wordKey, userAnswer }` | Judges the answer server-side → `{ isCorrect, correctAnswer, isFirstAttempt }`. |
| AI verify tray | `POST /users/:userId/wordsPracticeSessions/:sessionId/answers/verify` (F27) — body `{ wordKey, cefrLevel }` | AI check of the answer just given → `{ valid, explanation? }`. 409 if already checked. |
| End of session | `POST /users/:userId/wordsPracticeSessions/:sessionId/complete` (F26) | Closes the session; 400 + `outstandingWordKeys` if words are still not correct. |

**Missing**

None. `tome-ms-language` F26 and F27 are implemented.

---

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | A started session shows one English prompt at a time with its type (and context when present), accepts a typed Danish answer, and shows correct / wrong with the canonical Danish. | |
| 2 | Wrong words come back after the first pass and keep coming back until correct; the session ends only when every word is correct. | |
| 3 | "Check with AI" appears only after a wrong answer, once per answer; an accepted verdict counts the word as correct and does not re-queue it. | |
| 4 | Leaving and returning (via Home *Resume*) restores the queue, the progress bar and the kicker. | |
| 5 | The results screen shows Words / First try / Accuracy and the missed words, and survives a reload. | |
| 6 | "Practice more words" starts a new session (or resumes an open one on 409). | |
| 7 | The legacy `vocabulary-practice` and `summary` routes and their API/model files are gone, and the build has no references to them. | |
| 8 | Module practice and module test still render and behave identically after shared components are moved. | Regression. |
| 9 | Phone layout below `lg:`, centred column on desktop; keyboard: Enter submits / continues, Cmd+. triggers "Check with AI". | |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| OQ-01 | Validate the session and results screen design (no wireframe exists). | **Open** — implemented from the module practice and Practice complete patterns by explicit user decision, without a wireframe. Still to be validated visually; produce a wireframe in `docs/ui-design/tome-language-learning` if the design needs to change. |
