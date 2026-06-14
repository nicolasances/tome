#!/usr/bin/env python3
"""
Validates a generated Level Test Bank against the level's vocabulary + grammar pool.

Unlike a module bank (which must give every vocabulary item at least one exercise), a
level test bank is a ~60-exercise breadth SAMPLE across hundreds of items. The gates here
are therefore different:

  HARD FAILs:
    1. Every referenced vocabularyItemId / grammarConceptId must EXIST in the level's pool
       (the API does NOT check this — a dangling reference is accepted silently and breaks
       the test at read time).
    2. Every DISTINCT grammar concept (by name) at the level must be covered by >= 1
       exercise (few concepts per level — full coverage is feasible and required).
    3. Every exercise must have moduleId null/absent (level-test exercises carry no module).

  WARN only (reported, never blocks):
    - Vocabulary sampling: how many distinct items are exercised, and whether any module
      contributes zero exercises (cross-module breadth).

The pool is re-derived directly from the content folder (same scan as gather_level_pool.py),
so this gate does not depend on the pool file having been written.

Usage:
    python3 validate_level_coverage.py <level> <exercises_file> <content_folder>

Exit codes:
    0   All hard gates pass (WARNs allowed)
    1   A dangling reference, an uncovered grammar concept, or a non-null moduleId
"""

import json
import re
import sys
from collections import Counter
from pathlib import Path

CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")


def load_json_array(path: Path, label: str) -> list[dict]:
    if not path.exists():
        print(f"Error: {label} file not found: {path}", file=sys.stderr)
        sys.exit(1)
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"Error: {label} file is not valid JSON: {path}: {e}", file=sys.stderr)
        sys.exit(1)
    if not isinstance(data, list):
        print(f"Error: {label} file must be a JSON array: {path}", file=sys.stderr)
        sys.exit(1)
    return data


def module_of(item_id: str) -> str:
    parts = item_id.split("-")
    return "-".join(parts[:2]) if len(parts) >= 2 else item_id


def build_pool(content_dir: Path, level: str) -> tuple[set[str], dict[str, str], set[str]]:
    """Returns (vocab_ids, grammar_id_to_name, distinct_grammar_names)."""
    pattern = re.compile(rf"^{re.escape(level)}-\d+$")
    modules = sorted(d.name for d in content_dir.iterdir() if d.is_dir() and pattern.match(d.name)) if content_dir.exists() else []
    if not modules:
        print(f"Error: no module content found for level {level} under {content_dir}/", file=sys.stderr)
        sys.exit(1)

    vocab_ids: set[str] = set()
    grammar_id_to_name: dict[str, str] = {}
    grammar_names: set[str] = set()

    for module in modules:
        base = content_dir / module
        vpath = base / f"{module}-vocabulary.json"
        gpath = base / f"{module}-grammar.json"
        if vpath.exists():
            for item in load_json_array(vpath, "vocabulary"):
                vocab_ids.add(item["id"])
        if gpath.exists():
            for concept in load_json_array(gpath, "grammar"):
                grammar_id_to_name[concept["id"]] = concept["name"]
                grammar_names.add(concept["name"])

    return vocab_ids, grammar_id_to_name, grammar_names


def main() -> None:
    if len(sys.argv) != 4:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    level, exercises_file, content_folder = sys.argv[1], sys.argv[2], sys.argv[3]
    if level not in CEFR_LEVELS:
        print(f"Error: unknown CEFR level '{level}'. Must be one of: {', '.join(CEFR_LEVELS)}", file=sys.stderr)
        sys.exit(1)

    exercises = load_json_array(Path(exercises_file), "exercises")
    vocab_ids, grammar_id_to_name, grammar_names = build_pool(Path(content_folder), level)

    dangling_vocab: set[str] = set()
    dangling_grammar: set[str] = set()
    bad_module_id: int = 0
    referenced_vocab: set[str] = set()
    covered_grammar_names: set[str] = set()

    for ex in exercises:
        if ex.get("moduleId") is not None:
            bad_module_id += 1
        vid = ex.get("vocabularyItemId")
        gid = ex.get("grammarConceptId")
        if vid:
            referenced_vocab.add(vid)
            if vid not in vocab_ids:
                dangling_vocab.add(vid)
        if gid:
            if gid in grammar_id_to_name:
                covered_grammar_names.add(grammar_id_to_name[gid])
            else:
                dangling_grammar.add(gid)

    uncovered_grammar = sorted(grammar_names - covered_grammar_names)

    # Vocab spread per module.
    module_counts: Counter[str] = Counter(module_of(v) for v in referenced_vocab)
    all_modules = sorted({module_of(v) for v in vocab_ids})
    silent_modules = [m for m in all_modules if module_counts.get(m, 0) == 0]

    # ── Header ──────────────────────────────────────────────────────────────
    print(f"\nLevel Test Bank Coverage — {level}")
    print(f"Total exercises: {len(exercises)}")
    print(f"Pool: {len(vocab_ids)} vocab items, {len(grammar_names)} distinct grammar concepts, {len(all_modules)} modules")
    print(f"Distinct vocab items exercised: {len(referenced_vocab)}/{len(vocab_ids)}")
    print(f"Grammar concepts covered:       {len(covered_grammar_names)}/{len(grammar_names)}")
    print()

    has_fail = False

    if dangling_vocab or dangling_grammar:
        has_fail = True
        print("✗ FAIL — exercises reference ids that do NOT exist in the level pool:")
        for vid in sorted(dangling_vocab):
            print(f"    - vocabularyItemId {vid}")
        for gid in sorted(dangling_grammar):
            print(f"    - grammarConceptId {gid}")
        print()

    if uncovered_grammar:
        has_fail = True
        print(f"✗ FAIL — {len(uncovered_grammar)} grammar concept(s) at this level have NO exercise:")
        for name in uncovered_grammar:
            print(f"    - {name}")
        print()

    if bad_module_id:
        has_fail = True
        print(f"✗ FAIL — {bad_module_id} exercise(s) have a non-null moduleId (level-test exercises must have moduleId = null).")
        print()

    if silent_modules:
        print(f"! WARN — {len(silent_modules)} module(s) contribute zero exercises (cross-module breadth):")
        print(f"    {', '.join(silent_modules)}")
        print("    Consider adding exercises drawing on these modules' vocabulary.")
        print()

    if has_fail:
        print("Result: FAIL — fix the issues above, then rerun. Repeat until exit 0.")
        sys.exit(1)

    if silent_modules:
        print("Result: PASS (with breadth warnings) — references valid and every grammar concept covered.")
    else:
        print("Result: PASS — references valid, every grammar concept covered, every module represented.")
    sys.exit(0)


if __name__ == "__main__":
    main()
