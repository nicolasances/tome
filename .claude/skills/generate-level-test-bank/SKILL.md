---
name: generate-level-test-bank
description: Generates and validates a Tome Language Learning Level Test Bank — a CEFR level's ~60 cross-module exercises drawn from the vocabulary and grammar of all its modules. Does not post it — use the post-level-test-bank skill for that.
---

# Generate Level Test Bank

## Overview

A **Level Test Bank** is one exercise bank per CEFR level (~60 exercises) used by the Level
Test to assess the full breadth of that level. Unlike a module bank, it is **purpose-built
for cross-module breadth**: a single exercise may combine vocabulary from different modules
or test a grammar concept across themes (idea.md §3.5; backend feature F20). Every level-test
exercise carries **`moduleId = null`** and references an **existing** vocabulary item or
grammar concept that was already generated for one of the level's modules — **no new
vocabulary or grammar is created here.**

This skill produces two things, in order: the **level pool** (consolidated ids) and the
**exercise bank**. It does **not** post the bank — once it is generated and validated, use
the **`post-level-test-bank`** skill to seed it to dev or prod.

## When to Use

- The user requests the creation of the Level Test Bank for a **given CEFR level**.
- The user requests changes/regeneration of a level's test bank.

**Trigger Phrases:**
- "Generate the level test bank for A2"
- "Generate the A1 level test"
- "Create the level test bank for B1"

> Posting is a separate step. If the user asks to *post/seed* a level test bank, use the
> **`post-level-test-bank`** skill instead. If they ask to "generate and post", run this skill
> first, then hand off to `post-level-test-bank`.

## Prerequisites

- You have read `docs/idea/language-learning/idea.md` — **§3.5 (Level Tests / Level Test
  Bank)** and **§3.4.3 (Exercise Generation Strategy)** are the binding context.
- You have read `docs/idea/language-learning/data-model.md` — the generated exercises MUST
  match the `Exercise` schema; the bank maps to `LevelTestBank`.
- You have read `docs/idea/language-learning/default-modules.md` — to know which modules
  belong to the level.
- You have read the **sibling skill's** generation reference (shared, single source of truth):
  - `.claude/skills/generate-module-content/rules-for-generation.md` — **the binding
    per-type quality rules and the CEFR-level distribution table.** It explicitly applies
    to level test banks. **Read before Phase 2.**
  - `.claude/skills/generate-module-content/module-examples.md` — style/tone/sizing
    reference for every exercise type at every level.
- You **MUST** have been told the target **CEFR level** (e.g. `A2`).
- The level's modules must already be generated under the content folder. **Ask the user
  for the content folder path** (default: `content`). This is `<content-folder>` going forward.

**Scripts bundled with this skill:**
- `gather_level_pool.py` — Phase 1. Consolidates the level's vocab + grammar into a pool file.
- `validate_level_coverage.py` — Phase 3 gate 1. References-valid + full grammar coverage.
- Reused from the sibling skill: `.claude/skills/generate-module-content/validate_distribution.py`
  — Phase 3 gate 2 (distribution), invoked as-is.

Posting is **not** part of this skill — the `post-level-test-bank` skill owns
`post_level_test_bank.py`.

## How this differs from `generate-module-content`

| | Module bank | **Level test bank (this skill)** |
|---|---|---|
| `moduleId` | the module's id | **`null`** on every exercise |
| Vocab/grammar ids | minted here (`generate_ids.py`) | **referenced from existing module files — never minted** |
| Coverage gate | ≥1 exercise per vocab item (exhaustive) | **breadth sample**: full grammar coverage, vocab sampled across modules |
| Scope of an exercise | one module's theme | **cross-module** — mixes vocab/grammar across modules |
| Size | emerges from coverage (~50) | **~60** |

The per-type quality rules and the distribution table are **identical** and come from the
shared `rules-for-generation.md`.

## The Workflow

```
GATHER LEVEL POOL  >  GENERATE CROSS-MODULE EXERCISES  >  VALIDATION QA
```

Each phase ends with a self-validation step. Do not advance until it passes.

---

### Phase 1 — Gather the level pool

Run:
```bash
python3 .claude/skills/generate-level-test-bank/gather_level_pool.py <level> <content-folder>
```

This scans `<content-folder>/<level>-NN/` for every module's `*-vocabulary.json` and
`*-grammar.json`, deduplicates grammar concepts by `name`, and writes the consolidated pool to
`<content-folder>/level-tests/<level>/<level>-level-test-pool.json`. It prints how many
modules/vocab/grammar were found and **which curriculum modules are missing locally**.

**Self-validation:**
- The script exited 0 and wrote the pool file.
- Surface to the user: modules found, vocab count, distinct grammar concepts, and any
  missing curriculum modules. If modules are missing, tell the user the bank will cover only
  the present modules — offer to proceed or to generate the missing modules first.

---

### Phase 2 — Generate cross-module exercises

Read the pool file from Phase 1. Generate **~60 exercises** following **every rule** in
`.claude/skills/generate-module-content/rules-for-generation.md`, using `module-examples.md`
for style. Rules specific to the level test bank:

- **`moduleId` is `null`** on every exercise.
- **Every `vocabularyItemId` / `grammarConceptId` must be an id from the pool file.** Never
  invent an id — the API does **not** validate references, so a wrong id silently breaks the
  test. Copy ids verbatim.
- The type → link rule is unchanged (`multiple_choice` / `fill_blank` / `conjugation_drill` /
  `translation_active` → `vocabularyItemId`; `sentence_reorder` / `error_correction` →
  `grammarConceptId`).
- **Cross-module breadth:** deliberately combine vocabulary from *different* modules within a
  sentence, and exercise grammar concepts across themes. Avoid a bank that is just a
  concatenation of single-module exercises.
- **Coverage:** every **distinct grammar concept** at the level must have **≥1** exercise.
  Sample vocabulary **broadly** so every module is represented — but there is **no** per-item
  requirement (a 60-exercise bank cannot cover hundreds of items).
- **Distribution:** land within the CEFR-level targets in `rules-for-generation.md` for `<level>`.
- For `grammarConceptId`, use the pool entry's `representativeId` for that concept name.

**Expected file:** `<content-folder>/level-tests/<level>/<level>-level-test-exercises.json`
— a plain JSON array of exercise objects (same shape as module exercises, with `moduleId: null`).

**Self-validation before advancing:**
- ~60 exercises; every `moduleId` is `null`.
- Exactly one of `vocabularyItemId` / `grammarConceptId` set per exercise, per the type→link table.
- Every referenced id exists in the pool file.
- `timesShown` is `0` everywhere; `translation_active` alternatives, `sentence_reorder`
  `words`, etc. follow the same per-type specs as the module skill.
- Exercises visibly span multiple modules.

---

### Phase 3 — Validation QA

Two hard gates. **Do not declare the bank complete until both exit 0.**

#### Gate 1 — Coverage & references (MUST)

```bash
python3 .claude/skills/generate-level-test-bank/validate_level_coverage.py \
  <level> <content-folder>/level-tests/<level>/<level>-level-test-exercises.json <content-folder>
```

| Result | Meaning | Action |
|---|---|---|
| `PASS` | References valid, every grammar concept covered, every module represented | Done |
| `PASS (with breadth warnings)` | Valid + grammar covered, but some module contributes no exercise | Acceptable; add exercises for the listed modules if practical |
| `FAIL` | Dangling id reference, an uncovered grammar concept, or a non-null `moduleId` | **MUST fix**, then rerun until exit 0 |

#### Gate 2 — Distribution (reused)

```bash
python3 .claude/skills/generate-module-content/validate_distribution.py \
  <level> <level> <content-folder>/level-tests/<level>/<level>-level-test-exercises.json
```

(First arg is just a label — pass the level. The vocabulary-file MC exemption is correctly
disabled for a sample-based bank.) Fix any `FAIL` per the script's "Required corrections"
block and rerun until exit 0.

**Surface to the user:** one line per gate, e.g.
`Coverage: PASS (62 exercises, 5/5 grammar concepts, 5/5 modules)` and
`Distribution: PASS`.

---

### Done — handing off to posting

Once both Phase 3 gates exit 0, the bank is complete. **This skill stops here — it does not
post.** Tell the user the bank is generated and validated, and that posting is done with the
**`post-level-test-bank`** skill (e.g. "Post the `<level>` level test bank to dev"). If the
user originally asked to "generate and post", invoke that skill now.

---

## Red Flags

- Starting without the target CEFR level or the content folder path.
- Generating exercises before running `gather_level_pool.py`.
- **Inventing a vocab/grammar id** not present in the pool file (the API will not catch it).
- Any exercise with a non-null `moduleId`.
- A bank with no cross-module exercises (just single-module exercises stitched together).
- Leaving any grammar concept at the level uncovered.
- Declaring the bank complete while either Phase 3 gate FAILs.
- Posting the bank from this skill — posting belongs to `post-level-test-bank`.
