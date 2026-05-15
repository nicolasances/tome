# Spec: Vocabulary Page — Always-On Difficulty Signal

**GitHub Issue:** [#250 — Vocabulary Page: Always-On Difficulty Signal](https://github.com/nicolasances/tome/issues/250)
**Parent Feature:** [#249 — Vocabulary & Sentences — Always-On Difficulty Signal](https://github.com/nicolasances/tome/issues/249)

---

## Objective

Help a learner immediately see where they're struggling on the Vocabulary page without any extra interaction.

The list always loads hardest words first (`sortBy=difficulty&sortDir=desc`), and each word row shows a small difficulty signal icon on the far right derived from the word's `failureRatio`. No sort toggle — the ordering is fixed and always optimised for the learner's weakest words.

---

## Core Logic

### 1. Always-Sort by Difficulty

The `getVocabularyWithStats()` call in `TomeLanguageAPI` is updated to always append `&sortBy=difficulty&sortDir=desc` to the query string.

No UI control is exposed to change the sort order.

### 2. Difficulty Signal Component

A new reusable React component `DifficultySignal` is created at `app/components/DifficultySignal.tsx`.

It accepts a single prop: `failureRatio: number | null`.

Mapping from `failureRatio` to SVG asset:

| `failureRatio` value   | Icon file          |
|------------------------|--------------------|
| `null` (no practice)   | `signal-weak.svg`  |
| `< 0.25`               | `signal-weak.svg`  |
| `>= 0.25` and `< 0.5`  | `signal-fair.svg`  |
| `>= 0.5` and `< 0.75`  | `signal-good.svg`  |
| `>= 0.75`              | `signal.svg`       |

The SVG assets already exist in `/public/images/`. The component uses a standard `<img>` tag (or `next/image`) to render the icon.

The icon is sized consistently with other row icons in the app (e.g. 20×20 px).

### 3. WordItem Row Update

The `WordItem` component in the Vocabulary page is updated to include `DifficultySignal` on the far right of the row. The row uses a flex layout with the word content on the left and the icon on the right (`justify-between`).

---

## Out of Scope

- Sort toggle (asc/desc/off) — hardest-first is always the right view for a learner
- Filter by difficulty tier
- Any backend changes (the API already supports the sort params)
- Alphabetical sort option
