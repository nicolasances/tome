# Spec: Alternative Translations — Vocabulary Practice "Accept my translation" button

## Objective
After a failed vocabulary attempt, show a "✓ Accept my translation" button that lets the learner store their answer as a community alternative and immediately advance the queue as if the answer were correct. This is the primary self-acceptance flow for vocabulary alternatives — no AI gate needed because strict word-level matching already acts as a soft quality bar.

## Core Logic

### Where
`app/language-learning/vocabulary-practice/page.tsx`

### State
Add a boolean state `acceptedThisWord` (default `false`). Reset to `false` whenever `result` is reset to `null`.

### Button visibility
The button is shown in the result area when **all three** are true:
- `result !== null`
- `result.isCorrect === false`
- `acceptedThisWord === false`

It disappears once clicked (set `acceptedThisWord = true`).

### On click — `handleAcceptTranslation`
1. Set `acceptedThisWord = true` (prevents double-click).
2. Call `new TomeLanguageAPI().addWordAlternative('danish', word.id, result.userAnswer.trim())` — **fire-and-forget** (log error, never block UX).
3. Call `api.submitAnswer(session.sessionId, word.id, true)` — **fire-and-forget** (same pattern as the existing incorrect-answer submit).
4. Compute the correct queue delta (same logic as `isCorrect === true` in `handleSubmit`): move the word from pending to mastered, mark first-attempt-correct only if this is the first attempt. Persist the updated queue state to localStorage.
5. Update React state (masteredIds, deferredIds, firstAttemptCorrectIds, pendingQueue, session) to reflect the word as mastered.
6. Advance to the next word (clear result + answer) — same as the `next()` callback inside `handleSubmit` for a correct answer.

### Design
- The button is placed **in the result area** (not in the bottom bar).
- Visually distinct from the "Next" arrow button; use a checkmark icon (e.g. `/images/point-right.svg` style — use `RoundButton` from `toto-react`).
- Use label text "Accept my translation" beneath or beside the button.

## Out of Scope
- Showing the button after a correct answer.
- Any undo / retract mechanism.
- AI validation of accepted vocabulary words.
- Sentence practice (sentence acceptance is handled via issue #256 / the AI cascade).
