# Spaced Production-Based Practice Completion Gate

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Core Concepts](#2-core-concepts)
3. [Features](#3-features)
4. [Data Models](#4-data-models)
5. [Key User Stories](#5-key-user-stories)
6. [Constraints & Assumptions](#6-constraints--assumptions)
7. [Open Questions](#7-open-questions)
8. [Not Doing (and Why)](#8-not-doing-and-why)
9. [Ideas for Future Versions](#9-ideas-for-future-versions)

---

## 1. Purpose & Scope

### 1.1 What is this?

A change to how a module's practice phase decides "the user has practiced enough to take the test." Today, practice completion is gated purely on **exposure** — each vocabulary item must have appeared in at least one exercise. This proposal replaces that with a gate based on **demonstrated production** (active recall, not recognition) and **enforced spacing** between repetitions, so the module test isn't unlocked after a couple of shallow sessions.

### 1.2 Who is it for?

All Tome users progressing through CEFR-level modules. This changes default practice behavior, not an opt-in feature.

### 1.3 What problems does it solve?

- The current coverage gate measures "seen once," not "learned" — it says nothing about whether the user can actually recall the item.
- `practiceMinUnseenVocabPercent` (50%) forces half of every session onto unseen vocabulary, which mechanically accelerates "coverage complete" for a typical 30–40 word module in as few as 2 sessions, regardless of how well the user is actually doing.
- Grammar concepts have **no** coverage/practice gate at all today — they're introduced once in step 1 and never required again before the test unlocks.
- A correct answer on an easy recognition-type exercise (e.g. multiple choice) currently counts toward practice progress exactly the same as a correct answer on a much harder production-type exercise, even though it's a far weaker signal of real learning.

### 1.4 Out of scope (v1)

- Fixing or formalizing the underlying `masteryScore` update algorithm. It lives server-side (`tome-ms-language`) and is explicitly unspecified/tunable today (`idea.md:184`) — this feature defines an independent gate rather than depending on it.
- Hard-blocking UI ("come back tomorrow" walls). Ruled out — it fights user motivation rather than channeling it.
- Per-user or per-level adaptive thresholds (rep count, spacing hours, unseen %) — flat config for all users in v1.
- Extending "production type" beyond `translation_active` (e.g. `conjugation_drill`, `error_correction`) until there's confidence they're a comparably strong signal.

---

## 2. Core Concepts

| Term | Definition |
|---|---|
| Coverage gate (current) | Existing rule: practice is "complete" once every vocab item has appeared in ≥1 exercise, regardless of correctness. Being replaced by this proposal. |
| Production-type exercise | An exercise type requiring the user to construct an answer from memory rather than recognize/select it. In this proposal, only `translation_active` qualifies — for **both** vocabulary items and grammar concepts (see 3.4/3.5). |
| Recognition-type exercise | For vocabulary: `multiple_choice`, `fill_blank`, `conjugation_drill`. For grammar: `sentence_reorder`, `error_correction`. All remain useful scaffolded practice, but none clear the completion gate under this proposal. |
| Production rep | One correct answer on a production-type exercise for a given item, counted toward that item's completion. |
| Spacing threshold | Minimum elapsed time required between an item's counted production reps before the second one counts (e.g. ≥18h). Replaces a calendar-day requirement to avoid timezone/DST edge cases. |
| `practiceMinUnseenVocabPercent` | Existing config controlling the minimum share of a session's exercises reserved for not-yet-seen items. Proposed to drop from 50% to 25%. |
| `practiceCompletedAt` | Existing timestamp marking practice-phase completion, which unlocks the module test after a fixed delay. Trigger mechanism is unchanged; what feeds into it changes. |

---

## 3. Features

### 3.1 Reduced unseen-vocab reservation per session

Lower `practiceMinUnseenVocabPercent` from 50% to 25%. Sessions no longer force half their exercises onto brand-new items, spreading first exposure across more sessions instead of front-loading it.

### 3.2 Production-based completion gate (vocabulary + grammar)

Replace "seen once" with: each vocabulary item and grammar concept must receive **2 correct answers on `translation_active` exercises** before it counts as practiced. A correct answer on any recognition-type exercise no longer advances an item toward completion — it remains useful as scaffolded practice, just not gate-clearing.

### 3.3 Elapsed-time spacing enforcement

Track a `lastCorrectProductionAt` timestamp per item per user. A correct `translation_active` answer only counts as the item's 2nd rep if `now - lastCorrectProductionAt >= practiceProductionSpacingHours` (proposed default: ~18h). If the user answers correctly twice in the same sitting, only the first counts — the item simply stays open and keeps appearing in future session pools. No blocking UI, no message explaining why (silent enforcement, per decision).

### 3.4 Grammar concepts join the gate

Grammar concepts get the same production + spacing requirement as vocabulary items, closing the existing gap where grammar has zero enforced practice today.

This requires an architecture change: today `translation_active` exercises always set `vocabularyItemId` and never `grammarConceptId` (fixed 1:1 type→id mapping in the content-generation rules). This proposal loosens that — `translation_active` may set **either** id, chosen by what the exercise's single focus is testing. A grammar-focused `translation_active` exercise must be authored so the English prompt forces the specific structure being tested (e.g. inversion after a fronted adverbial, subordinate-clause word order, negation placement) as an unavoidable part of a correct answer, not an incidental one. This keeps the design symmetric: `sentence_reorder`/`error_correction` become grammar's recognition/scaffold tier, exactly as `multiple_choice`/`fill_blank`/`conjugation_drill` already are for vocabulary — one production type (`translation_active`) sits on top of both.

### 3.5 Content-generation skill changes

The `generate-module-content` skill must change to guarantee the exercise bank can actually satisfy this gate. Concretely, in `.claude/skills/generate-module-content/`:

- **`rules-for-generation.md`**: loosen the type→id mapping table so `translation_active` can link to either id (per 3.4); add authoring guidance for the grammar case; make the coverage rule type-specific — the target becomes **≥2 `translation_active` exercises per vocabulary item AND per grammar concept**, not 2 exercises of any type.
- **`validate_coverage.py`**: currently counts *any* exercise type toward the per-item target and only requires "≥1 of any type" for grammar concepts. Add a new, additional hard check requiring ≥2 `translation_active` specifically per vocab item and per grammar concept, since that's what this gate actually consumes. Keep the existing "≥1 of any type" check as-is — scaffolded-practice diversity still matters independently.
- **`validate_distribution.py`**: no logic change, but the per-level `translation_active` floor percentages (10–35%, see the table in `rules-for-generation.md`) need re-checking against the new hard per-item ×2 floor summed across vocab **and** grammar — at A1 in particular (10% floor) the percentage may not translate into enough raw exercises once item counts are typical. A numbers check, not a code change, but may result in raised floors.

---

## 4. Data Models

**Additive fields on `UserVocabularyProgress` / `UserGrammarConceptProgress`:**

| Field | Type | Purpose |
|---|---|---|
| `productionCorrectCount` | integer (0–2, capped) | Number of counted production reps so far for this item. |
| `lastCorrectProductionAt` | timestamp \| null | Timestamp of the last *counted* correct production rep, used for spacing checks. |

**Completion determination:** `practiceCompletedAt` is set once every id in `Module.vocabularyItemIds` and `Module.grammarConceptIds` has `productionCorrectCount >= 2` for that user. The existing `testUnlockDelayHours` delay after `practiceCompletedAt` is unchanged.

**`Exercise` model change:** the invariant "exactly one of `vocabularyItemId` or `grammarConceptId` must be set" is unchanged, but the fixed 1:1 binding between `type` and which id it sets is loosened for `translation_active` only — it may now set either, depending on what the exercise is designed to test (see 3.4). All other exercise types keep their current fixed binding.

**New/changed config values:**

| Config | Current | Proposed |
|---|---|---|
| `practiceMinUnseenVocabPercent` | 50% | 25% |
| `practiceProductionExerciseTypes` | — (new) | `[translation_active]` |
| `practiceProductionRequiredCount` | — (new) | 2 |
| `practiceProductionSpacingHours` | — (new) | ~18 (needs decision, see OQ-03) |

---

## 5. Key User Stories

| # | As a user, I want to… | So that… |
|---|---|---|
| US-01 | keep practicing a word until I've actually produced it from memory, not just recognized it once | I feel genuinely ready for the module test, not rushed into it |
| US-02 | have my practice on a word naturally spread across more than one sitting | I can't "fake" readiness by cramming everything in one session |
| US-03 | have grammar concepts practiced with the same rigor as vocabulary | grammar isn't the weak link going into the test |
| US-04 | keep getting relevant exercises even when I'm not yet "done" with an item | I never feel blocked or punished, just kept in practice |

---

## 6. Constraints and Assumptions

- **Decision** — `translation_active` is extended to link to `grammarConceptId` as well as `vocabularyItemId` (previously vocab-only). This is a deliberate architecture change made during ideation, not an open question — see 3.4/3.5 and OQ-06 for the remaining rollout detail.
- **Assumption** — two spaced production-correct reps meaningfully improves perceived depth and retention. Grounded in general spaced-repetition/production-effect principles, not validated against Tome's own retention data.
- **Assumption** — an ~18h elapsed threshold is a good enough proxy for "a separate sitting," without needing calendar-day semantics. Cheap to implement; the exact number may need tuning after real usage data.
- **Constraint** — `masteryScore` and its update formula remain untouched and unspecified server-side (`tome-ms-language`); this gate is intentionally independent of it.
- **Constraint** — the exercise bank (~50 exercises/module) must contain enough `translation_active` exercises per item (vocab and grammar) to serve 2 non-adjacent reps without feeling repetitive; unverified, see OQ-02.
- **Constraint** — this requires generation-tooling changes (3.5) to ship before or alongside the app-side gate — new modules generated under the old rules won't have enough `translation_active` coverage to ever satisfy this gate.
- **Constraint** — this changes default behavior for every user with no flagging/rollout mechanism defined yet.

---

## 7. Open Questions

| # | Question | Options / Notes |
|---|---|---|
| OQ-01 | Do the current per-level `translation_active` bank percentage floors (`validate_distribution.py`, 10–35%) yield enough raw exercises to hit the new ≥2-per-item hard floor summed across vocab **and** grammar? | Especially at A1 (10% floor). May require raising the floors — a numbers check against typical module item counts, done as part of 3.5. |
| OQ-02 | Is the per-module exercise bank large enough to reliably serve 2 non-adjacent `translation_active` reps per item? | May require enlarging the bank or generating on demand rather than from a fixed ~50-exercise pool. |
| OQ-03 | What's the right default for `practiceProductionSpacingHours`? | Candidates: 16h, 18h, 24h. Could start conservative and tune from usage data. |
| OQ-04 | Should an incorrect `translation_active` answer reset `productionCorrectCount` to 0, or just fail to advance it? | Not decided during ideation — affects how punishing the gate feels. |
| OQ-05 | Could longer module-completion time hurt engagement (drop-off) instead of improving perceived depth? | Worth monitoring completion-time and drop-off metrics after ship. |
| OQ-06 | What happens to modules already generated under the old rules, which likely lack enough `translation_active` coverage (especially for grammar, where it didn't exist at all)? | Options: backfill via a bank refresh pass before enabling the gate, or grandfather existing modules under the old coverage gate until refreshed. Not decided during ideation. |

---

## 8. Not Doing (and Why)

- **Fixing `masteryScore`'s update formula** — owned by `tome-ms-language` and explicitly unresolved there; this gate is designed to not depend on it.
- **Calendar-day-based spacing** — rejected for timezone/DST/day-boundary complexity (e.g. two reps 4 minutes apart technically spanning midnight); elapsed-hours threshold chosen instead.
- **Hard-blocking "come back tomorrow" UI** — would fight user motivation instead of channeling it into more (recognition-type) practice.
- **Per-user/per-level adaptive thresholds** — flat config for v1; revisit if usage data supports personalization.
- **Including `conjugation_drill`/`sentence_reorder`/`error_correction` as production types** — deferred until there's confidence they're a comparably strong signal to `translation_active`.
- **Backfilling existing modules' exercise banks as part of this issue** — tracked as OQ-06; treated as a separate rollout decision, not designed here.

---

## 9. Ideas for Future Versions

- Fix `masteryScore`'s update algorithm to be exercise-type/difficulty-aware, potentially replacing this standalone gate with a properly calibrated mastery score.
- Adaptive spacing/rep-count thresholds per user pace or CEFR level.
- Surface a "readiness" UI state explaining why an item hasn't cleared yet, instead of silent enforcement.
- A continuous SRS engine spanning modules, rather than discrete per-module practice phases.
- Expand the production-type set beyond `translation_active` once validated.
