# Practice Session — module step 2

## 1. Purpose & Scope

Delivers **Step 2 of the module flow**: a fixed-size, pressure-free practice
session that introduces the module's vocabulary implicitly through exercises,
ordered recognition → production. This capability owns the **practice exercise
screen**, which renders all **six exercise types** within one continuous session,
plus the shared session progress bar and answer footers. It is one uninterrupted
job (the practice run), so it is a single feature spanning the six exercise
renderings rather than six features.

Design: `exercise-screens.jsx` (`ExShell`, `ExMultipleChoice`, `ExReorder`,
`ExFillBlank`, `ExConjugation`, `ExErrorCorrection`, `ExTranslation`).

Participates in journey **J4** (practise a module).

**Out of scope**:
- The Module overview that launches practice (owned by `03-module-overview`).
- The **Module Test** (§3.1.1 Step 3) — **skipped** (no wireframe). Practice never scores mastery; the test does.
- **"Explain my mistake"** AI panel and **AI answer verification** (translation) — **skipped** (no wireframe); see `00-user-journeys.md`.
- The visual design of the **correct/incorrect feedback state** — not in the wireframe (open question below). The checking *behaviour* is in scope.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | Work through a set of exercises that get progressively more demanding | I build from recognition to production (US-03) |
| 2 | See my progress through the session (done / remaining) | I know how much is left |
| 3 | Be shown the correct answer when I'm wrong and move on | I learn without being blocked |
| 4 | Retry the ones I missed until I get them right | I consolidate before the test |
| 5 | Practise without it affecting my mastery score | I can explore with no pressure (§3.1.1) |

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
| Practice | Check footer (`CheckFooter`) | Full-width "Check" button with enabled/disabled state. | Used by selection/arrangement exercises; disabled until answerable. |
| Practice | Send footer (`SendFooter`) | Text input + send `RoundButton`, with an optional "Hint" chip. | Used by typed-answer exercises. |

**Additional Notes:**
- **Order of types**: exercises are presented recognition → production — Multiple Choice → Sentence Reorder → Fill in the Blank → Conjugation Drill → Error Correction → Translation (§3.1.1). Only types present in the module's exercise bank appear.
- **Loading**: the session subset is drawn before the screen starts (no per-exercise spinner; selection is local, not AI).
- **Answer feedback** (wrong → show correct → next): behaviour is specified; the *visual treatment* is an open question (no wireframe).
- **End of session**: after the fixed number of exercises, missed ones are retried until all are answered correctly, then the session ends and returns to the overview.

## 4. Business Logic

- **Session length** is fixed at `practiceSessionSize` (default **15**) exercises (§3.1.1 / §3.1.2).
- **Vocabulary is introduced implicitly** through exercises — there is no separate vocabulary-drilling step.
- **Mastery-aware selection** at session start (no AI, §3.4.3): draw a session-sized subset from the module's exercise bank — deprioritise items with mastery > 0.85; weight remaining by `(1 − masteryScore)`; boost exercises missed in the most recent session; when several exercises test the same item, pick one at random; weighted-random sample to fill the session.
- Each exercise links to **exactly one** item — a vocabulary item or a grammar concept — whose mastery score drives its weight.
- **Wrong answer → the correct answer is shown, then the user moves to the next exercise** (§3.1.1).
- **Translation matching** is done locally after normalization (lowercase, punctuation stripped) against the canonical answer + pre-generated alternatives (which may be empty); fuzzy compare allowed for slack. **No AI call at answer time.**
- After the fixed set, **all missed exercises are retried until answered correctly** (§3.1.1).
- **Mastery scores are NOT updated during practice** (§3.1.1) — only the Module Test updates them.
- Exercises are **never generated during the live session**; the content is fixed (from the bank), only the *selection* is personalised.

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]/practice`. | Sub-route of the module flow. |
| 2 | One screen renders all six exercise types via a shared shell; the type switches the body. | Mirrors `ExShell` in the wireframe; one continuous session. |
| 3 | Draw the session subset client-side from the fetched bank using the §3.4.3 weights. | Selection is deterministic local logic, zero AI latency. |
| 4 | Answer checking (incl. translation normalization/fuzzy) is local; no live AI. | §3.4.3 zero-latency / bounded-cost rule. |
| 5 | Do not write mastery during practice. | §3.1.1 — mastery only updates in the Test. |
| 6 | `RoundButton` for send/next controls; buttons per style guide. | Project convention. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | A session presents exactly `practiceSessionSize` exercises (default 15). | §3.1.2. |
| 2 | Exercise types appear in recognition→production order; absent types are skipped. | §3.1.1. |
| 3 | Each of the six exercise types renders and accepts input per its design. | Wireframe. |
| 4 | Wrong answers reveal the correct answer and advance. | §3.1.1. |
| 5 | Missed exercises are retried at the end until all are correct. | §3.1.1. |
| 6 | No mastery score changes during practice. | §3.1.1. |
| 7 | Session selection favours low-mastery items and recently-missed exercises. | §3.4.3. |
| 8 | Translation answers match canonical + alternatives after normalization, with no AI call. | §3.4.3. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | What is the **visual feedback state** for correct/incorrect answers? | Not in the wireframe; needed to build the answer→next transition. |
| 2 | What does the **"Hint"** chip do (and where does its content come from)? | Shown on typed-answer footers; behaviour/source unspecified. |
| 3 | How is the session-bar split into mastered / remaining / **deferred** computed mid-session, given mastery isn't updated during practice? | "deferred" semantics need defining. |
| 4 | Where do **"Explain my mistake"** and **AI answer verification** attach when designed? | Both skipped now; will extend this screen's wrong-answer state. |
| 5 | Reorder/error-correction interaction details (drag vs tap) on a phone. | Mobile-first input model. |
