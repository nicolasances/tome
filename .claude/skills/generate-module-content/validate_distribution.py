#!/usr/bin/env python3
"""
Validates the exercise bank distribution against CEFR-level targets.

Usage:
    python3 validate_distribution.py <module_id> <cefr_level> <exercises_file>

Arguments:
    module_id       Module code, e.g. A1-01
    cefr_level      One of: A1, A2, B1, B2, C1, C2
    exercises_file  Path to the module's *-exercises.json file

The vocabulary file is auto-detected as the sibling *-vocabulary.json. If found,
it enables coverage-exemption detection for multiple_choice.

Exit codes:
    0   All checks PASS, or only WARN (coverage-exemption) violations
    1   One or more FAIL violations
"""

import json
import os
import sys
from collections import Counter, defaultdict

# (min%, max%) per exercise type per CEFR level.
# min=0 means no lower bound (ceiling only); max=100 means no upper bound (floor only).
TARGETS: dict[str, dict[str, tuple[int, int]]] = {
    "A1": {
        "multiple_choice":    (0,   45),
        "fill_blank":         (10,  15),
        "sentence_reorder":   (8,   12),
        "conjugation_drill":  (8,   12),
        "error_correction":   (5,   10),
        "translation_active": (10, 100),
    },
    "A2": {
        "multiple_choice":    (0,   35),
        "fill_blank":         (12,  18),
        "sentence_reorder":   (8,   12),
        "conjugation_drill":  (8,   12),
        "error_correction":   (8,   12),
        "translation_active": (15, 100),
    },
    "B1": {
        "multiple_choice":    (0,   25),
        "fill_blank":         (15,  20),
        "sentence_reorder":   (10,  15),
        "conjugation_drill":  (10,  15),
        "error_correction":   (10,  15),
        "translation_active": (20, 100),
    },
    "B2": {
        "multiple_choice":    (0,   20),
        "fill_blank":         (15,  20),
        "sentence_reorder":   (10,  15),
        "conjugation_drill":  (8,   12),
        "error_correction":   (12,  18),
        "translation_active": (25, 100),
    },
    "C1": {
        "multiple_choice":    (0,   15),
        "fill_blank":         (15,  20),
        "sentence_reorder":   (10,  15),
        "conjugation_drill":  (5,   10),
        "error_correction":   (15,  20),
        "translation_active": (30, 100),
    },
    "C2": {
        "multiple_choice":    (0,   10),
        "fill_blank":         (15,  20),
        "sentence_reorder":   (10,  15),
        "conjugation_drill":  (5,    8),
        "error_correction":   (15,  20),
        "translation_active": (35, 100),
    },
}

ALL_TYPES = [
    "multiple_choice",
    "fill_blank",
    "sentence_reorder",
    "conjugation_drill",
    "error_correction",
    "translation_active",
]


def target_str(lo: int, hi: int) -> str:
    if lo == 0:
        return f"≤ {hi}%"
    if hi == 100:
        return f"≥ {lo}%"
    return f"{lo}–{hi}%"


def load_vocab_ids(exercises_file: str) -> set[str] | None:
    vocab_file = exercises_file.replace("-exercises.json", "-vocabulary.json")
    if not os.path.exists(vocab_file):
        return None
    with open(vocab_file, encoding="utf-8") as f:
        items = json.load(f)
    return {item["id"] for item in items}


def count_coverage_forced_mc(exercises: list[dict], all_vocab_ids: set[str]) -> int:
    """
    Count vocab items whose only exercise in the bank is multiple_choice.
    Each such item contributes exactly 1 to the forced-MC count — the minimum
    needed to satisfy the coverage requirement.
    """
    coverage: dict[str, set[str]] = defaultdict(set)
    for ex in exercises:
        vid = ex.get("vocabularyItemId")
        if vid:
            coverage[vid].add(ex["type"])

    return sum(
        1 for vid in all_vocab_ids
        if coverage.get(vid, set()) == {"multiple_choice"}
    )


def main() -> None:
    if len(sys.argv) != 4:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    module_id, cefr_level, exercises_file = sys.argv[1], sys.argv[2], sys.argv[3]

    if cefr_level not in TARGETS:
        print(f"Error: unknown CEFR level '{cefr_level}'. Must be one of: {', '.join(TARGETS)}", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(exercises_file):
        print(f"Error: file not found: {exercises_file}", file=sys.stderr)
        sys.exit(1)

    with open(exercises_file, encoding="utf-8") as f:
        exercises = json.load(f)

    total = len(exercises)
    if total == 0:
        print("Error: exercises file is empty.", file=sys.stderr)
        sys.exit(1)

    counts = Counter(ex["type"] for ex in exercises)
    targets = TARGETS[cefr_level]
    all_vocab_ids = load_vocab_ids(exercises_file)
    coverage_forced_mc = count_coverage_forced_mc(exercises, all_vocab_ids) if all_vocab_ids is not None else 0

    # ── Header ──────────────────────────────────────────────────────────────
    print(f"\nExercise Bank Distribution — {module_id} ({cefr_level})")
    print(f"Total exercises: {total}")
    if all_vocab_ids is None:
        print("Note: vocabulary file not found — coverage-exemption detection disabled.")
    else:
        print(f"Coverage-forced MC: {coverage_forced_mc} (vocab items with no non-MC exercise)")
    print()

    header = f"{'Type':<22} {'Count':>6}  {'%':>6}  {'Target':<10}  Status"
    print(header)
    print("─" * 70)

    # ── Per-type evaluation ──────────────────────────────────────────────────
    has_fail = False
    rows: list[tuple[str, int, float, str, str]] = []

    for t in ALL_TYPES:
        count = counts.get(t, 0)
        pct = (count / total) * 100
        lo, hi = targets[t]
        tgt = target_str(lo, hi)

        if lo <= pct <= hi:
            status = "PASS"
        elif t == "multiple_choice" and pct > hi and all_vocab_ids is not None:
            adjustable_pct = ((count - coverage_forced_mc) / total) * 100
            if adjustable_pct <= hi:
                status = (
                    f"WARN  (coverage exemption: {coverage_forced_mc} forced; "
                    f"adjustable = {adjustable_pct:.1f}%)"
                )
            else:
                status = "FAIL"
                has_fail = True
        else:
            status = "FAIL"
            has_fail = True

        rows.append((t, count, pct, tgt, status))

    for t, count, pct, tgt, status in rows:
        print(f"{t:<22} {count:>6}  {pct:>5.1f}%  {tgt:<10}  {status}")

    # ── Summary & corrections ────────────────────────────────────────────────
    print()
    fails = [(t, count, pct, tgt) for t, count, pct, tgt, status in rows if status == "FAIL"]
    warns = [(t, count, pct, tgt, status) for t, count, pct, tgt, status in rows if status.startswith("WARN")]

    if not fails and not warns:
        print("Result: PASS — all checks within target ranges.")
    elif not fails:
        print(f"Result: PASS with {len(warns)} coverage-exemption warning(s). No corrections required.")
        for t, _, pct, tgt, status in warns:
            print(f"  ! {t}: {pct:.1f}% (target {tgt}) — {status}")
    else:
        print(f"Result: FAIL — {len(fails)} check(s) failed, {len(warns)} warning(s).")
        print("\nRequired corrections:")
        for t, count, pct, tgt in fails:
            lo, hi = targets[t]
            if pct > hi:
                n = round((pct - hi) / 100 * total) + 1
                print(f"  ✗ {t}: {pct:.1f}% (target {tgt}) — replace ~{n} with other types")
            else:
                n = round((lo - pct) / 100 * total) + 1
                print(f"  ✗ {t}: {pct:.1f}% (target {tgt}) — add ~{n} more exercises of this type")
        if warns:
            print("\nWarnings (no action required):")
            for t, _, pct, tgt, status in warns:
                print(f"  ! {t}: {pct:.1f}% (target {tgt}) — {status}")

    sys.exit(1 if has_fail else 0)


if __name__ == "__main__":
    main()
