# Change: End-of-round "Practice complete" screens   (2026-06-13)

## What changed
- **05-practice-session** — The end of a practice round no longer shows a blocking "Saving progress…" overlay and no longer auto-routes. It now lands on a new **Practice complete screen** with two states: **Round complete** (every round before full coverage) and **Coverage milestone** (only when the round reaches full coverage). The multi-session loop becomes **user-driven** — the user chooses "Practice another round" / "Keep practising" or "Back to module" from the recap.
- **00-user-journeys** — J4's screen sequence now passes through "Practice complete"; the screen inventory gains the **Practice complete** screen (owned by `05-practice-session`); the design-variants note records Practice-complete **A + C** as chosen and **B/D** as unselected explorations.

## Why
The updated wireframe (`docs/ui-design/tome-language-learning/Practice Complete.html`, screens `practice-complete-screens.jsx` / `practice-complete-app.jsx`) replaces the blocking save overlay with a rewarding, self-paced session recap. Finishing a round should feel like a reward and hand control of the practice loop back to the user, while quietly confirming the save in the background. Per `practice-complete-app.jsx`, variants **A (Momentum ring / Round complete)** and **C (Coverage milestone)** are the spec'd designs; **B (Recap)** and **D (Quiet sheet)** are explorations and are not adopted.

## Impact (add / modify / remove)

**05-practice-session**

- **Add — Practice complete screen (Round complete state):** round label, coverage **ring** that sweeps old→new ("module covered" %), performance-driven headline + subline, three round **stats** (Answered / Mastered = first-try-correct / Accuracy), quiet **Saved chip**, CTAs **"Practice another round"** (→ new session) and **"Back to module"** (→ overview).
- **Add — Practice complete screen (Coverage milestone state):** lime tick milestone, coverage **bar** filling to 100% with "N / N words", **test-unlock card** ("Module test unlocks in 4h"), Saved chip, CTAs **"Back to module"** (→ overview) and **"Keep practising"** (→ new session).
- **Add — Saved chip** as the non-blocking save acknowledgement on both states.
- **Modify — end-of-round flow:** after `POST .../complete`, the client transitions to the Practice complete screen instead of auto-starting a session or auto-navigating; `step2Complete` selects the state.
- **Modify — multi-session loop:** now advances only on a user CTA, not automatically.
- **Remove — blocking "Saving progress…" overlay** and the **automatic** post-completion routing (auto-start next session / auto-redirect to overview).

**00-user-journeys**

- **Modify — J4** sequence and the screen inventory (new Practice complete row); **add** the Practice-complete variant choice to the design-variants note.

## Behavior to verify
- Finishing a round shows the Practice complete screen with **no** blocking "Saving progress…" overlay; the save runs in the background and is acknowledged by the "Progress saved" chip.
- `step2Complete === false` → **Round complete**: ring animates from the previous coverage % to the new %; stats show Answered / Mastered / Accuracy; CTAs are "Practice another round" + "Back to module".
- `step2Complete === true` → **Coverage milestone**: bar fills to 100% with "N / N words"; the "Module test unlocks in …" card is shown; CTAs are "Back to module" + "Keep practising".
- "Practice another round" and "Keep practising" start a new session; "Back to module" navigates to the module overview. The loop never advances without a user action.
- Round stats use the round's answer log: **Mastered** counts first-try-correct only; **Accuracy** = first-try-correct ÷ total (retry passes do not change them).

## Affected feature files
- `docs/features/05-practice-session.md`
- `docs/features/00-user-journeys.md`

## Open data dependency (flagged, not resolved)
The recap needs coverage figures the current `POST .../complete` response does not guarantee: coverage **before/after** the round (for the old→new sweep), the **practised / total word** counts, and the milestone's **test-unlock timing**. Captured as *Missing* APIs and OQ-6/OQ-7 in `05-practice-session.md` — to confirm with `tome-ms-language` before implementation.
