# Practice Ladder — Sequential Rung Phases for Module Practice

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

A restructuring of module practice (Step 2) from **one exposure pass** into **three sequential rung phases** of increasing difficulty:

1. **Rung 1 · Recognition** — select or assemble from provided material
2. **Rung 2 · Cued production** — produce a form, heavily constrained by context
3. **Rung 3 · Free production** — produce from meaning alone

Each rung phase runs as many practice sessions as it takes to cover **every vocabulary item and every grammar concept** at that rung. When a rung is fully covered, the module advances to the next. Practice completes when rung 3 is covered.

Sessions themselves are unchanged in shape: 20 exercises, ≥50% reserved for items not yet covered at the current rung, missed exercises retried until correct before the session closes.

The module test and the level test are unchanged.

### 1.2 Who is it for?

The single current Tome user, working through the Danish CEFR curriculum. This changes default practice behaviour; it is not opt-in.

### 1.3 What problems does it solve?

- **One exposure isn't practice.** Today Step 2 completes once every vocabulary item has *appeared* in a single exercise (`F10-practice-session.md:9`, `idea.md` §3.1.1). A word shown once in a multiple-choice prompt clears the gate.
- **The gate is trivially fast.** With `PRACTICE_MIN_UNSEEN_VOCAB_PERCENT = 50`, a 50-item module reaches "full coverage" in ~5 sessions and the test unlocks 4h later.
- **Grammar concepts are excluded from the gate entirely.** They are introduced once in Step 1 (F09) and never required again.
- **Difficulty isn't graduated across the module.** Exercise types are ordered recognition→production *within* a session, but a word's very first encounter can be a free-production `translation_active` exercise, and a word's only encounter can be a multiple choice.
- **Free production isn't guaranteed at all.** Only 61% of items currently hold any rung-3 exercise, and nothing requires the user to meet one.

### 1.4 Out of scope (v1)

- The module test and level test (F11, F21) — selection, gating, scoring, thresholds all unchanged.
- The SRS formula in `SrsAlgorithm.ts`. `masteryScore` keeps its current meaning and role.
- Regenerating A1 exercise banks (see §3.6).
- Any change to `practiceSessionSize` (stays 20) or `PRACTICE_MIN_UNSEEN_VOCAB_PERCENT` (stays 50).
- Measuring recall in the practice gate — see §6, this is a deliberate boundary.

---

## 2. Core Concepts

| Term | Definition |
|---|---|
| Practice item | One vocabulary item **or** one grammar concept referenced by the module. Both are covered at every rung; the current gate covers only vocabulary. |
| Rung | A difficulty tier of exercise: **1 · recognition**, **2 · cued production**, **3 · free production**. Derived from `Exercise.type` via the fixed map in §3.1; not stored on the exercise. |
| Rung phase | The stretch of practice sessions during which the module is working at one rung. Three phases, strictly sequential, module-wide. |
| Current rung | The rung the module is currently practising at, for this user. A module-level property, not a per-item one. |
| Covered at rung *r* | An item has been served an exercise of tier *r* in a completed session. Because the session retry queue runs until every exercise is answered correctly, a covered item has also been answered correctly at that rung. |
| Rung phase complete | Every practice item in the module is covered at the current rung. Triggers advance to the next rung. |
| Ladder complete | Rung 3 is complete. Sets `practiceCompletedAt` and starts the existing test-unlock countdown. |
| Unseen item | Within a rung phase: an item not yet covered *at that rung*. This is what the existing 50% reservation targets — the notion resets at each rung transition. |

---

## 3. Features

### 3.1 The rung → exercise-type mapping

| Rung | Name | What it demands | Vocabulary types | Grammar types |
|---|---|---|---|---|
| 1 | Recognition | Select or assemble from provided material | `multiple_choice` | `sentence_reorder` |
| 2 | Cued production | Produce a form, heavily constrained by context | `fill_blank`, `conjugation_drill` | `fill_blank` |
| 3 | Free production | Produce from meaning alone | `translation_active` | `error_correction`, `translation_active` |

This mapping is why the type→id binding has to be loosened (§3.2): under today's fixed table, **grammar has no rung-2 type at all** (`rules-for-generation.md:45-54`), so a three-rung ladder covering grammar is not expressible.

`sentence_reorder` sits at rung 1 deliberately: the word tiles are supplied, so it is assembly, not production.

### 3.2 Loosened type → item-id binding

`fill_blank` and `translation_active` may link to **either** `vocabularyItemId` or `grammarConceptId`, chosen by what the exercise actually tests. All other types keep their current fixed binding. The invariant "exactly one of the two is set" is unchanged.

Authoring requirement: a grammar-linked exercise of either type must be constructed so the structure under test is **unavoidable** in a correct answer — a fronted adverbial forcing inversion, a subordinate clause forcing word order, a blank placed where negation must land — not incidental to it.

### 3.3 Sequential rung phases

- Practice starts at rung 1.
- Sessions run within the current rung phase, drawing only exercises of that rung's tier.
- An item becomes **covered at that rung** when it has been served a tier-*r* exercise in a completed session.
- When every practice item (vocabulary + grammar) is covered at the current rung, the phase completes and the current rung advances.
- When rung 3 completes, `practiceCompletedAt` is set and the existing `testUnlockDelayHours` countdown starts, exactly as today.

Correctness within a session is handled by the **existing retry queue**, unchanged: a missed exercise is re-presented until answered correctly before the session closes (`F10-practice-session.md:67`). So when a rung phase completes, every item has been answered correctly at that rung — some on the first attempt, some after the answer was revealed.

There is no per-item rung state, no earned advancement, and therefore **nothing can get stuck**. The number of practices is bounded by construction (§3.8).

### 3.4 Session composition

Session size stays at `practiceSessionSize` (20). Selection, in order:

1. **Rung-filtered pool** — only exercises whose rung tier equals the module's current rung.
2. **Unseen reservation** — unchanged mechanism, per-rung scope: at least `PRACTICE_MIN_UNSEEN_VOCAB_PERCENT` (50%) of the session reserved for items not yet covered *at this rung*. This is what bounds the phase length.
3. **F08 selection** for the remaining slots over the rung-filtered pool — unchanged `(1 − masteryScore)` weighting plus the recent-miss boost. Items the user has failed sit near mastery 0 and surface naturally.
4. **Retry queue** — unchanged. Missed exercises are re-presented until correct before the session closes.
5. **Tail top-up** — when fewer uncovered items remain than would fill a session, do not pad to 20 with pure repetition. Draw the remaining uncovered items and top up from the covered pool to at most `2 × uncoveredCount`, so the phase's last session is short rather than 20 exercises to cover two items.

`ExerciseSelector` (F08) itself needs no change — it receives a pre-filtered pool.

### 3.5 Content generation changes

In `tome/.claude/skills/generate-module-content/`:

**`rules-for-generation.md`**
- Loosen the type→id table for `fill_blank` and `translation_active` (§3.2).
- Add the rung table (§3.1) as the organising structure for the bank.
- Replace the coverage rule ("≥1 exercise per vocabulary item — target 2 — and ≥1 per grammar concept") with **per-rung** coverage, for every vocabulary item *and* every grammar concept:

  | Rung | Hard floor | Target |
  |---|---|---|
  | 1 · recognition | ≥ 1 | ≥ 1 |
  | 2 · cued production | ≥ 1 | ≥ 1 |
  | 3 · free production | ≥ 1 | ≥ 2 |

  The hard floor is ≥1 at every rung: an item with no exercise at a rung can never be covered there, so the phase can never complete. Rung 3 targets 2 because the module test samples the same bank and free production is where variety matters most.

- Add authoring guidance for grammar-linked `fill_blank` and `translation_active`.
- **Demote the CEFR distribution table** (`rules-for-generation.md:26-33`) to advisory. See OQ-01.

**`validate_coverage.py`** — replace the "≥1 of any type per item" check with per-rung coverage: every item must hold ≥1 exercise at each of the three rungs. Hard gate; generation is not done until it exits 0.

**`validate_distribution.py`** — demoted to warning-only. It must not fail a bank that satisfies coverage.

### 3.6 Content regeneration scope

- **A2-05 … A2-08 and all future modules** — regenerate under the new rules before the gate ships. Not yet started, so no progress state to reconcile.
- **A2-01 … A2-04** — regenerate the banks. Completed or nearly so; regenerated exercise ids leave stale references in `UserVocabularyProgress.exerciseHistory`, which is append-only history and never read for correctness. See OQ-04 for the in-flight module.
- **A1-01 … A1-12 — untouched, and safe.** Their rung-2 coverage averages 38%, so a rung-2 phase could never complete there — but the ladder only governs modules not yet `completed`, and every A1 module is complete. Re-entering a completed module via "Keep practising" draws exercises with no phase to satisfy, so thin banks are inert rather than blocking.

A typical A2 module (~24 vocabulary items, ~2 grammar concepts) needs roughly **104 exercises** under the §3.5 targets, against ~64 today — about 1.6×. Much of that is redistribution toward rung 2 and grammar-linked exercises rather than net new volume.

### 3.7 App-side changes (`tome`)

The rung phase is the payoff of this structure and should be visible:

- The recap's coverage ring switches from module-wide vocabulary coverage to two concentric coverage circles: 
  1. **Rung Progress**: how many rungs out of total 3 rungs
  2. **Total word coverage in the module** (as before, no change)
- `POST .../complete` must now also return the current rung, and whether the session completed a rung. This closes the gap documented as *Missing* in `05-practice-session.md` §5.1 / OQ-6 — the current `step2Complete`-only response cannot drive the old→new ring sweep.

### 3.8 Measured starting position and expected cost

Across the 20 seeded modules (640 items, 1,329 exercises), share of items holding ≥1 exercise at each rung:

| Rung | Coverage today |
|---|---|
| 1 · recognition (`multiple_choice`, `sentence_reorder`) | 74% |
| 2 · cued production (`fill_blank`, `conjugation_drill`) | 40% |
| 3 · free production (`translation_active`, `error_correction`) | 61% |

No module clears all three rungs, which is why the content work gates the code (§6).

**Practice cost bound.** With ≥50% of each 20-exercise session reserved for items not yet covered at the current rung, a rung phase covers ≥10 new items per session, and in practice up to 20 early in a phase. For a 50-item module:

| | Sessions per rung | Total sessions | Total exercises |
|---|---|---|---|
| Best case (100% unseen draws) | 3 | ~9 | ~180 |
| Worst case (50% reservation floor) | 5 | ~15 | ~300 |
| Today's exposure gate | — | ~5 | ~100 |

Roughly 2–3×, bounded and computable from item count — no dependence on how well the user performs.

---

## 4. Data Models

### `UserModuleProgress` (F07)

`vocabularyItemsPracticed: string[]` is replaced by per-rung coverage plus the module's current rung.

| Field | Type | Description | Rules |
|---|---|---|---|
| `currentRung` | number | The rung the module is practising at | `1`–`3`; starts at 1; only ever increases |
| `rungCoverage` | `RungCoverage[]` | Per-rung covered-item sets | One entry per rung reached |
| `practiceCompletedAt` | `string \| null` | **Unchanged semantics, new trigger** — set once when rung 3 completes. Still the anchor `testUnlocksAt` derives from | Nullable; idempotent |

**`RungCoverage`** (sub-model)

| Field | Type | Description | Rules |
|---|---|---|---|
| `rung` | number | `1`–`3` | Required |
| `itemIds` | string[] | Items covered at this rung | Set-union semantics (`$addToSet`), as `vocabularyItemsPracticed` has today |
| `completedAt` | string \| null | When this rung was fully covered (ISO 8601) | Nullable |

Keeping one entry per rung rather than clearing a single array preserves the history and lets the recap render per-rung progress. `appendPracticedVocabulary` becomes a per-rung append; the existing `$addToSet` semantics carry over directly.

Note both vocabulary items and grammar concepts land in `itemIds` — the id spaces are disjoint (F06 relies on this already), so one array per rung suffices.

### `Exercise` (F04) — validation only

No schema change. The per-type constraint on *which* id may be set is relaxed for `fill_blank` and `translation_active` in `ExerciseValidation.ts`. The "exactly one of the two" invariant stands.

### Configuration

| Config | Current | New |
|---|---|---|
| `practiceSessionSize` | 20 | 20 — unchanged |
| `PRACTICE_MIN_UNSEEN_VOCAB_PERCENT` | 50 | 50 — unchanged, now scoped per rung |
| `testUnlockDelayHours` | 4 | 4 — unchanged |
| `PRACTICE_RUNG_TYPES` | — | New: the §3.1 rung → type map |
| `DEPRIORITIZE_MASTERY_THRESHOLD` | 0.85 | Removable — see §6 |

---

## 5. Key User Stories

| # | As a user, I want to… | So that… |
|---|---|---|
| US-01 | meet every word in the module first in recognition, then in cued production, then in free production | difficulty builds instead of arriving at random |
| US-02 | be required to produce every word from meaning alone before the test unlocks | I reach the test able to use the material, not just recognise it |
| US-03 | have grammar concepts drilled with the same rigour as vocabulary, at all three rungs | grammar isn't the weak link going into the test |
| US-04 | see which rung I'm on and how far through it I am | I understand why the exercises got harder and how much is left |
| US-05 | be told when I finish a rung, not only when I finish the whole module | the difficulty step-up is a moment, not a surprise |
| US-06 | know roughly how many practices a module will take | I can plan, and the module doesn't feel endless |
| US-07 | have a short final session when only a couple of items are left in a rung | I'm not doing 20 exercises to cover two words |

---

## 6. Constraints and Assumptions

- **Decision — rung phases are module-level and strictly sequential.** No per-item rung state. Every item is covered at rung 1 before any rung-2 exercise appears. A per-item ladder was designed and rejected — see §8.

- **Decision — coverage is exposure-based, and the practice gate does not measure recall.** An item is covered at a rung once served there; the session retry queue guarantees it ends answered correctly. The **module test's 80% pass threshold is the assessment**; practice's job is graduated, thorough repetition. Trying to make the practice gate also measure recall (by requiring first-attempt-correct advancement) was explored and rejected — it introduces stuck items and an unbounded practice count for no gain the test doesn't already provide.

- **Constraint — nothing can get stuck, and the practice count is bounded by construction.** Advancement depends only on exposure, so a struggling user takes the same number of practices as a strong one. The bound is derivable from item count alone (§3.8).

- **Constraint — a well-known item still gets three full passes.** The acknowledged cost of lockstep. F08's mastery weighting still orders items *within* a rung phase, but it cannot let a solid item skip a rung. At A1/A2 with a single user, repetition is close to the point.

- **Constraint — the content work gates the code.** The generation-skill changes and the A2 bank regeneration must land before the gate is enabled. Rung-2 coverage is 40% today; an item with no rung-2 exercise can never be covered there, so the phase never completes, so the test never unlocks. Ship the gate against current banks and A2-05…A2-08 **brick**. A1 is safe without regeneration (§3.6).

- **Constraint — exercise content is fixed once inserted** (F04). Within a rung, a repeat is the identical sentence, which is why coverage needs ≥1 per item per rung as a hard floor rather than relying on the pool being large.

- **Constraint — `DEPRIORITIZE_MASTERY_THRESHOLD` (0.85) never fires.** `MASTERY_INCREMENT = 0.12` compounds as `1 − 0.88ⁿ`, so mastery 0.8 requires 13 consecutive correct answers; three rung passes land an item at ~0.32. The threshold is dead code and can be removed, though nothing in this design depends on removing it.

- **Assumption — three graduated passes meaningfully improves retention** over one exposure. Grounded in general spaced-repetition and production-effect principles, not in Tome's own retention data. There is one user, so this will be judged subjectively.

- **Assumption — 2–3× practice cost per module is acceptable.** Explicitly accepted as the point of the change. With ~123 curriculum modules planned, worth revisiting once a few modules have been completed under the new structure.

---

## 7. Open Questions

| # | Question | Options / Notes |
|---|---|---|
| OQ-01 | The CEFR distribution table cannot coexist with per-item-per-rung coverage. Demote it, or change the content shape? | A compliant A2 bank lands at roughly `multiple_choice` 25%, `translation_active` 46%, `sentence_reorder` **2%**, `error_correction` **2%** — against table targets of 8–12% for the latter two. The table implicitly assumed a far higher grammar:vocab ratio than the actual ~2:24. Proposed: demote to advisory. Alternative: raise grammar concepts per module to 5–6, which fixes the ratio but changes the curriculum, not just the tooling. |
| OQ-02 | Should the rung phase boundary be visible as a hard stop, or just a labelled milestone? | §3.7 assumes a milestone screen the user passes through. A harder break ("Rung 1 complete — come back for production practice") would add spacing between rungs, closer to real spaced repetition, at the cost of blocking a user with momentum. |
| OQ-03 | Does the recap's per-rung ring need a module-wide progress figure alongside it? | Per-rung coverage resets to 0% at each rung transition, which will read as progress *lost* unless a module-wide figure (e.g. `covered / (3 × items)`) sits next to it. |
| OQ-04 | How is the in-progress A2 module handled when its bank is regenerated? | "Done A2 until module 04" is ambiguous — if A2-04 is mid-practice, its `vocabularyItemsPracticed` has no per-rung equivalent. Simplest for a single user: reset that module's practice progress and let it re-run from rung 1. Confirm which module is actually in flight. |
| OQ-05 | Does the tail top-up cap of `2 × uncoveredCount` (§3.4) produce sensible session lengths? | Picked by reasoning, not measurement. With two items left it yields ~4–6 exercises; the concern is whether that reads as a session at all, or should be merged into the previous one. |
| OQ-06 | Should rung 3 require ≥2 exercises per item as a hard floor rather than a target? | Hard floor at ≥2 raises an A2 module from ~104 to ~130 exercises. Matters mainly because the module test samples the same bank and free production is where variety is most valuable. |

---

## 8. Not Doing (and Why)

- **A per-item rung ladder** — each item carrying its own rung, advancing independently, so a solid item climbs in three exposures while a weak one is re-drilled where it's stuck. More efficient in principle and it composes with F08's mastery weighting, but it produces a degenerate tail (one item left at rung 2 means 20-exercise sessions to advance it once) and, combined with earned advancement, an unbounded practice count. Rejected in favour of a bounded, legible module-level phase.
- **First-attempt-correct advancement** — requiring a rung to be cleared by a correct answer *before* the answer is revealed, so the gate measures recall rather than exposure. Rejected: it makes items stuck-able and the practice count unbounded, and the module test already measures recall at 80%. Its only real argument was that exposure-based coverage lets the retry queue launder failure into progress — true, but that's acceptable when the gate's job is thoroughness.
- **Mercy caps, stuck-item allowances, terminal consolidation passes** — all machinery for bounding an earned-advancement ladder. Unnecessary once advancement is exposure-based.
- **Unifying the ladder with `masteryScore`** — a properly type-weighted mastery score would make a separate structure unnecessary. Rejected for v1: it means rewriting `SrsAlgorithm.ts` and redefining "mastered" globally, affecting F08, F21's weak-areas report, and every stored progress record. §9 keeps it as the long-term direction.
- **Generating rung-3 exercises on demand with AI** — unlimited prompt variety, but puts an AI call in the practice hot path against the bounded-cost rule in `idea.md` §3.4.3.
- **Regenerating A1 banks** — unnecessary, not just deprioritised: the ladder only governs incomplete modules and all A1 modules are complete (§3.6).
- **Elapsed-time spacing between rungs** — an earlier iteration required ~18h between production reps. Dropped: it forces multi-day module completion regardless of how well the user is doing. OQ-02 keeps a softer version alive.
- **Changing the module test or level test** — out of scope by decision. The test still samples the whole pool via unconstrained F08 selection, across all three rungs.
- **Lowering `PRACTICE_MIN_UNSEEN_VOCAB_PERCENT`** — an earlier iteration proposed 50% → 25%. Unnecessary: the reservation is what bounds each rung phase, and it now re-scopes per rung, so it stays useful for all three phases instead of going vacuous.

---

## 9. Ideas for Future Versions

- **Type-weighted mastery replacing the rung structure** — make `masteryScore` sensitive to exercise difficulty and recency so "mastered" genuinely means "produces it from meaning", then derive the practice gate from mastery. The honest end state; too large for v1.
- **Letting solid items skip a rung** — the per-item ladder rejected in §8, reintroduced narrowly: an item at high mastery could be exempted from rung 1 or 2. Recovers lockstep's main inefficiency without its tail problem, since the module-level phase still bounds everything.
- **Cross-module rung carry-over** — an item that reached rung 3 in one module could start a later module at rung 2, with decay so a long-untouched item drops back. Requires the decay F06 currently defers.
- **A fourth rung: spoken production** — the natural top of the ladder once audio input exists.
- **Spacing between rung phases** — the hard version of OQ-02, once there's evidence about whether it helps or just annoys.
- **Practice-count estimate in the UI** — "this module takes about 12 practices", derivable from item count since the bound doesn't depend on performance.
