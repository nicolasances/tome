# Change: Grammar Intro — wireframe-aligned component update   (2026-06-09)

## What changed

- **Grammar Introduction (04-grammar-introduction)** — components revised to match the updated `module-screens.jsx` wireframe (`GrammarIntro`):
  - `StepDots` (module steps indicator) replaced by `SessionBar` (concept-level progress pill).
  - Pager dots row removed — `SessionBar` covers the "how far am I" role.
  - Concept counter changed from a centered "Concept n of N" label to a split row: `Label` "Grammar" (left) + "n / N" counter (right), positioned below `SessionBar`.
  - Concept card no longer has a bordered card wrapper; the short gloss line (e.g. "'to be' in the now") is removed — the concept name heading stands alone.
  - Success Criterion #3 ("Step dots show Grammar as current…") removed; it referenced a component that no longer appears on this screen.

## Why

The wireframe (`module-screens.jsx` → `GrammarIntro`) was updated. The previous feature spec was based on an earlier design that used `StepDots` and pager dots. The new design uses `SessionBar` for within-step concept tracking, consistent with the approach used in exercise screens (`ExShell`). The 2026-06-08 idea change (practice loop / coverage guarantee) did not affect Grammar Intro semantics.

## Impact (add / modify / remove)

**Grammar Introduction screen:**

- **Modify** — top indicator: replace `StepDots` (3-step module indicator) with `SessionBar` (segmented pill: green = concepts passed, remainder = not yet seen, deferred = 0).
- **Modify** — concept counter: was a centered "Concept n of N" label; now a split row (`Label` "Grammar" left, "n / N" counter right) directly below `SessionBar`.
- **Remove** — pager dots row (the row of elongated/highlighted dots below the concept card).
- **Modify** — concept card: remove the outer card border; remove the short gloss subtitle under the concept name. Icon + name heading, explanation, and lime-bordered examples remain unchanged.

## Behavior to verify

- The `SessionBar` at the top shows the correct total (= number of concepts) and advances its green segment each time the user taps Next.
- The "Grammar" label and "n / N" counter are rendered as a split row below the `SessionBar`, not centered above the concept card.
- No pager dots appear anywhere on the Grammar Intro screen.
- The concept card renders as an inline content area (no visible card border); the concept name appears as a heading directly next to the teacher icon, with no additional gloss line below it.
- All other behavior (explanation text, lime-bordered examples, Next control, practice-session start on last concept) is unchanged.

## Affected feature files

- `docs/features/04-grammar-introduction.md`
