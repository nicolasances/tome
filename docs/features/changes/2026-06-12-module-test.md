# Change: Add the Module Test (Step 3) capability   (2026-06-12)

## What changed

- **`06-module-test` (Module Test) — NEW feature.** Adds the gated, scored Step 3
  assessment as one capability owning the full test flow: locked countdown →
  ready → in-test → submit → result (pass/fail) → review. The in-test phase reuses
  the practice exercise interface; the test's only distinct chrome is the
  "Module Test" header + a single linear question-progress bar. 80% to pass; mastery
  updates as in practice.
- **`03-module-overview` (Module overview) — modified.** The Test step row and the
  primary CTA now navigate to `06-module-test` when unlocked, instead of rendering a
  disabled "Start test" placeholder. The Module Test screen/results are no longer
  "skipped"; the overview owns only the Test step **row**.
- **`05-practice-session` (Practice session) — modified.** The Module Test is no
  longer "skipped"; it is owned by `06-module-test` and **reuses this feature's six
  exercise renderings + `ResultSheet`/`AnswerBox`**. Noted the test is single-pass
  (no retry-until-correct), unlike practice.
- **`00-user-journeys` — modified.** Added journey **J5** (take the module test),
  added the **Module test** screen to the inventory (owned by `06-module-test`), and
  removed the Module Test row from "Skipped — not yet covered".

## Why

The `test-screens.jsx` wireframe was added under
`docs/ui-design/tome-language-learning/`, now covering the Module Test screens that
were previously listed as skipped (no wireframe). This closes the largest gap in the
module flow: the overview and practice already referenced a Test step they handed
off to nothing. The user explicitly directed this breakdown at the **updated
wireframe** as the source of truth.

## Impact (add / modify / remove)

**`06-module-test` (add)**
- Screens: Module test route with phases — Locked (`TestLocked`), Ready
  (`TestReady`), In-test (`TestShell` + reused exercise bodies + `ResultSheet`),
  Submit (`TestSubmit`), Result pass (`TestResultPass`), Result fail
  (`TestResultFail`), Review (`TestReview` / `ReviewCorrect` / `ReviewWrong`).
- Reuses practice components (`05`) and exercise primitives — no new feedback visuals.

**`03-module-overview` (modify)**
- *Modify:* Out-of-scope note — Module Test now owned by `06-module-test`; overview
  owns only the Test step row.
- *Modify:* Additional Note — unlocked Test row / CTA navigates into `06-module-test`.
- *Modify:* Technical Decision #7 — CTA navigates to the test route (was: disabled placeholder).
- *Resolve:* Open Question #1 — CTA/row both route to the test feature.

**`05-practice-session` (modify)**
- *Modify:* Out-of-scope note — Module Test owned by `06-module-test` and reuses this
  feature's exercise renderings; test is single-pass.

**`00-user-journeys` (modify)**
- *Add:* Journey J5; Module test screen in the inventory.
- *Remove:* Module Test row from the "Skipped — not yet covered" table.

**Removed scope:** none. (No previously-specified behaviour was dropped; the
overview's disabled "Start test" placeholder is superseded by real navigation.)

## Behavior to verify

- The Test step row / CTA on the Module overview navigates to the test route only
  when unlocked; while locked it shows the unlock countdown and is not actionable.
- Locked test screen counts down to `testUnlocksAt`; "Start test" disabled until then.
- Ready screen shows the configured question count and 80% pass threshold; "Start
  test" begins a scored test.
- In-test: linear bar 1 → N; each answer gets immediate `ResultSheet`/`AnswerBox`
  feedback (per wireframe); missed questions are **not** re-presented.
- Submit screen confirms before scoring; "Back to questions" returns without scoring.
- Score ≥ 80% → Pass, module `completed`, next module unlocked; mastery updated.
- Score < 80% → Fail with a "Retry in …" countdown to `testRetryAvailableAt`; retry
  draws a new selection.
- Review lists every question with user-vs-correct answers; wrong rows expose the
  stubbed "Explain my mistake" / "Check with AI" actions.
- Reopening an in-progress test resumes the correct phase/question (parity with the
  practice resume rule), never restarting or wrongly finalising.

## Resolved during this change (2026-06-12)

- **Immediate feedback (was OQ-1):** confirmed — answers are checked and shown
  immediately during the test, single-pass, to stay coherent with the practice
  flow. **`idea.md` §3.1.1 Step 3 point 4 updated** accordingly (the requirement
  itself changed, not just the feature spec).
- **Backend endpoints (was "Missing", critical):** confirmed implemented in
  `tome-ms-language` (**F11**), per its `index.ts`:
  `GET /users/:userId/modules/:moduleId/testEligibility`,
  `POST /users/:userId/modules/:moduleId/tests`,
  `GET /users/:userId/moduleTests/:attemptId`,
  `POST /users/:userId/moduleTests/:attemptId/answers`,
  `POST /users/:userId/moduleTests/:attemptId/submit`,
  `GET /users/:userId/moduleTests/:attemptId/review`.
  These resolve the test's resume + per-answer-persistence questions too (feature
  OQ-3, OQ-4). The only remaining frontend work is a `TomeModuleTestAPI` wrapper;
  exact request/response field names should be read from the F11 delegates.

- **Single-pass test (was OQ-2):** confirmed — a wrong in-test answer is shown and
  the user continues; questions are never re-presented (no retry-until-correct). The
  first answer counts toward the score.
- **Post-pass navigation (was OQ-5):** the Pass screen's primary "Home" button
  returns to the **Home dashboard** (`01-home-dashboard`); "Review answers" opens the
  Review phase.
- **Submit screen (was OQ-6):** "Back to questions" is **removed** and the
  "you can't change answers once you submit" copy is dropped (both obsolete under
  immediate-feedback + single-pass). The screen is a single "Submit test" action with
  a finish-and-reveal prompt. This is an **intentional deviation** from the
  `TestSubmit` wireframe (feature Technical Decision #11).

## Open points carried into implementation

- **Add `TomeModuleTestAPI`** wrapping the six F11 endpoints; confirm field names
  against the delegates when writing it.

## Affected files

- `docs/features/06-module-test.md` (new)
- `docs/features/03-module-overview.md`
- `docs/features/05-practice-session.md`
- `docs/features/00-user-journeys.md`
- `docs/idea/language-learning/idea.md` (§3.1.1 Step 3 — requirement changed)
