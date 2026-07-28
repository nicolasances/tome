#!/usr/bin/env python3
"""
Validates that the exercise bank covers every vocabulary item and grammar concept.

This enforces two independent coverage gates for module generation:

1. Baseline (scaffolding) coverage — the MUST requirement is: **every vocabulary
   item and every grammar concept has at least one exercise of any type**
   (idea.md §3.1.3). The target is two exercises per vocabulary item. Below-target
   vocab items only WARN by default (promote to FAIL with --strict).

2. Production coverage — the practice-completion gate (see the spaced-production
   practice gate proposal) counts only correct answers on `translation_active`
   exercises. A vocab item or grammar concept can pass check #1 above yet still
   never let a user complete practice, if it has zero/insufficient `translation_active`
   coverage. This is why production coverage is checked independently: **every
   vocabulary item and every grammar concept must have at least --production-target
   `translation_active` exercises** (default: 2). This check is always a hard FAIL
   — it is not gated behind --strict.

Usage:
    python3 validate_coverage.py <module_id> <exercises_file> [--strict] [--target N] [--production-target N]

Arguments:
    module_id       Module code, e.g. A1-01
    exercises_file  Path to the module's *-exercises.json file

Options:
    --strict              Promote the per-vocab-item any-type target from a WARN to a
                          hard FAIL, i.e. require every vocab item to have >= target
                          exercises of any type. Does not affect the production-coverage
                          check, which is always a hard FAIL regardless of this flag.
    --target N            Desired exercises of any type per vocabulary item (default: 2).
    --production-target N Desired `translation_active` exercises per vocabulary item AND
                          per grammar concept (default: 2). Always a hard FAIL if unmet.

The vocabulary file is auto-detected as the sibling *-vocabulary.json and the grammar
file as the sibling *-grammar.json. Both are required — coverage cannot be checked
without the full list of items that must be covered.

Exit codes:
    0   Every vocab item and grammar concept has >= 1 exercise of any type (>= target in
        --strict), AND every vocab item and grammar concept has >= production-target
        `translation_active` exercises. Below-target (any-type) vocab items only WARN
        unless --strict.
    1   One or more vocab items or grammar concepts are uncovered (hard MUST violated),
        a referenced id does not exist, --strict and a vocab item is below the any-type
        target, or any vocab item/grammar concept is below the production-coverage target.
"""

import argparse
import json
import os
import sys
from collections import Counter


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


def main() -> None:
    parser = argparse.ArgumentParser(add_help=True, description="Exercise bank coverage gate.")
    parser.add_argument("module_id")
    parser.add_argument("exercises_file")
    parser.add_argument("--strict", action="store_true",
                        help="require every vocab item to reach the target, not just 1")
    parser.add_argument("--target", type=int, default=2,
                        help="desired exercises per vocabulary item (default: 2)")
    parser.add_argument("--production-target", type=int, default=2,
                        help="desired translation_active exercises per vocabulary item "
                             "and per grammar concept (default: 2); always a hard FAIL if unmet")
    args = parser.parse_args()

    module_id = args.module_id
    exercises_file = args.exercises_file
    target = args.target
    production_target = args.production_target

    vocab_file = exercises_file.replace("-exercises.json", "-vocabulary.json")
    grammar_file = exercises_file.replace("-exercises.json", "-grammar.json")

    exercises = load_json_array(exercises_file, "exercises")
    vocab_items = load_json_array(vocab_file, "vocabulary")
    grammar_concepts = load_json_array(grammar_file, "grammar")

    vocab_ids = {item["id"] for item in vocab_items}
    grammar_ids = {item["id"] for item in grammar_concepts}

    # Count how many exercises reference each vocab item / grammar concept.
    vocab_counts: Counter[str] = Counter()
    grammar_counts: Counter[str] = Counter()
    # Same, but restricted to translation_active exercises only — this is what the
    # practice-completion production gate actually consumes.
    vocab_production_counts: Counter[str] = Counter()
    grammar_production_counts: Counter[str] = Counter()
    dangling_vocab: set[str] = set()
    dangling_grammar: set[str] = set()

    for ex in exercises:
        vid = ex.get("vocabularyItemId")
        gid = ex.get("grammarConceptId")
        is_production = ex.get("type") == "translation_active"
        if vid:
            vocab_counts[vid] += 1
            if is_production:
                vocab_production_counts[vid] += 1
            if vid not in vocab_ids:
                dangling_vocab.add(vid)
        if gid:
            grammar_counts[gid] += 1
            if is_production:
                grammar_production_counts[gid] += 1
            if gid not in grammar_ids:
                dangling_grammar.add(gid)

    # Per-item coverage buckets.
    uncovered_vocab = sorted(vid for vid in vocab_ids if vocab_counts.get(vid, 0) == 0)
    below_target_vocab = sorted(
        (vid for vid in vocab_ids if 0 < vocab_counts.get(vid, 0) < target),
        key=lambda v: (vocab_counts[v], v),
    )
    uncovered_grammar = sorted(gid for gid in grammar_ids if grammar_counts.get(gid, 0) == 0)

    # Production-coverage buckets (translation_active only, always a hard gate).
    below_production_vocab = sorted(
        (vid for vid in vocab_ids if vocab_production_counts.get(vid, 0) < production_target),
        key=lambda v: (vocab_production_counts[v], v),
    )
    below_production_grammar = sorted(
        (gid for gid in grammar_ids if grammar_production_counts.get(gid, 0) < production_target),
        key=lambda g: (grammar_production_counts[g], g),
    )

    # ── Header ──────────────────────────────────────────────────────────────
    print(f"\nExercise Bank Coverage — {module_id}")
    print(f"Total exercises: {len(exercises)}")
    print(f"Vocabulary items: {len(vocab_ids)}  |  Grammar concepts: {len(grammar_ids)}")
    print(f"Target exercises per vocab item: {target}{'  (strict: enforced as hard FAIL)' if args.strict else ''}")
    print(f"Production target (translation_active) per vocab item and grammar concept: {production_target} (always enforced as hard FAIL)")
    print()

    covered_at_target = sum(1 for vid in vocab_ids if vocab_counts.get(vid, 0) >= target)
    covered_min = sum(1 for vid in vocab_ids if vocab_counts.get(vid, 0) >= 1)
    print(f"Vocab items with >= 1 exercise:        {covered_min}/{len(vocab_ids)}")
    print(f"Vocab items with >= {target} exercises (target): {covered_at_target}/{len(vocab_ids)}")
    print(f"Grammar concepts with >= 1 exercise:   {len(grammar_ids) - len(uncovered_grammar)}/{len(grammar_ids)}")
    covered_production_vocab = len(vocab_ids) - len(below_production_vocab)
    covered_production_grammar = len(grammar_ids) - len(below_production_grammar)
    print(f"Vocab items with >= {production_target} translation_active exercises:    {covered_production_vocab}/{len(vocab_ids)}")
    print(f"Grammar concepts with >= {production_target} translation_active exercises: {covered_production_grammar}/{len(grammar_ids)}")
    print()

    has_fail = False

    # ── Hard MUST: every vocab item covered ──────────────────────────────────
    if uncovered_vocab:
        has_fail = True
        print(f"✗ FAIL — {len(uncovered_vocab)} vocabulary item(s) have NO exercise (hard requirement):")
        for vid in uncovered_vocab:
            print(f"    - {vid}")
        print()

    # ── Hard MUST: every grammar concept covered ─────────────────────────────
    if uncovered_grammar:
        has_fail = True
        print(f"✗ FAIL — {len(uncovered_grammar)} grammar concept(s) have NO exercise (hard requirement):")
        for gid in uncovered_grammar:
            print(f"    - {gid}")
        print()

    # ── Dangling references ──────────────────────────────────────────────────
    if dangling_vocab or dangling_grammar:
        has_fail = True
        print("✗ FAIL — exercises reference ids that do not exist in the Phase 1/2 files:")
        for vid in sorted(dangling_vocab):
            print(f"    - vocabularyItemId {vid}")
        for gid in sorted(dangling_grammar):
            print(f"    - grammarConceptId {gid}")
        print()

    # ── Target: 2 exercises per vocab item ───────────────────────────────────
    if below_target_vocab:
        label = "FAIL" if args.strict else "WARN"
        if args.strict:
            has_fail = True
        print(f"{'✗' if args.strict else '!'} {label} — {len(below_target_vocab)} vocab item(s) below the target of {target} (currently 1):")
        for vid in below_target_vocab:
            print(f"    - {vid} ({vocab_counts[vid]} exercise)")
        print()

    # ── Production Coverage (translation_active) ─────────────────────────────
    # Independent of the any-type checks above. Always a hard FAIL: the
    # practice-completion gate counts only translation_active reps, so a vocab
    # item or grammar concept below this target can never satisfy it, no
    # matter how well it scores on the any-type checks.
    if below_production_vocab or below_production_grammar:
        has_fail = True
        print(f"✗ FAIL — Production Coverage (translation_active) — target: {production_target} per item:")
        if below_production_vocab:
            print(f"  {len(below_production_vocab)} vocabulary item(s) below the translation_active target:")
            for vid in below_production_vocab:
                print(f"    - {vid} ({vocab_production_counts.get(vid, 0)} translation_active exercise(s))")
        if below_production_grammar:
            print(f"  {len(below_production_grammar)} grammar concept(s) below the translation_active target:")
            for gid in below_production_grammar:
                print(f"    - {gid} ({grammar_production_counts.get(gid, 0)} translation_active exercise(s))")
        print()
    else:
        print(f"✓ Production Coverage (translation_active) — every vocab item and grammar concept has >= {production_target}.")
        print()

    # ── Summary ──────────────────────────────────────────────────────────────
    if has_fail:
        print("Result: FAIL — coverage requirement not met.")
        print("\nRequired corrections:")
        if uncovered_vocab:
            print(f"  ✗ Add at least one exercise for each of the {len(uncovered_vocab)} uncovered vocab item(s) above.")
        if uncovered_grammar:
            print(f"  ✗ Add at least one exercise for each of the {len(uncovered_grammar)} uncovered grammar concept(s) above.")
        if dangling_vocab or dangling_grammar:
            print("  ✗ Fix or remove exercises that reference non-existent ids.")
        if args.strict and below_target_vocab:
            print(f"  ✗ Bring every below-target vocab item up to {target} exercises.")
        if below_production_vocab:
            print(f"  ✗ Add translation_active exercises for each of the {len(below_production_vocab)} vocab item(s) below the production target of {production_target}.")
        if below_production_grammar:
            print(f"  ✗ Add translation_active exercises for each of the {len(below_production_grammar)} grammar concept(s) below the production target of {production_target}.")
        print("\nRe-run this script after editing the exercises file. Repeat until exit 0.")
        sys.exit(1)

    if below_target_vocab:
        print(f"Result: PASS — every vocab item and grammar concept has >= 1 exercise.")
        print(f"        {len(below_target_vocab)} item(s) are below the target of {target}; "
              f"add a second exercise for them where the type distribution allows.")
    else:
        print("Result: PASS — full coverage; every vocab item meets the target.")
    sys.exit(0)


if __name__ == "__main__":
    main()
