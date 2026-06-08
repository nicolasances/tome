#!/usr/bin/env python3
"""
Validates that the exercise bank covers every vocabulary item and grammar concept.

This is the hard coverage gate for module generation. The MUST requirement is:
**every vocabulary item has at least one exercise** (idea.md §3.1.3). The target is
**two exercises per vocabulary item**. Grammar concepts must also have at least one
exercise each.

Usage:
    python3 validate_coverage.py <module_id> <exercises_file> [--strict] [--target N]

Arguments:
    module_id       Module code, e.g. A1-01
    exercises_file  Path to the module's *-exercises.json file

Options:
    --strict        Promote the per-vocab-item target from a WARN to a hard FAIL,
                    i.e. require every vocab item to have >= target exercises.
    --target N      Desired exercises per vocabulary item (default: 2).

The vocabulary file is auto-detected as the sibling *-vocabulary.json and the grammar
file as the sibling *-grammar.json. Both are required — coverage cannot be checked
without the full list of items that must be covered.

Exit codes:
    0   Every vocab item has >= 1 exercise (>= target in --strict) AND every grammar
        concept has >= 1 exercise. Below-target vocab items only WARN (unless --strict).
    1   One or more vocab items or grammar concepts are uncovered (hard MUST violated),
        a referenced id does not exist, or --strict and a vocab item is below target.
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
    args = parser.parse_args()

    module_id = args.module_id
    exercises_file = args.exercises_file
    target = args.target

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
    dangling_vocab: set[str] = set()
    dangling_grammar: set[str] = set()

    for ex in exercises:
        vid = ex.get("vocabularyItemId")
        gid = ex.get("grammarConceptId")
        if vid:
            vocab_counts[vid] += 1
            if vid not in vocab_ids:
                dangling_vocab.add(vid)
        if gid:
            grammar_counts[gid] += 1
            if gid not in grammar_ids:
                dangling_grammar.add(gid)

    # Per-item coverage buckets.
    uncovered_vocab = sorted(vid for vid in vocab_ids if vocab_counts.get(vid, 0) == 0)
    below_target_vocab = sorted(
        (vid for vid in vocab_ids if 0 < vocab_counts.get(vid, 0) < target),
        key=lambda v: (vocab_counts[v], v),
    )
    uncovered_grammar = sorted(gid for gid in grammar_ids if grammar_counts.get(gid, 0) == 0)

    # ── Header ──────────────────────────────────────────────────────────────
    print(f"\nExercise Bank Coverage — {module_id}")
    print(f"Total exercises: {len(exercises)}")
    print(f"Vocabulary items: {len(vocab_ids)}  |  Grammar concepts: {len(grammar_ids)}")
    print(f"Target exercises per vocab item: {target}{'  (strict: enforced as hard FAIL)' if args.strict else ''}")
    print()

    covered_at_target = sum(1 for vid in vocab_ids if vocab_counts.get(vid, 0) >= target)
    covered_min = sum(1 for vid in vocab_ids if vocab_counts.get(vid, 0) >= 1)
    print(f"Vocab items with >= 1 exercise:        {covered_min}/{len(vocab_ids)}")
    print(f"Vocab items with >= {target} exercises (target): {covered_at_target}/{len(vocab_ids)}")
    print(f"Grammar concepts with >= 1 exercise:   {len(grammar_ids) - len(uncovered_grammar)}/{len(grammar_ids)}")
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
