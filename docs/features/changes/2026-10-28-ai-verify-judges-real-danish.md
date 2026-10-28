# Change: "Check with AI" judges real Danish, shows a note when accepted   (2026-10-28)

## What changed
- **`05-practice-session` — modified** — "Check with AI" is now described as
  judging whether the learner's translation is correct, natural Danish, **not**
  whether it matches the exercise's expected answer. The `AIVerifyTray` accepted
  state shows the AI `explanation` when the backend returns one with
  `valid: true`; with no explanation it keeps the fixed line "Your translation
  works too — counting it as correct.". The loading explainer line is reworded
  to "Checking whether your translation is correct, natural Danish — it doesn't
  have to match the exercise's answer word for word.".
- **`06-module-test` — modified** — same update for the in-test `AIVerifyTray`
  (reused as-is from practice) and the F13 integration row.

## Why
Issue #347: the AI rejected correct translations that differed from the expected
answer (e.g. "Du er enig med mig, ikke?" for "Du er vel enig med mig?"), even
while saying the answer was fine. The prompt fix is in the backend
(tome-ms-language#106). Once correct alternatives are accepted, a learner who
skips the exercise's target word (here "vel") would never see it, so the
accepted state needs somewhere to show a note about the expected phrasing.

## Impact (add / modify / remove)

**`05-practice-session` (modify)**
- Modify `AIVerifyTray` accepted state → renders the AI note, or the fixed line
  when there is none.
- Modify the loading explainer copy.
- Modify the AI verification description and the F13 integration row:
  `explanation` may come with either verdict.

**`06-module-test` (modify)**
- Modify the `AIVerifyTray` row, the "Check with AI" business rule and the F13
  integration row to match.

**Not changed**
- Rejected state, the one-verification-per-exercise rule, the normalised
  matcher, "Explain my mistake" (#275), and the Level Test stub (#310).
- The frontend change is safe before tome-ms-language#106 ships: with no
  explanation on `valid: true` it behaves as before.
