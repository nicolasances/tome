#!/usr/bin/env python3
"""
Validates that the exercise bank covers every vocabulary item and grammar concept
at every rung of the practice ladder (issue #321).

Module practice runs as three sequential rung phases of increasing difficulty. A rung's
exercise types are fixed by `RUNG_TYPES` below — an item with no exercise at a rung can
never be covered there, so that rung phase can never complete for the module. The MUST
requirement is therefore **per rung**, not per bank:

    Rung 1 (recognition)      >= 1 exercise per item  (hard floor)
    Rung 2 (cued production)  >= 1 exercise per item  (hard floor)
    Rung 3 (free production)  >= 2 exercises per item (hard floor)

The rung-3 floor is 2, not 1: exercise content is fixed once inserted, so within a rung a
repeat is the identical sentence, and the module test samples this same bank. A single
rung-3 exercise would force the test to reuse the exact sentence the user drilled.

Usage:
    python3 validate_coverage.py <module_id> <exercises_file>

Arguments:
    module_id       Module code, e.g. A1-01
    exercises_file  Path to the module's *-exercises.json file

The vocabulary file is auto-detected as the sibling *-vocabulary.json and the grammar
file as the sibling *-grammar.json. Both are required — coverage cannot be checked
without the full list of items that must be covered.

Exit codes:
    0   Every vocab item and grammar concept meets the hard floor at every rung
        (>= 1 at rungs 1-2, >= 2 at rung 3). The floor equals the target at every
        rung, so meeting it is sufficient.
    1   One or more items are below the hard floor at some rung, or an exercise
        references a non-existent id.
"""

from __future__ import annotations

import json
import os
import sys
from collections import Counter

RUNG_1 = 1
RUNG_2 = 2
RUNG_3 = 3

# Rung derived from exercise type — mirrors the backend's util/PracticeRungs.ts.
# Not stored on the exercise; always derived from `type`.
TYPE_RUNG: dict[str, int] = {
    "multiple_choice":    RUNG_1,
    "sentence_reorder":   RUNG_1,
    "fill_blank":         RUNG_2,
    "conjugation_drill":  RUNG_2,
    "translation_active": RUNG_3,
    "error_correction":   RUNG_3,
}

RUNG_NAMES: dict[int, str] = {
    RUNG_1: "1 · recognition",
    RUNG_2: "2 · cued production",
    RUNG_3: "3 · free production",
}

# Hard floor per rung — every item must reach at least this many exercises at that rung.
RUNG_FLOOR: dict[int, int] = {RUNG_1: 1, RUNG_2: 1, RUNG_3: 2}


def load_json_array(path: str, label: str) -> list[dict]:
    if not os.path.exists(path):
        print(f"Error: {label} file not found: {path}", file=sys.stderr)
        sys.exit(1)
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: {label} file is not valid JSON: {e}", file=sys.stderr)
        sys.exit(1)
    if not isinstance(data, list):
        print(f"Error: {label} file must be a JSON array, got {type(data).__name__}", file=sys.stderr)
        sys.exit(1)

    return data


def item_id_of(ex: dict) -> str | None:
    """The single item id an exercise is linked to — whichever of the two fields is set."""
    return ex.get("vocabularyItemId") or ex.get("grammarConceptId")


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    module_id, exercises_file = sys.argv[1], sys.argv[2]

    vocab_file = exercises_file.replace("-exercises.json", "-vocabulary.json")
    grammar_file = exercises_file.replace("-exercises.json", "-grammar.json")

    exercises = load_json_array(exercises_file, "exercises")
    vocab_items = load_json_array(vocab_file, "vocabulary")
    grammar_concepts = load_json_array(grammar_file, "grammar")

    vocab_ids = {item["id"] for item in vocab_items}
    grammar_ids = {item["id"] for item in grammar_concepts}
    all_item_ids = vocab_ids | grammar_ids

    # Per-rung counts, per item.
    rung_counts: dict[int, Counter[str]] = {RUNG_1: Counter(), RUNG_2: Counter(), RUNG_3: Counter()}
    dangling_ids: set[str] = set()
    unknown_type_exercises: list[str] = []

    for ex in exercises:
        ex_type = ex.get("type")
        rung = TYPE_RUNG.get(ex_type)
        if rung is None:
            unknown_type_exercises.append(str(ex_type))
            continue

        iid = item_id_of(ex)
        if iid is None:
            continue
        if iid not in all_item_ids:
            dangling_ids.add(iid)
            continue

        rung_counts[rung][iid] += 1

    # ── Header ──────────────────────────────────────────────────────────────
    print(f"\nExercise Bank Coverage (per rung) — {module_id}")
    print(f"Total exercises: {len(exercises)}")
    print(f"Vocabulary items: {len(vocab_ids)}  |  Grammar concepts: {len(grammar_ids)}")
    print()

    has_fail = False

    for rung in (RUNG_1, RUNG_2, RUNG_3):
        floor = RUNG_FLOOR[rung]
        counts = rung_counts[rung]
        below_floor = sorted(iid for iid in all_item_ids if counts.get(iid, 0) < floor)

        covered = len(all_item_ids) - len(below_floor)
        print(f"Rung {RUNG_NAMES[rung]} (floor >= {floor}): {covered}/{len(all_item_ids)} items covered")

        if below_floor:
            has_fail = True
            print(f"  ✗ FAIL — {len(below_floor)} item(s) below the rung-{rung} floor:")
            for iid in below_floor:
                print(f"      - {iid} ({counts.get(iid, 0)} exercise(s), needs >= {floor})")

    print()

    # ── Dangling references ──────────────────────────────────────────────────
    if dangling_ids:
        has_fail = True
        print("✗ FAIL — exercises reference ids that do not exist in the Phase 1/2 files:")
        for iid in sorted(dangling_ids):
            print(f"    - {iid}")
        print()

    # ── Unknown exercise types ─────────────────────────────────────────────────
    if unknown_type_exercises:
        has_fail = True
        print("✗ FAIL — exercises with an unrecognised `type` (cannot derive a rung):")
        for t in sorted(set(unknown_type_exercises)):
            print(f"    - {t}")
        print()

    # ── Summary ──────────────────────────────────────────────────────────────
    if has_fail:
        print("Result: FAIL — per-rung coverage requirement not met.")
        print("\nRe-run this script after editing the exercises file. Repeat until exit 0.")
        sys.exit(1)

    print("Result: PASS — every vocab item and grammar concept meets the hard floor at all three rungs.")
    sys.exit(0)


if __name__ == "__main__":
    main()
