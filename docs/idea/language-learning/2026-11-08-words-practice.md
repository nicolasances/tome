# Words Practice — On-Demand Vocabulary Refresh

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Core Concepts](#2-core-concepts)
3. [Features](#3-features)
4. [Data Models](#4-data-models)
5. [Key User Stories](#5-key-user-stories)
6. [Constraints & Assumptions](#6-constraints--assumptions)
7. [Open Questions](#7-open-questions)
8. [Not Doing (and Why)](#8-not-doing-and-why)
9. [Ideas for Future Versions](#9-ideas-for-future-versions)

---

## 1. Purpose & Scope

**How might we** keep the vocabulary of completed modules alive in active memory — through a short drill the user can start any time from Home — without disturbing the module progression the curriculum is built around?

### 1.1 What is this?

A new practice type, **Words Practice**: a session of **40 words** drawn from every module the user has completed, across all CEFR levels. Each word is shown in **English** and the user types the **Danish**. Missed words come back at the end until answered correctly.

The words are not uniformly random: the draw favours words with **low mastery** and words **not practised for a long time**. Every first-attempt answer feeds the existing per-word `masteryScore` and `lastReviewed` (F06) — there is no second score.

A completed Words Practice session counts as daily activity, shown as its own segment on the Home "This week" chart. It can be started at any time, as often as the user likes, from a button on the Home dashboard.

### 1.2 Who is it for?

The single current Tome user, progressing through the Danish CEFR curriculum, who:
- has completed modules whose vocabulary is no longer practised anywhere (module practice only revisits the *current* module; level tests sample, and only once per level);
- regularly hits "off" moments where no module step is available — e.g. the module test is locked for `testUnlockDelayHours` — and wants something useful to do.

### 1.3 What problems does it solve?

- **Completed-module vocabulary fades.** Once a module is completed, nothing brings its words back except a one-off Level Test. A1/A2 words quietly erode while the user is deep in B1.
- **Mastery never decays, so it lies.** F06 deferred decay: a word mastered six months ago still reads 0.9. Nothing re-checks it. Words Practice re-checks it, and the staleness weight is what brings it back into a session.
- **No useful action on "off" days.** When the next module step is locked, the dashboard offers nothing to do. Words Practice is always available once one module is completed.
- **Weak words are invisible.** The results screen lists the words missed in the session — the first, minimal answer to "which words do I keep failing?"

### 1.4 Out of scope (v1)

- Danish → English direction, recognition formats (multiple choice), self-graded flashcards.
- User-added vocabulary (F22) in the pool.
- Grammar concepts — this is words only.
- A standalone "weakest words" browsing page.
- Noun gender (en/et) enforcement or nudging — moved to future versions (§9).
- Mastery decay in F06.
- Remembering AI-accepted answers (see OQ-01).

---

## 2. Core Concepts

| Term | Definition |
|---|---|
| **Words Practice** | A practice type, separate from module practice, where the user translates single vocabulary items English → Danish. Not tied to any module. |
| **Words Practice Session** | One run of Words Practice: a fixed list of up to `wordsPracticeSessionSize` (default 40) **practice words**, completed when every word has been answered correctly once. At most one open session per user. |
| **Word Pool** | The set of vocabulary items eligible for Words Practice: every `VocabularyItem` referenced by a module whose `UserModuleProgress.status = completed`, at any CEFR level. Recomputed at session start. |
| **Practice Word** | A pool entry after deduplication: one distinct Danish form, grouping every `VocabularyItem` that shares it (see **Word Key**). It is what appears in a session. |
| **Word Key** | The deduplication key of a practice word: `VocabularyItem.danish` normalized — lowercased, trimmed, punctuation stripped, and a leading `at `, `en ` or `et ` removed. `arbejde` and `at arbejde` share a key. |
| **Staleness** | How long since a word was last practised anywhere: `min(daysSince(lastReviewed) / wordsPracticeStalenessHorizonDays, 1)`, in [0, 1]. Default horizon 30 days. |
| **Selection Weight** | `wMastery · (1 − masteryScore) + wStaleness · staleness`, defaults 0.5 / 0.5. Higher weight → more likely to be drawn. |
| **First attempt** | The first answer given to a practice word within a session. Only first attempts update mastery; retries do not. |
| **AI check** | The existing on-demand "Check with AI" (F13), extended to Words Practice: after a wrong answer, the user can ask the AI whether their Danish is a valid translation. One check per answer. Not persisted. |

---

## 3. Features

### 3.1 Word Pool & Weighted Selection (backend)

At session start, `tome-ms-language`:

1. **Builds the pool**: all modules with `UserModuleProgress.status = completed` for the user (all levels) → all `VocabularyItem`s they reference.
   - A module currently being re-practised (F25 reset → no longer `completed`) temporarily drops out of the pool, and its words with it. They return when the module is completed again. Accepted consequence.
2. **Deduplicates** by **word key**. The content contains the same Danish word as several `VocabularyItem`s across modules (e.g. `kollega` ×4, `værelse` ×3 — 120 duplicated forms in the current content). Each group becomes one practice word.
   - Group mastery = **minimum** `masteryScore` across the group (the weakest record drives priority).
   - Group `lastReviewed` = **oldest** across the group.
   - The prompt is taken from one representative item (deterministic: the item from the lowest-CEFR, lowest-ordered module).
3. **Weights** each practice word with the selection weight (§2). `lastReviewed` reflects practice **anywhere** — module practice, module test, level test or Words Practice.
4. **Draws** `min(wordsPracticeSessionSize, poolSize)` words by **weighted random sampling without replacement**. A word cannot appear twice in a session.

Notes:
- Unlike F08, there is **no "mastery > 0.85 → skip" rule**. Mastered-but-stale words are exactly the target; staleness is what surfaces them.
- Every pool word was already met in its module, so `lastReviewed` is normally non-null. If it is null (data gap), staleness = 1.

**Configurable parameters** (backend `Config.ts`, same pattern as `practiceSessionSize`):

| Parameter | Default | Description |
|---|---|---|
| `wordsPracticeSessionSize` | 40 | Max practice words per session |
| `wordsPracticeMasteryWeight` | 0.5 | `wMastery` in the selection weight |
| `wordsPracticeStalenessWeight` | 0.5 | `wStaleness` in the selection weight |
| `wordsPracticeStalenessHorizonDays` | 30 | Days after which staleness saturates at 1 |

### 3.2 Words Practice Session (backend)

- **Start**: creates a session with the drawn words, or — if the user already has an open session — returns it instead (mirrors F10's 409-with-sessionId resume pattern). At most one open Words Practice session per user, independent of any open module practice session.
- **Answer**: records the answer to a practice word, judges it (§3.3), and returns correct/incorrect plus the canonical Danish form.
  - **First attempt**: for **every** `VocabularyItem` in the word's group, call `UserVocabularyProgressStore.appendResultAndRecompute` (F06) — so one answer moves all duplicate records together and keeps them in sync. This also updates `lastReviewed`.
  - **Retries**: recorded on the session only; mastery is not touched.
- **Completion**: when every practice word has been answered correctly at least once, the session is `completed` with `completedAt`. Only completed sessions count as activity.
- **Abandon/resume**: leaving mid-session keeps it open; the next tap on the Home button resumes it at the next unanswered or pending-retry word. First-attempt answers already given have already updated mastery.
- **Empty pool**: start is refused (no completed module → nothing to practise).

### 3.3 Answer Judging

Answers are typed Danish, judged against the practice word's `VocabularyItem.danish`:

1. **Normalization** of both sides: lowercase, trim, punctuation stripped, leading `at `/`en `/`et ` removed. So `at arbejde`, `arbejde` and `Arbejde.` all match `arbejde`; `et hus` matches `hus`.
2. **Fuzzy tolerance**: a small edit-distance slack, consistent with how `translation_active` exercises are compared today (exact threshold to align with the existing implementation — not invented here).
3. **No alternative answers exist** for vocabulary items (unlike exercises). A valid synonym will be marked wrong at first. The recovery path is the **AI check**:
   - Offered after any wrong answer (first attempt or retry).
   - **Valid** → the answer is marked correct. If it was the first attempt, mastery is updated as *correct*. Nothing is persisted on the vocabulary item (one-off).
   - **Invalid** → stays wrong; the AI explains why.
   - One check per answer, on demand only — never automatic. Consistent with F13 and the "AI judges real Danish" change (`2026-10-28-ai-verify-judges-real-danish.md`): the AI judges whether the answer is real, correct Danish for the prompt, not whether it matches the stored form.

### 3.4 Prompt Display (frontend)

The English prompt alone is ambiguous for a meaningful share of the content: 805 of 1,073 vocabulary items have no `context`, and the same English maps to several Danish words (*when* → `da` / `når` / `hvornår`). To keep the drill fair, the prompt always shows:

- `english` (including existing slash variants, e.g. *to live / to reside*);
- the word **type** (noun, verb, connector …);
- `context`, when present.

On wrong answers, the feedback shows the canonical `danish` form.

### 3.5 Words Practice Screen (frontend)

A single-word-at-a-time typed translation screen:
- Session progress bar (answered correctly / total).
- English prompt (§3.4), a `TranslationInput` (keeps the existing æ/ø/å shortcuts), submit.
- Feedback: correct / wrong + canonical Danish; **"Check with AI"** after a wrong answer.
- Missed words are re-queued to the end until correct.
- **Results screen** at completion: words practised, first-attempt accuracy, and the **list of words missed on first attempt** (English → Danish). This is the v1 "weak words" view.

The unused `app/language-learning/vocabulary-practice/page.tsx` (v1 leftover, its backend endpoints no longer exist, nothing links to it) is the natural starting point for this screen. Whether to evolve it or replace it is an implementation decision; either way the dead code and its `TomeVocabularyPracticeAPI` / mock factory should not survive alongside the new feature.

Wireframes for this screen do not exist yet in `docs/ui-design/tome-language-learning` and must be produced before UI implementation (AGENTS.md: wireframes are the source of truth).

### 3.6 Home Dashboard Entry Point (frontend)

- **Desktop**: the "x of N modules" `StatTile` is **replaced** by a Words Practice tile/CTA (the module count stays visible in the Level track).
- **Mobile**: a **"Words"** `RoundButton` is added to the nav row next to **Modules**. The module dots in the Level track stay.
- States:
  - **Pool empty** (no completed module) → disabled, hint *"Complete a module to unlock"*.
  - **Open session** → label reads *Resume* instead of *Start*.
  - Otherwise → *Practice words*, optionally showing pool size (e.g. "312 words").
- The Home page needs the pool size and the open-session flag on load — one lightweight summary call (§4.4).

### 3.7 Activity Counting (backend F24 + frontend chart)

- F24 `GET /me/stats/dailyActivity` gains a fourth per-day count: **`wordsPracticeSessions`** — completed Words Practice sessions whose `completedAt` falls on that day (same timezone bucketing as the other counts).
- The Home "This week" chart stacks it as its **own segment** (a fourth shade).
- `countActiveDays` counts a day with any Words Practice session as active.
- The desktop "sessions this week" counter (`DesktopWeekCounter`, currently `practiceSessions` only) should include Words Practice sessions — see OQ-04.

---

## 4. Data Models

> All models are **proposals** for `tome-ms-language`. Names and paths follow existing conventions but are not final until the backend feature spec is written.

### 4.1 WordsPracticeSession (new collection)

```
WordsPracticeSession {
  id
  userId
  status             // in_progress | completed
  startedAt          // timestamp
  completedAt        // timestamp | null
  words              // WordsPracticeWord[] — fixed at start, in presentation order
}

WordsPracticeWord {
  wordKey            // normalized Danish form (dedup key)
  vocabularyItemIds  // string[] — every VocabularyItem in the group; all updated on first attempt
  promptItemId       // the representative VocabularyItem used for english/type/context
  english            // snapshot of the prompt at session start
  type
  context            // string | null
  danish             // canonical answer (snapshot)
  attempts           // WordsPracticeAttempt[]
  firstAttemptCorrect // boolean | null — null until answered
  correct            // boolean — true once answered correctly (first attempt or retry)
}

WordsPracticeAttempt {
  userAnswer
  isCorrect          // after AI check, if one was used
  aiChecked          // boolean
  isFirstAttempt     // boolean
  timestamp
}
```

Constraint: at most one `WordsPracticeSession` with `status = in_progress` per `userId`.

### 4.2 UserVocabularyProgress / ExerciseResult (existing, F06 — reused)

No schema change to `UserVocabularyProgress`. Words Practice appends an `ExerciseResult` per group item on first attempt. Two fields need a decision because `ExerciseResult` was designed for exercises:

| Field | Value for Words Practice |
|---|---|
| `exerciseId` | Currently **required** — there is no exercise. Proposal: make nullable, or store the session id. See OQ-03. |
| `type` | New value `words_practice` |
| `moduleId` | `null` (already nullable for level tests) |
| `userAnswer`, `correctAnswer`, `isCorrect`, `timestamp` | As usual |

### 4.3 DailyActivity day (F24 — extended)

```
{ date, practiceSessions, successfulModuleTests, successfulLevelTests, wordsPracticeSessions }
```

### 4.4 Proposed endpoints (tome-ms-language)

Paths are relative to the microservice basepath (the basepath lives in the `NEXT_PUBLIC_..._API_ENDPOINT` config, per AGENTS.md), and wrapped in a new `/api` class (e.g. `TomeWordsPracticeAPI`).

| Method | Path | Purpose |
|---|---|---|
| GET | `/me/wordsPractice/summary` | `{ poolSize, openSessionId \| null }` — drives the Home button state |
| POST | `/me/wordsPractice/sessions` | Start a session (201) or return the open one (409 + `sessionId`); 400/409-style refusal when the pool is empty |
| GET | `/me/wordsPractice/sessions/:sessionId` | Load / resume a session |
| POST | `/me/wordsPractice/sessions/:sessionId/answers` | `{ wordKey, answer }` → `{ isCorrect, correctAnswer }`; updates mastery on first attempt |
| POST | `/me/wordsPractice/sessions/:sessionId/answers/verify` | AI check of the latest wrong answer for a word → `{ valid, explanation? }` |
| POST | `/me/wordsPractice/sessions/:sessionId/complete` | Close the session once all words are correct (or auto-complete on the last correct answer — implementation choice) |

`/me` vs `/users/:userId`: F24 and `/me/progress` use `/me`; F10/F11 use `/users/:userId`. See OQ-05.

---

## 5. Key User Stories

| # | As a user, I want to… | So that… |
|---|---|---|
| US-01 | Start a Words Practice session from Home at any time | I can do something useful even when no module step is available |
| US-02 | Be asked words from every module I have completed, at every level | A1/A2 vocabulary doesn't fade while I study B1 |
| US-03 | Get mostly words I'm weak on or haven't seen in a while | The session spends time where my memory is failing, not on what I already know |
| US-04 | Type the Danish for an English word, with its type and context shown | I practise active recall, and the prompt is never ambiguous |
| US-05 | See missed words come back at the end of the session | I leave the session having produced every word correctly once |
| US-06 | Ask the AI to check an answer marked wrong | A valid synonym doesn't count against me |
| US-07 | Leave mid-session and resume later | A 40-word session doesn't have to be done in one sitting |
| US-08 | See which words I missed at the end of a session | I know which words are weak |
| US-09 | See my Words Practice sessions in the "This week" chart | This practice counts as daily effort, visibly |
| US-10 | Have my answers update the same mastery the modules use | There is one truth about how well I know a word |

---

## 6. Constraints & Assumptions

**Constraints**
- **One score per word.** Words Practice reuses `UserVocabularyProgress.masteryScore` / `lastReviewed` (F06). No separate success ratio.
- **Pool = completed modules only**, any CEFR level. The in-progress module's words are excluded, as are words of a module under re-practice.
- **English → Danish, typed.** No other direction or format in v1.
- **No live AI except the on-demand check**, consistent with idea.md §3.4.3. No generation at session time.
- **Deduplicated sessions.** A Danish form appears at most once per session; one answer updates every duplicate item.
- **One open Words Practice session per user**, independent of module practice sessions.
- **No new UI before wireframes.** The Words Practice screen, results screen and Home entry-point variants must be designed in `docs/ui-design/tome-language-learning` first.

**Assumptions** (unvalidated bets)
- **Isolated word recall is a fair mastery signal.** Words Practice will push many words above 0.85 mastery, and F08 then **deprioritizes** their exercises in module and level tests. We bet that knowing a word in isolation is good enough evidence to see it less in context. If level-test vocabulary performance drops, revisit (e.g. a separate weight, or capping the mastery contribution of `words_practice` results).
- **40 + retry-until-correct is sustainable.** At ~70% first-attempt accuracy a session is ~55 typed answers. If sessions are routinely abandoned, lower `wordsPracticeSessionSize` (config, no spec change).
- **The on-demand AI check is enough to absorb synonyms.** Without persistence, the same valid synonym is rejected every time it recurs. If this becomes routine friction, see OQ-01.
- **The word-key normalization is accurate enough.** Stripping `at`/`en`/`et` and punctuation is assumed to merge true duplicates without merging distinct words. Homographs with different meanings (same Danish, different English) would be merged — assumed rare.
- **The pool is large enough to matter.** Assumes the user has several completed modules; with one module the session is just that module's words.
- **Staleness from `lastReviewed` is meaningful.** It reflects practice anywhere, so words of a module just completed are "fresh" and rarely drawn — intended.

---

## 7. Open Questions

| # | Question | Options / Notes |
|---|---|---|
| OQ-01 | Should AI-accepted answers be remembered? | v1 decision: **no** (one-off). Revisit after ~2 weeks of use. Option: `userContributedAnswers` on `VocabularyItem`, mirroring `Exercise`. |
| OQ-02 | Should duplicate `VocabularyItem`s be merged in the content itself? | The data model says items are canonical and shared; the content duplicates them per module (120 forms). Words Practice works around it with grouping. A content/data clean-up would fix it at the root and also benefit F06/F08. |
| OQ-03 | How does `ExerciseResult.exerciseId` (required) work without an exercise? | Make nullable, or store the session id / a synthetic id. Affects F06. |
| OQ-04 | Should the desktop "sessions this week" counter include Words Practice? | Recommended yes; the chart already stacks it. |
| OQ-05 | `/me/...` or `/users/:userId/...` paths? | F24 and `/me/progress` use `/me`; F10/F11/F25 use `/users/:userId`. Pick one for the backend spec. |
| OQ-06 | What fuzzy-match threshold for single words? | Single words are short — a 1-edit tolerance on a 3-letter word can accept a different word. Align with the existing `translation_active` comparison, possibly length-scaled. |
| OQ-07 | Should "Explain my mistake" (F12) be available too? | Probably not needed: the AI check already explains invalid answers. |
| OQ-08 | Ambiguous prompts with no context (e.g. *when* → `hvornår`, `context: null`) | v1 shows type + context. Backfilling `context` for ambiguous items is a content task worth considering. |

---

## 8. Not Doing (and Why)

- **A separate success-ratio score** — two numbers per word that can disagree is worse than one. Mastery already has history and SRS semantics.
- **Due-words-only sessions (true SRS, variable size)** — needs decay, which F06 deferred; a button that sometimes says "nothing to do" undermines the habit goal.
- **Reusing `translation_active` exercises** — they carry alternatives, but many are sentences. It would become sentence practice, not words practice.
- **Backfilling alternative answers for every vocabulary item** — considered the cleanest fix for synonyms; set aside in favour of the on-demand AI check. Kept as a future option.
- **Danish → English / multiple choice / flashcards** — production is the point; recognition is already well covered by module practice rung 1.
- **Including the in-progress module's words** — module practice already covers them.
- **User-added words (F22)** — tempting, but they cut across the "completed modules" rule and have no curriculum context. Separate decision.
- **A "weakest words" page** — the results-screen list covers the v1 need.
- **Removing the module dots on mobile** — the dots are the level-progress anchor (01-home-dashboard); the button goes in the nav row instead.

---

## 9. Ideas for Future Versions

- **Noun gender nudge** — accept `hus`, but show `et hus` in feedback; optionally require en/et later. Needs an en/et `gender` field on the 422 nouns (AI backfill + content-generation skill changes). Knowing a noun without its gender is half-knowing it.
- **Remember AI-accepted answers** — `userContributedAnswers` on `VocabularyItem` (OQ-01).
- **Backfill alternative Danish answers** per vocabulary item at seeding time, removing most false negatives without AI calls.
- **Mastery decay in F06** — would let Words Practice switch to "due words" and make mastery honest over time.
- **Weakest-words view** — browse words by mastery / staleness, start a session from a filtered set.
- **Filtered sessions** — by CEFR level, by module, or "only words I missed last time".
- **User-added words in the pool** (relates to idea.md §9.1).
- **Danish → English and audio** (when audio is in scope).
- **Streaks** using the new `wordsPracticeSessions` count.
