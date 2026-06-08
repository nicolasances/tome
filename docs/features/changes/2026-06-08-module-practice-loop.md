# Change: Module practice/test loop — coverage guarantee & continuous mastery   (2026-06-08)

## What changed

- **`05-practice-session` (Practice session)** — Practice is no longer a single
  fixed-size session. It is now a **loop** of `practiceSessionSize` sessions that
  repeats until every module vocabulary item has been shown at least once. Each
  answered exercise now **updates mastery** (it previously did not — only the
  test did). Each session now reserves at least `practiceMinUnseenVocabPercent`
  (default 50%) of its exercises for not-yet-seen vocabulary. Session size
  default **15 → 20**.
- **`03-module-overview` (Module overview)** — The Practice step row gains a
  **coverage bar** ("*seen* / *total* words") shown while Practice is active.
  Step copy updated: Practice "20 a round · no pressure", Module Test "30–40
  questions · 80% to pass" (was 20 questions). The Module Test unlock countdown
  is now measured from **full-coverage completion**, not from finishing one
  session.
- **`00-user-journeys` (J4)** — Journey now reflects the practice loop
  (Practice session repeats, returning to the Module overview between sessions).

## Why

Brainstorming surfaced an achievement-test validity gap: practice (one 15-item
session from a ~50-item bank) gave no guarantee that every module word was ever
shown before the Module Test — yet the test could draw words the user had never
encountered. The fix guarantees full vocabulary coverage during practice; once
that holds, "seen during practice" and "every module word" are the same set, so
the test can simply draw from the shared bank with the existing mastery-aware
selection, and the old "50% fresh / 50% repeat" test-composition rule is dropped.
Making mastery update continuously (practice + test) also moves the system closer
to true SRS (OQ-02).

## Impact (add / modify / remove)

**`05-practice-session`**
- *Add:* coverage-override behaviour in session selection (≥ `practiceMinUnseenVocabPercent`
  of each session is unseen vocab, overriding the mastery deprioritisation);
  multi-session loop until full coverage; persistence of encountered vocabulary
  and the practice-completion stamp; user stories for coverage and for
  practice-counting-mastery.
- *Modify:* session size 15 → 20; `SessionBar` total → 20; end-of-session
  behaviour now leads either into another session or back to the overview on full
  coverage.
- *Remove:* the "practice does not affect mastery / no-pressure scoring" framing
  — US "practise without it affecting my mastery score", the business-logic line
  "Mastery scores are NOT updated during practice", and the matching technical
  decision. **This is the item a from-scratch build would silently miss.**

**`03-module-overview`**
- *Add:* the **Practice coverage bar** component on the active Practice step row.
- *Modify:* step copy (Practice "20 a round", Module Test "30–40 questions");
  test-unlock logic now keys off full-coverage completion (`practiceCompletedAt`);
  Practice step stays `in_progress` until full coverage; mastery note corrected
  (mastery updates in Practice and Test steps, never on this hub screen).
- *Remove:* the implication that the test-unlock timer starts after a single
  practice session.

**`00-user-journeys`**
- *Modify:* J4 sequence and the Practice screen-inventory note to reflect the
  repeated-session loop.

## Behavior to verify

- A practice session presents exactly `practiceSessionSize` (20) exercises.
- At least `practiceMinUnseenVocabPercent` (50%) of each session targets
  vocabulary items not yet seen in this module, overriding mastery-based
  deprioritisation.
- Practice sessions repeat until every module vocabulary item has appeared in at
  least one exercise; reaching that point completes Step 2.
- Every answered exercise in practice updates the mastery score of its linked
  item (same as the test) — there is no practice-only "doesn't count" mode.
- The Module overview Practice step shows a coverage bar ("seen / total words")
  that fills across sessions and reaches full at Step 2 completion.
- The Module Test unlock countdown begins at full-coverage completion, not after
  a single session; the lock shows until `testUnlockDelayHours` elapse from that
  moment.
- Module overview copy reads "20 a round" for Practice and "30–40 questions ·
  80% to pass" for the Module Test.

## Affected feature files

- `docs/features/05-practice-session.md`
- `docs/features/03-module-overview.md`
- `docs/features/00-user-journeys.md`
