# Change: Practice session — API reconciliation & answer-matching correction   (2026-06-10)

## What changed

- **`05-practice-session` (Practice session)** — Three technical decisions were wrong (client-side
  session selection, client-side answer checking, separate mastery/coverage write calls). All three
  have been corrected to reflect the implemented backend. All API integrations updated from TBD to
  the actual endpoints. Error Correction answer matching corrected from "exact, no fuzzy" to
  "fuzzy slack allowed" (same as Translation). Component footer table corrected per wireframe:
  `SendFooter` (with Hint chip) applies only to Fill in Blank and Translation; Error Correction
  uses `CheckFooter`; Conjugation Drill uses a standalone `RoundButton`. Open Question 5 closed.
  Business Logic section purged of backend-only content (mastery-aware selection algorithm,
  coverage-override algorithm, per-type answer-matching rules with Levenshtein thresholds, mastery
  SRS update description, coverage-tracking persistence). Additional Notes purged of the
  "Coverage override in selection" note. Success Criteria rows 7 and 16 removed (backend-only
  assertions); rows 8 and 17 rewritten as client-observable behaviour.

## Why

`05-practice-session` was last updated before `tome-ms-language` had a working practice-session
implementation. The backend has since been built (`F10`, `F04`, `F08`), resolving the open API
question, fixing the answer-matching scope (fuzzy for Error Correction too — `F10` OQ-01), and
moving session selection and answer evaluation entirely server-side. The wireframe (`exercise-screens.jsx`)
also clarified per-exercise footer components that the feature file had generalised incorrectly.

## Impact (add / modify / remove)

**`05-practice-session`**

- *Modify:* Technical Decision 3 — exercise selection is server-side (`POST /practiceSessions`),
  not drawn client-side from a fetched bank. The client receives the ordered exercise list from
  the session-start response.
- *Modify:* Technical Decision 4 — answer checking is server-side (`POST .../answers`), not
  local. The client submits the raw user answer and receives a correct/wrong verdict plus the
  canonical answer for display. No AI call remains accurate; "local" is removed.
- *Modify:* Technical Decisions 5 & 8 — mastery updates and coverage persistence are not
  separate API calls from the client. Both are triggered server-side inside
  `POST .../complete`. The client calls `/complete`; the backend handles SRS + vocabulary
  accumulation + coverage gate atomically.
- *Modify:* API Integrations table — all three rows were "Not yet implemented / TBD". Replace
  with the four implemented endpoints (`POST /practiceSessions`, `GET /practiceSessions/:id`,
  `POST .../answers`, `POST .../complete`) and the `GET /me/progress` read.
- *Add:* Session resume — `GET /users/:userId/practiceSessions/:sessionId` is available for
  resuming an in-progress session after the app closes. Not previously documented.
- *Modify:* Answer matching rule for Error Correction — was "exact match, no fuzzy"; corrected to
  "fuzzy slack allowed" (Levenshtein thresholds: ≤10 chars → 1 edit; ≤20 → 2 edits; >20 → 3 edits).
  **This is the item a from-scratch build would silently get wrong.**
- *Modify:* Success Criterion #8 — rewritten as client-observable: "frontend submits raw answer;
  backend returns `{ isCorrect, correctAnswer }`; no AI call." Per-type matching rules removed
  (backend-only).
- *Modify:* Interface component table — `SendFooter` (with Hint chip) now correctly scoped to
  Fill in Blank and Translation only. Error Correction uses `CheckFooter`. Conjugation Drill uses
  a standalone `RoundButton` (no full footer, no Hint chip).
- *Remove:* Open Question 5 (what endpoints serve the exercise bank and persist results) — closed;
  all endpoints are now known.
- *Remove:* Business Logic — mastery-aware selection algorithm, coverage-override algorithm,
  per-type answer-matching rules (Levenshtein thresholds), mastery SRS update description,
  coverage-tracking persistence. These are backend-only; a frontend developer has no business
  implementing them.
- *Remove:* Additional Notes — "Coverage override in selection" note (backend algorithm detail).
- *Remove:* Success Criteria rows 7 ("Session selection favours low-mastery items"), 16
  ("At least `practiceMinUnseenVocabPercent` of a session targets unseen vocab"), and 6
  ("Every answered exercise updates the mastery score") — all assert backend behaviour the
  client cannot verify from the UI.
- *Modify:* Success Criterion #1 — rewritten as "SessionBar shows N/total matching the exercise
  count from `POST /practiceSessions`"; removes the `practiceSessionSize` config reference.
- *Modify:* Success Criterion #17 — rewritten as client routing behaviour: "when
  `step2Complete: true`, navigate to overview instead of starting a new session."
- *Modify:* Business Logic — session-length bullet replaced with "session exercises are the
  ordered list from the API; no client-side selection"; multi-session-loop bullet simplified to
  "check `step2Complete` from `/complete`". End-of-session and end-of-Step-2 notes in §3
  rewritten to describe the `step2Complete` check rather than the coverage gate algorithm.

## Behavior to verify

- Starting practice calls `POST /users/:userId/modules/:moduleId/practiceSessions` and returns
  the full ordered exercise list (server-side selection with coverage override).
- Each user answer is submitted via `POST .../answers`; the response carries the correct/wrong
  verdict and the canonical answer string (used to populate `ResultSheet`).
- Session completion calls `POST .../complete`; this triggers mastery updates (SRS) and vocabulary
  coverage accumulation server-side. The response includes `step2Complete: boolean` and remaining
  unseen vocab count.
- A closed-and-reopened app can resume its session via `GET .../practiceSessions/:sessionId`.
- Fill in Blank and Translation show the Hint chip in their footer; Conjugation Drill and Error
  Correction do not.

## Affected feature files

- `docs/features/05-practice-session.md`
