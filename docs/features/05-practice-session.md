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
`ExFillBlank`, `ExConjugation`, `ExErrorCorrection`, `ExTranslation`,
`ResultSheet`, `AnswerBox`, `Verdict`, `ContinueBtn`, `SheetBtn`).

Participates in journey **J4** (practise a module).

**Out of scope**:
- The Module overview that launches practice (owned by `03-module-overview`).
- The **Module Test** (§3.1.1 Step 3) — **skipped** (no wireframe). Practice never scores mastery; the test does.
- **"Explain my mistake"** AI panel — the *button* is rendered in `ResultSheet` on all wrong-answer states; the panel it opens is **skipped** (no wireframe for the panel itself).
- **AI answer verification** ("Check with AI") — the *button* is rendered in the Translation wrong-answer `ResultSheet`; the panel/flow it triggers is **skipped** (no wireframe).

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
| Practice | Result sheet (`ResultSheet`) | Bottom sheet pinned to the bottom of the screen; appears after every answer submission, overlaying the exercise body. | **Correct**: dark teal sheet, green `Verdict` badge + "Correct!", `ContinueBtn`. **Wrong**: dark teal sheet, red `Verdict` badge + "Not quite", correct answer revealed in lime text (truncated to 2 lines; tap or drag-up to expand; "Show more / Show less" toggle for long answers), action buttons (`SheetBtn`), `ContinueBtn`. |
| Practice | Answer box (`AnswerBox`) | Inline display of the submitted answer inside the exercise body, shown after submission for typed-answer exercises (Fill in the Blank, Conjugation Drill, Error Correction, Translation). | Green border + ✓ if correct; red border + strikethrough + ✕ if wrong. |
| Practice | Verdict badge (`Verdict`) | Circular icon badge rendered inside `ResultSheet`. | Green (lime) + ✓ for correct; red + ✕ for wrong. |
| Practice | Continue button (`ContinueBtn`) | Full-width button at the bottom of `ResultSheet`. | Lime-on-dark styling; always advances to the next exercise in the session. |
| Practice | Sheet action buttons (`SheetBtn`) | Light outline buttons shown inside the wrong-answer `ResultSheet`. | "Explain my mistake" (magic icon) appears on all wrong-answer states. "Check with AI" (teacher icon) appears only on Translation wrong-answer states. Both are stubs — the panels they open are out of scope. |

**Additional Notes:**
- **Order of types**: exercises are presented recognition → production — Multiple Choice → Sentence Reorder → Fill in the Blank → Conjugation Drill → Error Correction → Translation (§3.1.1). Only types present in the module's exercise bank appear.
- **Loading**: the session subset is drawn before the screen starts (no per-exercise spinner; selection is local, not AI).
- **Answer feedback — `ResultSheet`**: After every submission (Check or Send), a `ResultSheet` bottom sheet slides up and overlays the exercise content. The Continue button in the sheet is always reachable without scrolling. Tapping Continue advances to the next exercise.
- **Per-exercise inline feedback** (in the exercise body, alongside the `ResultSheet`):
  - *Multiple Choice*: The chosen wrong option turns red (✕ badge); the correct option turns green (✓ badge). Both inline changes appear with the `ResultSheet`.
  - *Sentence Reorder*: All word tiles in the build area turn green (correct) or red (wrong).
  - *Fill in the Blank, Conjugation Drill, Error Correction, Translation*: The user's typed answer is replaced by an `AnswerBox` — green + ✓ if correct, red + strikethrough + ✕ if wrong.
- **End of session**: after the fixed number of exercises, missed ones are retried until all are answered correctly, then the session ends and returns to the overview.

## 4. Business Logic

- **Session length** is fixed at `practiceSessionSize` (default **15**) exercises (§3.1.1 / §3.1.2).
- **Vocabulary is introduced implicitly** through exercises — there is no separate vocabulary-drilling step.
- **Mastery-aware selection** at session start (no AI, §3.4.3): draw a session-sized subset from the module's exercise bank — deprioritise items with mastery > 0.85; weight remaining by `(1 − masteryScore)`; boost exercises missed in the most recent session; when several exercises test the same item, pick one at random; weighted-random sample to fill the session.
- Each exercise links to **exactly one** item — a vocabulary item or a grammar concept — whose mastery score drives its weight.
- **Answer submission triggers a feedback state**: after Check or Send, the exercise transitions from `idle` to `correct` or `wrong`. For Multiple Choice and Sentence Reorder a wrong submission enters `retry` (same visual treatment as `wrong`).
- **`ResultSheet` appears for every outcome**:
  - **Correct**: dark teal bottom sheet; green verdict badge + "Correct!"; `ContinueBtn` (lime). No separate answer text — the correct answer is already visually confirmed in the exercise body.
  - **Wrong / retry**: dark teal bottom sheet; red verdict badge + "Not quite"; correct answer revealed in lime text, clamped to 2 lines, expandable by tapping or dragging the sheet up ("Show more / Show less" for long answers); "Explain my mistake" button (all wrong states); "Check with AI" button (Translation only); `ContinueBtn` (lime).
- **Tapping Continue always advances** to the next exercise (or the retry queue / end-of-session).
- **Answer matching is local; no AI call at answer time.** All typed comparisons apply the same base normalisation first (lowercase, trim whitespace, strip punctuation), then apply the per-type rule:
  - *Multiple Choice*: no text comparison — the selected option key is matched against the correct key. Inherently exact.
  - *Sentence Reorder*: no text comparison — the tile sequence is compared positionally against the canonical order. Inherently exact.
  - *Fill in the Blank*: exact match against the canonical answer and any pre-generated alternatives. No fuzzy tolerance — a spelling variant fails.
  - *Conjugation Drill*: exact match against the canonical conjugated form and any pre-generated alternatives. No fuzzy — the target form is unambiguous.
  - *Error Correction*: exact match of the typed correction against the canonical correction and any pre-generated alternatives. No fuzzy.
  - *Translation (active)*: match against the canonical answer and pre-generated alternatives; **fuzzy slack is allowed** (e.g. minor accent or word-order variation). This is the only exercise type that uses fuzzy comparison.
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
| 7 | `ResultSheet` is `position: absolute; bottom: 0` within the screen, max-height `calc(100% - 84px)`. | Overlays the exercise content so the Continue button is always reachable without page scroll, per the wireframe. |

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
| 8 | Answer matching uses no AI call at answer time. Fill in the Blank, Conjugation Drill, and Error Correction use exact match (post-normalization) against canonical + alternatives; Translation uses fuzzy-slack match; MC and Reorder compare by key/position. | §3.4.3. |
| 9 | A `ResultSheet` appears for every answer submission (correct or wrong, all six exercise types). | Wireframe. |
| 10 | Correct sheet shows green verdict + "Correct!" + Continue; no answer text is shown. | Wireframe. |
| 11 | Wrong sheet shows red verdict + "Not quite" + correct answer text + "Explain my mistake" + Continue. | Wireframe. |
| 12 | Wrong Translation sheet additionally shows "Check with AI"; no other exercise type shows it. | Wireframe. |
| 13 | Long correct-answer text in the wrong sheet is clamped to 2 lines and expandable via tap or drag. | Wireframe. |
| 14 | Typed-answer exercises (Fill in the Blank, Conjugation, Error Correction, Translation) show an `AnswerBox` inline: green if correct, red + strikethrough if wrong. | Wireframe. |
| 15 | MC and Reorder show correct/wrong coloring on options/tiles inline alongside the `ResultSheet`. | Wireframe. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | What does the **"Hint"** chip do (and where does its content come from)? | Shown on typed-answer footers; behaviour/source unspecified. |
| 2 | How is the session-bar split into mastered / remaining / **deferred** computed mid-session, given mastery isn't updated during practice? | "deferred" semantics need defining. |
| 3 | What happens when the user taps **"Explain my mistake"** or **"Check with AI"** in the `ResultSheet`? | The buttons are now in the wireframe; the panels/flows they open are still out of scope (no wireframe). Stub the taps for now. |
| 4 | Reorder/error-correction interaction details (drag vs tap) on a phone. | Mobile-first input model. |
