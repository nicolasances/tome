# Change: Words Practice — on-demand vocabulary refresh   (2026-11-08)

## What changed
- **`09-words-practice` — new** — a new practice type, separate from module practice: the user translates single words (English → Danish, typed) drawn from every completed module, with missed words retried until correct, "Check with AI" after a wrong answer, and a results screen with first-attempt accuracy and missed words. Owns two new screens and the `TomeWordsPracticeAPI` client. Replaces (and removes) the legacy pre-v2.0 vocabulary practice. **Designed without wireframe** (OQ-01).
- **`01-home-dashboard` — modified** — new Words Practice entry point: on desktop it replaces the "x of N modules" stat tile; on mobile it is a new **Words** button in the nav row. The "This week" chart stacks a fourth segment (Words Practice sessions); the desktop "sessions this week" counter and the active-days tile include them. Entry point **designed without wireframe** (OQ-01).
- **`00-user-journeys` — modified** — new journey **J7 — Refresh my vocabulary**; two new screens in the inventory; legacy and wireframe-exception notes.

## Why
Vocabulary of completed modules is never practised again outside a one-off level test, so it fades while its mastery score stays high. Words Practice re-checks it on demand and gives the user something useful to do at any time, including when the next module step is locked. Product decisions: [`docs/idea/language-learning/2026-11-08-words-practice.md`](../../idea/language-learning/2026-11-08-words-practice.md). Backend: `tome-ms-language` F26, F27 and the F24 update (`changes/2026-11-08-words-practice.md` in that repo).

## Impact (add / modify / remove)

**`09-words-practice` (add)**
- Add screen **Words Practice session** (`/language-learning/words-practice/[sessionId]`): progress bar, kicker, prompt card (English + type + context chips), Danish answer input, check footer, result sheet (correct / wrong + "Check with AI"), AI verify tray.
- Add screen **Words Practice results** (`/language-learning/words-practice/[sessionId]/results`): headline, 3 stats, missed-words list, saved chip, "Practice more words", "Back to home".
- Add `TomeWordsPracticeAPI` (start, get, answer, verify, complete, summary).
- Modify (refactor, no behaviour change): practice components reused here (`ResultSheet`, `CheckFooter`, `SheetBtn`, `AIVerifyTray`, Practice complete building blocks) move to a shared location; `AIVerifyTray` receives its verify action as an input so it can call F27 here and F13 in module practice / test.

**`01-home-dashboard` (modify)**
- Add the Words Practice entry: desktop tile (replacing the modules stat tile), mobile **Words** nav button; enabled / Resume / disabled states from the summary endpoint.
- Modify the weekly stats chart: fourth stacked segment for `wordsPracticeSessions`.
- Modify the desktop "sessions this week" counter and the active-days count to include Words Practice sessions.
- Remove the desktop "x of N modules" stat tile (the count stays in the Level track).

**Remove**
- The legacy vocabulary practice: the `/language-learning/vocabulary-practice` and `/language-learning/summary` routes, the `TomeVocabularyPracticeAPI`, `IVocabularyPracticeAPI`, `MockVocabularyPracticeAPI`, `VocabularyPracticeAPIFactory` and `PracticeSessionHelper` API files, the `VocabularyPractice` model, and the `NEXT_PUBLIC_VOCAB_PRACTICE_MOCK` setting. Not removed: legacy `sentence-practice` / `sentence-summary`.

## Behavior to verify
- Home: with no completed module the Words Practice entry is disabled with "Complete a module to unlock"; with an open session it reads Resume and opens that session; otherwise it starts a session and lands on it (409 → the returned session).
- Session: one English prompt at a time with type (and context when present); typed answer judged by the backend; wrong answers show the Danish and come back after the first pass until correct; the session completes only when every word is correct.
- "Check with AI" appears only after a wrong answer, once per answer; accepted → word counts as correct and is not re-queued; not accepted → explanation + correct Danish, word re-queued.
- Leaving mid-session and resuming restores the queue, progress bar and kicker.
- Results: Words / First try / Accuracy and the missed words (English → Danish); reloadable; "Practice more words" starts or resumes a session.
- Weekly chart stacks Words Practice sessions as a fourth segment; desktop counter = module practice + Words Practice sessions; a day with only Words Practice counts as active.
- Desktop no longer shows the "x of N modules" tile; the Level track still shows module progress.
- Module practice and module test behave exactly as before after the shared-component move.
- No references to the removed legacy vocabulary practice remain; the build passes.

## Affected feature files
- [09-words-practice.md](../09-words-practice.md) (new)
- [01-home-dashboard.md](../01-home-dashboard.md)
- [00-user-journeys.md](../00-user-journeys.md)
