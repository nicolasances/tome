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
| Production-type exercise | An exercise type requiring the user to construct an answer from memory rather than recognize/select it. In this proposal, only `translation_active` qualifies. |
| Recognition-type exercise | `multiple_choice`, `sentence_reorder`, `fill_blank`, `conjugation_drill`, `error_correction` — useful scaffolded practice, but does not clear the completion gate under this proposal. |
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

---

## 4. Data Models

**Additive fields on `UserVocabularyProgress` / `UserGrammarConceptProgress`:**

| Field | Type | Purpose |
|---|---|---|
| `productionCorrectCount` | integer (0–2, capped) | Number of counted production reps so far for this item. |
| `lastCorrectProductionAt` | timestamp \| null | Timestamp of the last *counted* correct production rep, used for spacing checks. |

**Completion determination:** `practiceCompletedAt` is set once every id in `Module.vocabularyItemIds` and `Module.grammarConceptIds` has `productionCorrectCount >= 2` for that user. The existing `testUnlockDelayHours` delay after `practiceCompletedAt` is unchanged.

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

- **Assumption** — `translation_active` exercises are actually generated/available for grammar concepts today, not just vocabulary items. Unverified; see OQ-01.
- **Assumption** — two spaced production-correct reps meaningfully improves perceived depth and retention. Grounded in general spaced-repetition/production-effect principles, not validated against Tome's own retention data.
- **Assumption** — an ~18h elapsed threshold is a good enough proxy for "a separate sitting," without needing calendar-day semantics. Cheap to implement; the exact number may need tuning after real usage data.
- **Constraint** — `masteryScore` and its update formula remain untouched and unspecified server-side (`tome-ms-language`); this gate is intentionally independent of it.
- **Constraint** — the exercise bank (~50 exercises/module) must contain enough `translation_active` exercises per item to serve 2 non-adjacent reps without feeling repetitive; unverified, see OQ-02.
- **Constraint** — this changes default behavior for every user with no flagging/rollout mechanism defined yet.

---

## 7. Open Questions

| # | Question | Options / Notes |
|---|---|---|
| OQ-01 | Are `translation_active` exercises currently generated for grammar concepts, or only vocabulary items? | Blocks grammar inclusion (3.4) until confirmed against the actual exercise bank / generation logic. |
| OQ-02 | Is the per-module exercise bank large enough to reliably serve 2 non-adjacent `translation_active` reps per item? | May require enlarging the bank or generating on demand rather than from a fixed ~50-exercise pool. |
| OQ-03 | What's the right default for `practiceProductionSpacingHours`? | Candidates: 16h, 18h, 24h. Could start conservative and tune from usage data. |
| OQ-04 | Should an incorrect `translation_active` answer reset `productionCorrectCount` to 0, or just fail to advance it? | Not decided during ideation — affects how punishing the gate feels. |
| OQ-05 | Could longer module-completion time hurt engagement (drop-off) instead of improving perceived depth? | Worth monitoring completion-time and drop-off metrics after ship. |

---

## 8. Not Doing (and Why)

- **Fixing `masteryScore`'s update formula** — owned by `tome-ms-language` and explicitly unresolved there; this gate is designed to not depend on it.
- **Calendar-day-based spacing** — rejected for timezone/DST/day-boundary complexity (e.g. two reps 4 minutes apart technically spanning midnight); elapsed-hours threshold chosen instead.
- **Hard-blocking "come back tomorrow" UI** — would fight user motivation instead of channeling it into more (recognition-type) practice.
- **Per-user/per-level adaptive thresholds** — flat config for v1; revisit if usage data supports personalization.
- **Including `conjugation_drill`/`error_correction` as production types** — deferred until there's confidence they're a comparably strong signal to `translation_active`.

---

## 9. Ideas for Future Versions

- Fix `masteryScore`'s update algorithm to be exercise-type/difficulty-aware, potentially replacing this standalone gate with a properly calibrated mastery score.
- Adaptive spacing/rep-count thresholds per user pace or CEFR level.
- Surface a "readiness" UI state explaining why an item hasn't cleared yet, instead of silent enforcement.
- A continuous SRS engine spanning modules, rather than discrete per-module practice phases.
- Expand the production-type set beyond `translation_active` once validated.
