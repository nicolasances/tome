# Change: Add the Level Test capability   (2026-07-16)

## What changed
- **New feature `07-level-test`** — the CEFR-level, gated, scored assessment that
  promotes the user to the next level on passing. Covers the `LevelTestReady` and
  `LevelTestPass` screens (new) and reuses the Module Test's in-test / submit /
  fail / review phases as-is. Previously this whole area was listed as *Skipped —
  no wireframe* in `00-user-journeys.md`.
- **`01-home-dashboard` — modified** — the Continue card's "all modules complete"
  state is upgraded from the passive **"Level test awaits!"** empty state to the
  interactive **"Level Test unlocked" CTA** (`HomeLevelTest`, "Take the Level
  Test"), gated by a new eligibility call, that navigates into `07`.
- **`00-user-journeys.md` — modified** — added journey **J6** (take the Level
  Test), added the **Level test** screen to the inventory, and narrowed the
  *Skipped* entry from the whole Level Test down to just the **weak-areas
  summary**.

## Why
The user completed all A1 modules; the app shows "Level test awaits!" but there
is **no way to reach a level test** — the empty-state card is a static, non-clickable
`<div>`, no route exists, and no API client calls the backend. The backend
(`tome-ms-language`, delegates under `src/dlg/levelTests`) is fully implemented
and route-registered, but the frontend never consumed it and had **no spec**. This
change writes that spec so the capability can be built.

## Impact (add / modify / remove)

**`07-level-test` (add)**
- Add screens: **Level test route** (`/language-learning/level-test`) rendering
  phases ready → in-test → submit → result (pass/fail) → review.
- Add components: `LevelTestReady` (level-scope Ready intro), `LevelTestPass`
  (promotion result). Reuse `TestShell`, `TestSubmit`, `TestResultFail`,
  `TestReview`, `ReviewCorrect`, `ReviewWrong` and the practice exercise bodies /
  `ResultSheet` / `AnswerBox` from `06-module-test` and `05-practice-session`.
- Add API wrapper `TomeLevelTestAPI` over six existing backend endpoints.

**`01-home-dashboard` (modify)**
- Modify the Continue CTA's empty state → add the `HomeLevelTest` Level Test CTA
  card (lime, celebratory) shown when all curated modules are complete and the
  eligibility endpoint reports eligible.
- Add API integration: `GET /users/:userId/levelTest/eligibility`.

**Skipped (not built)**
- **Weak-areas summary** after the Level Test (idea §3.5 / US-08) — no wireframe.
  The `GetLevelTestReview` endpoint already returns weak vocabulary/grammar, so it
  can be folded into the Review phase later with no backend change.

**Remove**
- Remove the passive, non-interactive "Level test awaits!" empty state as the
  terminal all-modules-complete state — it is replaced by the interactive CTA.

## Behavior to verify
- With all curated modules at the current level `completed` and no active attempt,
  the Home dashboard shows an interactive **"Take the Level Test"** CTA (not a dead
  end), gated by `GET …/levelTest/eligibility`.
- Tapping it opens `/language-learning/level-test` at the **Ready** phase, showing
  the level scope (40 questions across all modules) and a **75%** pass threshold.
- Starting runs a 40-question single-pass test with immediate per-answer feedback,
  identical to the Module Test / practice interface.
- Submitting scores server-side: **≥ 75% → pass**, the user is **promoted to the
  next CEFR level** (`advancedTo`), and the pass screen shows the A(n) → A(n+1)
  promotion; **< 75% → fail**, the user stays on the level with a **30-minute**
  retry cooldown countdown.
- Reopening an in-progress test **resumes** (via `activeAttemptId` + `GetLevelTest`)
  rather than restarting; starting while an attempt is active returns 409 and
  resumes it.
- The Review phase lists every question with user-vs-correct answers. The
  **weak-areas summary is not shown** (skipped).
- The UI reads **75%** as the pass threshold everywhere (Ready list + `ThresholdBar`),
  overriding the stale "80%" in the wireframe.

## Affected feature files
- `docs/features/07-level-test.md` (new)
- `docs/features/01-home-dashboard.md` (modified — Continue/Level Test CTA + eligibility API)
- `docs/features/00-user-journeys.md` (modified — J6, screen inventory, narrowed Skipped entry)
