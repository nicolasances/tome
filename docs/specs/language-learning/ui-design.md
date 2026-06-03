# Tome — Language Learning: UI Design

**Design Document v1.0**
*Companion to [idea.md](./idea.md) (v2.0) — Danish · CEFR A1–C2*

---

## How to read this document

This document describes the **complete target UI** for the new Language Learning section, rebuilt from scratch on top of [idea.md](./idea.md). The existing `app/language-learning/` section (sources, sentences, vocabulary-practice, knowledge-base built on the *old* concept) is **removed entirely** and replaced by the pages below.

It is written to match the existing Tome conventions:

- **Mobile-first.** Every screen is designed for a phone. On desktop, content is centered in a `max-w-2xl` column (same as the rest of the app).
- **`toto-react` + Tailwind** for components and styling.
- **Header-driven navigation.** Each page sets its title and back button through the `useHeader` context. There is **no bottom tab bar** — the Home Dashboard is the hub, and every sub-page is reached from it and returns via the header back button.
- **Simplicity first.** One job per screen. No nested navigation paradigms, no clever layouts. The exercise player is a single full-width column, one exercise at a time.

### Design decisions taken (recorded so they are not re-litigated)

| Decision | Choice |
|---|---|
| Doc scope | **Full target vision** — every feature in the idea gets a UI, regardless of current backend readiness. |
| Home layout | **Scrollable dashboard** — prominent CEFR level on top, module list below, secondary actions at the bottom. |
| Module flow | **Continuous guided run** — opening a module auto-flows grammar intro → practice in one uninterrupted session. The Module Test is always separate (it is time-locked). |
| In-section navigation | **Header back-button only.** Dashboard is the hub. |

### Backend readiness legend

Each page notes which backend features it depends on. As of this writing only catalog/seeding and mastery storage exist:

- 🟢 **Implemented:** F01 Vocabulary Catalog, F02 Grammar Concept Catalog, F03 Module Catalog, F04 Exercise Bank, F06 Mastery & Progress Tracking.
- ⚪ **Pending:** F05 User Profile/CEFR, F07 Module Progress, F08 Selection, F09–F11 Module flow, F12–F13 AI touchpoints, F20–F21 Level tests, F22 User vocab, F23 Content analysis.

The UI is the north star; pages whose backend is pending are marked so build can be sequenced.

---

## 1. Page Overview

The interface is a small set of focused pages. The **Home Dashboard** is the center of gravity; everything else is launched from it (or from a Content Report) and returns to it.

| # | Page | Route | Responsibility | Backend |
|---|------|-------|----------------|---------|
| P1 | **Home Dashboard** | `/language-learning` | The hub. Shows current CEFR level (prominent), the module list for that level with per-module status, the Level Test gate, and entry points to the secondary surfaces. Always the landing page. | F05, F07, F03 |
| P2 | **Module Run** | `/language-learning/modules/[id]/run` | The continuous guided learning session for a module: grammar intro cards → practice exercises, in one uninterrupted flow. Resumes where the user left off. | F09, F10, F08 |
| P3 | **Exercise Player** | *(component, used by P2/P4/P7)* | The shared single-exercise UI: renders any of the 6 exercise types, captures the answer, shows feedback, and exposes on-demand AI helpers (explain, verify). Not a standalone route. | F08, F12, F13 |
| P4 | **Module Test** | `/language-learning/modules/[id]/test` | The locked, graded 20-question assessment. No feedback during the test; mastery is updated on submit. | F11 |
| P5 | **Test Results & Review** | `/language-learning/modules/[id]/test/result` | Post-test screen: final score, pass/fail, and a per-question review with correct answers and on-demand "explain my mistake". Reused (with a weak-areas section) by the Level Test. | F11, F12 |
| P6 | **Level Test** | `/language-learning/level-test` (+ `/result`) | The cumulative level assessment that unlocks the next CEFR level. Uses the Exercise Player; results add a weak-areas summary. | F20, F21, F12 |
| P7 | **Analyze Content** | `/language-learning/analyze` | Paste-a-text input surface. Submits text and shows a loading state while the report is generated. | F23 |
| P8 | **Content Report** | `/language-learning/analyze/[reportId]` | The curriculum gap report for a pasted text, with actions: add unknown words, jump to a suggested module, or generate a custom module. | F23, F22 |
| P9 | **Add Vocabulary** | `/language-learning/vocabulary/add` | Minimal form to capture a Danish word + English translation the user encountered. Stored only (not practiced in v2.0). | F22 |
| P10 | **Knowledge Base** | `/language-learning/knowledge` | Browse what the user has learned: vocabulary list (with mastery) and grammar concepts list. Read-only reference + motivation. | F01, F02, F06 |
| P11 | **Create Custom Module** | `/language-learning/modules/new` | Generate a new module from a natural-language prompt (US-02). Also the destination of "Generate custom module" from a Content Report. Shows generation progress. | F03 (create), generation tool |

A user who only ever uses P1 → P2 → P4 → P5, advancing through modules and into P6, has the complete core learning loop. P7–P11 are surrounding surfaces.

### Navigation map

```
                         ┌─────────────────────────┐
                         │   P1  Home Dashboard     │
                         └─────────────────────────┘
        ┌──────────┬──────────┬─────────┬──────────┬───────────┐
        ▼          ▼          ▼         ▼          ▼           ▼
   P2 Module   P4 Module  P6 Level  P7 Analyze  P9 Add    P10 Knowledge
      Run         Test       Test      Content    Word        Base
        │          │          │         │
        ▼          ▼          ▼         ▼
   (P3 Exercise Player)   P5/P6     P8 Content Report
        │          │      Results       │
        └──► back to P1 ◄──┘            ▼
                                   P11 Create Custom Module ──► P2
```

Every arrow is reversible via the header back button. There are no deep navigation stacks: the maximum depth is 2 (Dashboard → page → result).

---

## 2. P1 — Home Dashboard

**Route:** `/language-learning` · **Backend:** F05 (CEFR level), F07 (module progress), F03 (module list) — *pending*

### Responsibility

The single hub of the section. It answers three questions at a glance: *where am I (level)?*, *what do I do next (module list)?*, and *how do I get to the other surfaces (secondary actions)?* It is a single scrolling column, no tabs.

### Layout (top → bottom)

```
┌──────────────────────────────┐
│           LEVEL  A1           │   ← Level header (prominent)
│      ▓▓▓▓▓░░░  4 / 9 modules   │
├──────────────────────────────┤
│  ✓  Greetings                 │   ← Module list
│  ✓  Numbers & counting        │
│  ▶  At the café        45%    │
│  •  Daily routine             │
│  🔒 Shopping                   │
│  🔒 Directions                 │
│           ⋯                    │
│  ── 🔒 Level Test ──           │   ← Level Test gate
├──────────────────────────────┤
│   🔍 Analyze    ＋ Word    📖   │   ← Secondary actions
│        (this week's streak)    │   ← Stats (optional)
└──────────────────────────────┘
```

#### 2.1 Level header

- The **current CEFR level** (`User.cefrLevel`) rendered large and prominent — it is the primary motivational anchor (US-01, idea §3.5). E.g. a big `A1`.
- A **progress bar + counter** of modules completed at this level: `4 / 9 modules`. The bar fills as modules reach `completed`.
- Tapping the header does nothing (it is a status display, not a control). Keep it calm and confident.

#### 2.2 Module list

A vertical list of the modules for the current level (the `Module`s where `cefrLevel === user.cefrLevel`), each a single row. The row shows the module **title** and a **status indicator** derived from `UserModuleProgress.status`:

| Status | Indicator | Tap behavior |
|---|---|---|
| `completed` | ✓ (filled/green) | Re-open → starts a fresh practice run (P2) using mastery-aware selection. Useful for review. |
| `in_progress` | ▶ + percent (e.g. `45%`) | **Resume** the Module Run (P2) where the user left off. |
| `available` | • (neutral dot) | **Start** the Module Run (P2). On first tap, status → `in_progress`. |
| `available`, practice done, test locked | ⏳ `Test unlocks in 3h` | Tap shows the same lock message; no action until unlock. |
| `available`, test unlocked | 🎯 `Test ready` (highlighted) | Tap → Module Test (P4). |
| `locked` | 🔒 (muted) | Not tappable. (Locking policy is a curriculum decision — see Open Question note below.) |

Only **one visual emphasis** at a time: the module the user should act on next (the first `in_progress`, or the first `test ready`) is the visually dominant row. Everything else is quiet. This keeps the "what next?" obvious.

> **Note on locking.** idea §3.5 gates *levels*, not individual modules within a level. The simplest v1 is: **all modules at the current level are `available` from the start** (no `locked` rows), and the user picks order freely. If a sequential path is desired later, the `locked` state above is ready. Flagged as a build-time choice; default to all-available for simplicity.

#### 2.3 Level Test gate

Below the module list, a full-width divider row for the **Level Test**:

- **Locked** (default) while not all modules at the level are `completed`: shows `🔒 Level Test — complete all modules to unlock`. Not tappable.
- **Unlocked** once every module is `completed`: becomes a prominent button `🎯 Take the Level Test` → P6.

This placement (after the modules) reinforces it as the finish line of the level.

#### 2.4 Secondary actions

A compact row of three small icon buttons (`RoundButton`, matching the current section's visual language):

- 🔍 **Analyze** → P7 Analyze Content
- ＋ **Word** → P9 Add Vocabulary
- 📖 **Knowledge Base** → P10

These are intentionally small and out of the main flow — they are tools, not the core loop. **Create Custom Module (P11)** is reachable from here too, as a `+ New module` affordance (e.g. a small link under the module list); it is not part of the default path, so it stays low-key.

#### 2.5 Stats (optional, bottom)

A lightweight activity indicator (e.g. a 7-day streak / sessions-this-week strip), reusing the existing `LanguageLearningWeeklyStats`-style component. Purely motivational; never blocks anything. Can be deferred without affecting the loop.

### States

- **Loading:** skeleton for the level header and a few module rows.
- **Empty (no modules seeded at level):** level header still shown; module area shows "No modules yet for this level" with the `+ New module` action highlighted.
- **Error:** inline retry, header preserved.

---

## 3. P2 — Module Run (continuous guided session)

**Route:** `/language-learning/modules/[id]/run` · **Backend:** F09 (grammar intro), F10 (practice session), F08 (selection) — *pending*

### Responsibility

The heart of the app. Opening a module **immediately starts a guided session** that flows, without interruption, through the module's grammar introduction and then its practice exercises (idea §3.1.1 Steps 1 & 2). The Module Test (Step 3) is **not** part of this run — it is time-locked and launched separately from the Dashboard.

The run is **resumable**: if the user leaves mid-practice, re-entering from the Dashboard continues from the next unanswered exercise. Mastery scores are **not** updated anywhere in this run (idea §3.1.1).

### Flow

```
 enter ─► [Grammar cards] ─► [Practice exercises ×15] ─► [Retry missed] ─► [Done screen]
            (Step 1)              (Step 2)                  (until all correct)
```

A thin **progress bar** sits at the top of the run for the whole duration so the user always knows how far they are.

#### 3.1 Phase A — Grammar Introduction (Step 1)

For each `GrammarConcept` in the module, one **grammar card** is shown in sequence:

```
┌──────────────────────────────┐
│  GRAMMAR · 1 of 2             │
│                               │
│  Inversion (verb-second)      │   ← GrammarConcept.name
│                               │
│  In Danish, the verb stays in │   ← .explanation (pre-generated, stored)
│  second position. When you    │
│  start with something else,   │
│  the subject moves after it.  │
│                               │
│  • I dag spiser jeg fisk.     │   ← .examples[] (danish + english)
│    Today I eat fish.          │
│  • Nu går vi.                 │
│    Now we go.                 │
│                               │
│            [ Got it → ]        │
└──────────────────────────────┘
```

- Purely instructional — **no interaction** required (idea §3.1.1 Step 1). The only control is **Got it →** to advance.
- Content comes straight from `GrammarConcept.explanation` and `GrammarConcept.examples` (seeded, never generated live).
- After the last grammar card, the run flows directly into practice (no separate confirmation screen).
- If the module has no grammar concepts, this phase is skipped.

#### 3.2 Phase B — Practice (Step 2)

A fixed-length practice session of `practiceSessionSize` exercises (default 15), drawn from the module's bank by the **mastery-aware selection** algorithm (idea §3.4.3, F08). Exercises are **ordered by type** to follow recognition → production (idea §3.1.1):

`Multiple Choice → Sentence Reorder → Fill in the Blank → Conjugation Drill → Error Correction → Translation`

Each exercise is rendered by the shared **Exercise Player (P3, §4)**. Practice-specific behavior:

1. **Immediate feedback.** On submit, the player shows correct/incorrect right away.
2. **Wrong answer:** the correct answer is shown, and the user advances to the next exercise (idea §3.1.1). No penalty, no blocking.
3. **"Explain my mistake"** is available on demand after any wrong answer (F12).
4. **Retry missed.** When the 15 are done, every exercise answered incorrectly is **re-queued and retried until answered correctly** (idea §3.1.1). These retries reuse the same Exercise Player.
5. **No mastery update** anywhere in practice.

#### 3.3 Phase C — Done screen

When practice (including retries) is complete:

```
┌──────────────────────────────┐
│            ✓ Nice              │
│   You finished practising      │
│       "At the café"            │
│                               │
│   You got 12 / 15 first try.   │   ← simple, encouraging summary
│                               │
│   🔒 The module test unlocks   │
│      in about 4 hours.         │   ← testUnlockDelayHours
│   Come back later to test what │
│      you've learned.           │
│                               │
│         [ Back to home ]       │
└──────────────────────────────┘
```

- Explains the **deliberate delay** before the test (idea §3.1.1 Step 3 — spaced repetition). Frame it positively, not as a wall.
- The only action is **Back to home** (P1), where the module row now shows the `⏳ Test unlocks in Xh` state, later flipping to `🎯 Test ready`.
- No mastery is shown here because none changed — mastery only moves at the test.

### States

- **Resume:** re-entering jumps to the next unanswered practice exercise (or the next grammar card if Phase A was interrupted). The progress bar reflects the true position.
- **Leaving mid-run:** allowed at any time via back button; progress is saved server-side (`PracticeSession`).
- **Empty bank / generation pending:** if the bank can't fill a session, show a friendly "Preparing more exercises — check back shortly" (bank refresh is async, F08/§3.4.3).

---

## 4. P3 — Exercise Player (shared component)

**Used by:** P2 Module Run, P4 Module Test, P6 Level Test · **Backend:** F08, F12, F13 — *pending*
**Not a standalone route** — it is the single-exercise UI embedded in the runs above.

### Responsibility

Render **one exercise at a time** for any of the 6 types, capture the answer, and (in practice/feedback contexts) show feedback and the on-demand AI helpers. The same component is configured by a single flag — **feedback mode** (practice: immediate feedback; test: no feedback, just capture & advance) — so the experience is identical everywhere and there's only one thing to build well.

### Common frame

Every exercise, regardless of type, shares this frame:

```
┌──────────────────────────────┐
│  ▓▓▓▓▓▓░░░░░░  (progress)      │
│                               │
│   [ exercise-specific body ]   │
│                               │
│        [ Check / Submit ]      │   ← primary action, disabled until answerable
└──────────────────────────────┘
```

- One exercise fills the screen. Large tap targets, single primary button. No distractions.
- Where the exercise tests Danish *comprehension*, the **English `promptTranslation`** is shown under the Danish prompt as a subtle support line (the data model requires it for `multiple_choice`, `fill_blank`, `error_correction`). For production types (`translation_active`, `sentence_reorder`, `conjugation_drill`) there is no translation crutch.
- If a `VocabularyItem.context` note exists, it is shown as a small disambiguating hint (e.g. *"stor — physical size"*, idea §3.4.3).

### 4.1 The six exercise types

| Type | Body UI | Answer capture |
|---|---|---|
| **Multiple Choice** (`multiple_choice`) | Danish sentence with a blank `____`; English translation below; **4 large option buttons** (`answer` + 3 `distractors`, shuffled). | Tap one option. Submits on tap (or tap-then-Check). |
| **Sentence Reorder** (`sentence_reorder`) | Shuffled **word tiles** (`words[]`) in a tray; an empty answer line above. | Tap tiles to move them up into order (tap again to remove). `Check` enabled when all tiles placed. Accepts any ordering in `answer` + `alternativeAnswers`. |
| **Fill in the Blank** (`fill_blank`) | Danish sentence with a `____`; English translation below; a single text input. | Type the missing word/form. Normalized compare. |
| **Conjugation Drill** (`conjugation_drill`) | Prompt states the infinitive + target tense + subject (e.g. *"at spise — present, jeg"*); single text input. No sentence scaffold (idea §3.1.1). | Type the conjugated form. |
| **Error Correction** (`error_correction`) | A Danish sentence containing a mistake; English translation below; a text input pre-filled with the sentence (or a "rewrite it correctly" input). | Edit/retype the corrected sentence. Accepts `answer` + `alternativeAnswers`. |
| **Translation (active)** (`translation_active`) | English word/sentence shown; single text input for the Danish. No translation line (it *is* the prompt). | Type Danish. Normalized + fuzzy compare against `answer` + `alternativeAnswers` + `userContributedAnswers`. |

All text comparisons are done locally against the stored answer set after normalization (lowercase, punctuation stripped) — **no AI call at answer time** (idea §3.4.3), except the explicit verification below.

### 4.2 Feedback (practice / results mode only)

After **Check**, in feedback mode:

```
┌──────────────────────────────┐
│   ✗ Not quite                 │   (or ✓ Correct)
│                               │
│   Your answer:  jeg spiser    │
│   Correct:      jeg spiste    │   ← Exercise.answer
│                               │
│   [ Explain my mistake ]       │   ← F12, on wrong answers only
│   [ Verify my answer ]         │   ← F13, translation_active only
│                               │
│            [ Next → ]          │
└──────────────────────────────┘
```

- **Correct:** green confirmation, **Next →**.
- **Incorrect:** show user's answer vs. `answer`, then **Next →**. No retry inline (retries are batched at the end of practice, §3.2).

### 4.3 On-demand AI helpers

These are **explicit, opt-in** actions (never automatic), matching the "no live AI in sessions except on request" rule:

- **Explain my mistake (F12)** — available *after* a wrong answer (any type): expands to show *what the correct answer is, why, the rule in plain English, and a second Danish example* (idea §3.4). Rendered as an expandable panel under the feedback.
- **Verify my answer (F13)** — `translation_active` only, *after* it's marked wrong: asks the AI whether the typed translation is actually valid.
  - **Valid →** the exercise flips to ✓ correct; the typed answer is appended to `userContributedAnswers` (so it's accepted forever after). A small "Counted as correct" confirmation.
  - **Invalid →** stays wrong; shows the AI's short explanation of *why* it isn't valid.
  - **One verification per attempt** (idea §3.4). After use, the button is disabled for that exercise.

Each helper shows a tiny inline loading spinner while the AI responds; failures degrade gracefully ("Couldn't load explanation — try again").

---

## 5. P4 — Module Test

**Route:** `/language-learning/modules/[id]/test` · **Backend:** F11 — *pending*

### Responsibility

The graded, locked assessment that decides whether a module is `completed` (idea §3.1.1 Step 3). Unlike practice, it gives **no feedback during the test**, and it **updates mastery** on submission.

### Entry & lock

The test is only reachable when the Dashboard module row shows `🎯 Test ready` (i.e. `testUnlockDelayHours` have passed since practice completion). If a user deep-links earlier, the page shows the lock state with a countdown and a **Back to home** button — never the questions.

### During the test

```
┌──────────────────────────────┐
│  TEST · 7 / 20                │   ← question counter, no score yet
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░          │
│                               │
│   [ Exercise Player body ]     │   ← P3 in "no feedback" mode
│                               │
│            [ Next → ]          │   ← captures answer, advances; NO correct/wrong shown
└──────────────────────────────┘
```

- **20 questions** (idea §3.1.1), drawn from the module bank: **~50% fresh** (unseen in practice) + up to 50% repeats, selected mastery-aware (F08).
- Same six exercise types as practice, via the Exercise Player in **no-feedback mode**: answers are captured and the user advances; correctness is **not revealed** until the end.
- The on-demand AI helpers (explain/verify) are **suppressed during** the test — they belong to the review screen afterward.
- The user **must complete all questions** before seeing results (idea §3.1.1). A clear final **Submit test** on the last question.
- No back-out mid-test beyond abandoning (abandon = no attempt recorded; confirm dialog to prevent accidental loss).

On submit, the result is computed, a `ModuleTestAttempt` is recorded, and **mastery scores are updated** from the answers (F06). The user is taken to P5.

---

## 6. P5 — Test Results & Review

**Route:** `/language-learning/modules/[id]/test/result` · **Backend:** F11, F12 — *pending*
*(Reused by the Level Test with an added weak-areas section — see §7.)*

### Responsibility

Show how the test went and let the user learn from every mistake. This is where feedback that was withheld during the test is delivered all at once.

### Layout

```
┌──────────────────────────────┐
│            85%                 │   ← final score, large
│         ✓ Passed               │   ← pass/fail vs. testPassThreshold (80%)
│   "At the café" is complete!   │
│                               │
│  Review                        │
│  ─────────────────────────     │
│  ✓ 1. Hvad koster det?         │
│  ✗ 2. jeg spiser → jeg spiste  │   ← user answer → correct answer
│        [ Explain my mistake ]  │   ← F12, per wrong item
│  ✓ 3. ...                      │
│           ⋯                    │
│                               │
│  [ Back to home ]  ([ Retry ]) │
└──────────────────────────────┘
```

#### 6.1 Header — score & outcome

- **Score %** large and central.
- **Pass (≥80%, `testPassThreshold`):** "✓ Passed" + "module is complete". On the Dashboard the module flips to `completed` and the level progress bar advances.
- **Fail (<80%):** "Not yet — you need 80%." The retry CTA is shown but **gated by `testRetryDelayMinutes`** (default 20 min): if too soon, it reads `Retry available in 14m`; once elapsed, it becomes `Retry test`. A retry draws a **new selection** from the bank.

#### 6.2 Review list

Every question, in order, each row showing the prompt, ✓/✗, and for incorrect ones **both the user's answer and the correct answer** (idea §3.1.1). Each incorrect row exposes **Explain my mistake (F12)** on demand — expandable inline, same component as in the player. Correct rows are collapsed/quiet.

#### 6.3 Actions

- **Back to home** (always) → P1.
- **Retry test** (on fail, once the cooldown passes) → P4 with a fresh selection.

---

## 7. P6 — Level Test

**Routes:** `/language-learning/level-test`, `/language-learning/level-test/result` · **Backend:** F20, F21, F12 — *pending*

### Responsibility

The cumulative, cross-module assessment that **unlocks the next CEFR level** (idea §3.5). Mechanically very close to the Module Test, so it **reuses the Exercise Player and the Results & Review screen**, with three differences: it's drawn from the level-wide bank, its pass threshold is 75%, and its results include a **weak-areas summary**.

### Entry

Launched only from the Dashboard Level Test gate, which unlocks when **all modules at the level are `completed`** (idea §3.5). The intro screen states the stakes:

```
┌──────────────────────────────┐
│        Level Test · A1         │
│                               │
│  This covers everything from   │
│  your A1 modules. Pass with    │
│  75% to unlock A2.             │
│                               │
│  ~20–30 questions · no time     │
│  limit                         │
│                               │
│        [ Start test ]          │
└──────────────────────────────┘
```

### During the test

Identical to the Module Test (§5): Exercise Player in no-feedback mode, question counter + progress bar, **20–30 questions** drawn mastery-aware from the **`LevelTestBank`** for the level (idea §3.5, F20). Cross-module by design — a single question may mix vocabulary from different modules.

### Results (reuses P5 + weak areas)

Same score/pass-fail header and per-question review as P5, **plus** a **weak-areas summary** (idea §3.5):

```
│  Where to focus                │
│  ─────────────────────────     │
│  Grammar:  Inversion (40%)     │   ← aggregated from incorrect results
│            Negation (55%)      │      by grammarConceptId
│  Words:    spise, købe, vil    │   ← by vocabularyItemId
```

- **Pass (≥75%):** celebratory screen; `User.cefrLevel` advances; on return, the Dashboard shows the **new level** with a fresh module list. This is the app's biggest moment — make it feel like one.
- **Fail (<75%):** show the weak-areas summary prominently and allow **immediate retry, no cooldown** (idea §3.5, OQ-04). Each weak-area item can deep-link to a relevant module for revision.

---

## 8. P7 — Analyze Content

**Route:** `/language-learning/analyze` · **Backend:** F23 — *pending*

### Responsibility

Let the user paste any Danish text and get a curriculum gap report (idea §3.6). This page is just the **input + submission**; the report itself is P8.

### Layout

```
┌──────────────────────────────┐
│  Analyze Danish text           │
│                               │
│  Paste a podcast transcript,   │
│  article, email — anything in  │
│  Danish.                       │
│                               │
│  ┌──────────────────────────┐  │
│  │ (large multiline text     │  │   ← single big textarea
│  │  input)                   │  │
│  └──────────────────────────┘  │
│  124 words                      │   ← live word count
│                               │
│         [ Analyze ]            │   ← disabled under ~50 words
└──────────────────────────────┘
```

- One big **textarea**, any length, any register (idea §3.7.1).
- A **live word count**. The **Analyze** button is disabled below the minimum useful length (~50 words, idea OQ-07) with a hint: *"Add a bit more text for a reliable estimate."*
- On submit: a **full-screen loading state** ("Analyzing… reading vocabulary and grammar") while F23 runs, then navigation to P8. Analysis is not instant (it's an AI pipeline), so the wait is explicit and honest.
- No URL/audio ingestion in v2.0 (idea §3.7.1) — text only.

---

## 9. P8 — Content Report

**Route:** `/language-learning/analyze/[reportId]` · **Backend:** F23 (report), F22 (add vocab), F03/generation (custom module) — *pending*

### Responsibility

Present the gap report and turn it into action: what level the text is, what the user already knows, what's missing, and exactly which modules close the gap (idea §3.6.2–3.6.3).

### Layout (sections, top → bottom)

```
┌──────────────────────────────┐
│  This text is about  B2        │   ← estimatedCefrLevel (big)
│  You're at A1.                 │   ← contrast with user level
├──────────────────────────────┤
│  Vocabulary you know   62%     │   ← vocabularyCoverage bar
│  New words (18)                │
│   • bæredygtig  sustainable    │   ← newVocabularyItems
│   • forhandling  negotiation   │
│         [ + Add all to list ]  │   ← F22 quick win
├──────────────────────────────┤
│  Grammar in this text          │
│   ✓ Inversion        covered   │   ← GrammarPatternResult.status
│   ⤴ Subordinate clauses  ahead │
│   ✗ Embedded clauses  not yet  │
├──────────────────────────────┤
│  Your path to this level       │
│   1. Workplace basics   →      │   ← suggestedModules, ranked
│   2. Formal writing     →      │
│   [ Generate a custom module ] │   ← when a gap has no module
└──────────────────────────────┘
```

#### 9.1 Sections

- **CEFR estimate** — `estimatedCefrLevel` shown large, contrasted with the user's current level so the gap is felt, not just stated (idea OQ-05: even far-above content is shown as a destination map).
- **Vocabulary coverage** — a percentage bar (`vocabularyCoverage`) and a list of **new words** (`newVocabularyItems`, Danish + English).
- **Grammar coverage** — each detected `GrammarPatternResult` with a status chip: `covered` (✓, from a completed module), `ahead_in_curriculum` (⤴, comes later), `not_in_curriculum` (✗).
- **Curriculum routing** — `suggestedModules`, ranked by impact, each a tappable row.

#### 9.2 Actions (idea §3.7.3)

- **Add unknown vocabulary** — `+ Add all to list` (or per-word add) writes the new items as `source = user_added` (F22). Immediate, no navigation. (Note: per idea §3.2.3, these are *stored only* in v2.0 — set expectation subtly; don't promise they'll appear in practice yet.)
- **Navigate to a suggested module** — a module row taps straight to that module on the Dashboard / its run (P2).
- **Generate a custom module** — when a gap is covered by no existing module, this CTA opens **P11** pre-seeded with the pasted text as the context corpus.

---

## 10. P9 — Add Vocabulary

**Route:** `/language-learning/vocabulary/add` · **Backend:** F22 — *pending*

### Responsibility

Capture a Danish word the user encountered, with its English meaning (idea §3.2.3). Deliberately minimal — no AI, no extra fields.

### Layout

```
┌──────────────────────────────┐
│  Add a word                    │
│                               │
│  Danish                        │
│  [ ____________________ ]      │
│                               │
│  English                       │
│  [ ____________________ ]      │
│                               │
│         [ Save word ]          │
│                               │
│  Saved so far: 23 words        │   ← simple count, reassurance
└──────────────────────────────┘
```

- Two text fields (Danish, English) and **Save**. Stored as a `VocabularyItem` with `source = user_added`, `addedByUserId` set, no generated alternatives/context (idea §3.2.3).
- After saving, the form clears for quick repeat entry and the count ticks up.
- **Honest expectation:** a one-line note — *"Saved words are collected for now; a future update will bring them into practice."* (idea §3.2.3 / §9). Don't imply they enter exercises in v2.0.

---

## 11. P10 — Knowledge Base

**Route:** `/language-learning/knowledge` · **Backend:** F01, F02, F06 — *vocab/grammar catalogs + mastery are implemented*

### Responsibility

A read-only reference of what the user has learned: their vocabulary (with mastery) and the grammar concepts they've met (US-05). Motivational and diagnostic — "look how much I know" and "what's shaky."

### Layout

A single page with two simple segmented sections (a top toggle, **Words / Grammar** — this is a local toggle, not section-wide navigation):

```
┌──────────────────────────────┐
│   [ Words ]   Grammar          │   ← local toggle
│  Search ____________           │
│                               │
│  kaffe      coffee     ▓▓▓▓▓▓  │   ← danish · english · mastery bar
│  spise      to eat     ▓▓▓░░░  │
│  stor       big        ▓▓▓▓▓░  │
│           ⋯                    │
└──────────────────────────────┘
```

- **Words tab:** the user's vocabulary (items they have `UserVocabularyProgress` for), each row = Danish · English · **mastery bar** (0–1, F06). Items ≥0.8 read as "mastered" (a filled/green bar). A search box filters. Optional sort: weakest first (most useful for study).
- **Grammar tab:** the grammar concepts the user has encountered, each with name, category, and **mastery bar** (`UserGrammarConceptProgress`). Tapping a concept can expand its stored `explanation` + `examples` (reusing the grammar card content from P2) for quick review.
- Read-only. No editing here (adding words is P9). This is where the "I know X words" pride lives.

> Because F01/F02/F06 already exist, this page is among the **first buildable** real learner surfaces.

---

## 12. P11 — Create Custom Module

**Route:** `/language-learning/modules/new` · **Backend:** F03 (store module) + external generation tool — *pending*

### Responsibility

Let the user generate a module from a natural-language prompt (US-02), at their current CEFR level (idea OQ-03 — never above current). Also the landing point of "Generate a custom module" from a Content Report (P8), pre-seeded with the pasted text.

### Layout

```
┌──────────────────────────────┐
│  Create a module               │
│                               │
│  What do you want to learn?    │
│  ┌──────────────────────────┐  │
│  │ e.g. "Talking to my       │  │   ← prompt textarea
│  │ doctor about a cold"      │  │
│  └──────────────────────────┘  │
│                               │
│  Level: A1 (your current)      │   ← fixed to user level; not editable
│                               │
│        [ Generate ]           │
└──────────────────────────────┘
```

### Flow & states

- **Prompt:** a single textarea describing what they want. When opened from P8, it's pre-filled and the pasted text is attached as the context corpus (idea §3.7.3).
- **Level is fixed** to the user's current CEFR level (shown, not editable) — progression stays gated (idea OQ-03).
- **Generation is not instant.** On submit, show an explicit progress state: *"Building your module — generating vocabulary, grammar and exercises. This can take a minute."* This mirrors the seeding pipeline (vocabulary set → grammar → exercise bank, idea §3.1.3) running for one module.
- **On completion:** the new module appears in the Dashboard module list (marked as user-generated) and the user is taken into its **Module Run (P2)**, or back to the Dashboard with the new module highlighted.
- **Failure:** clear retry; the prompt is preserved.

---

## 13. Cross-cutting UI conventions

These apply to every page and exist to keep the section coherent and simple.

- **Header & back.** Every page sets `useHeader` with a title and a back button to its parent. No page hides the way home.
- **One primary action per screen.** A single, obvious primary button (Check, Next, Start, Save). Secondary actions are visually quieter.
- **Loading is explicit and honest.** AI-backed steps (analysis, generation, explain/verify) always show a real loading state with a plain-language description — never a frozen UI. AI failures degrade gracefully with retry, never blocking the learning loop.
- **Mastery only moves at tests.** The UI never shows mastery changing during practice or runs — only test results and the Knowledge Base reflect mastery. This keeps the mental model from idea §3.1.1 intact.
- **CEFR level is always within reach.** Prominent on the Dashboard; surfaced on the Create Module and Level Test screens. It is the section's spine (idea §3.5).
- **No dead ends.** Every terminal screen (Done, Results, Report) has a clear way back to the Dashboard.
- **Quiet by default, loud on "next".** At any moment exactly one thing should look like the obvious next step; everything else recedes. This is the main lever for "ease of use = success".

---

## 14. Suggested build sequence (UI)

Ordered to deliver real value early while respecting backend readiness:

| Step | Pages | Why first |
|---|---|---|
| 1 | **P10 Knowledge Base** | Backend (F01/F02/F06) already exists — a real, shippable learner surface today. |
| 2 | **P1 Dashboard** (level + module list) | Needs F05/F07; the hub everything hangs off. |
| 3 | **P3 Exercise Player + P2 Module Run** | The core loop's engine; needs F08/F09/F10. |
| 4 | **P4 Module Test + P5 Results** | Closes the module loop; needs F11/F12. |
| 5 | **P6 Level Test** | Progression; needs F20/F21. |
| 6 | **P7/P8 Analyze + P9 Add Word + P11 Custom Module** | Surrounding surfaces; needs F22/F23 + generation. |

This mirrors the backend build order in the feature breakdown, so UI and API land together feature-by-feature.

---

*End of UI Design v1.0. This document is the UI north star; update it alongside [idea.md](./idea.md) as decisions evolve.*
