#!/usr/bin/env python3
"""
Extracts vocabulary item IDs and grammar concept IDs from the generated Phase 1/2 files.

Usage:
    python3 extract_module_ids.py <module> <folder>

Arguments:
    module   Module code (e.g. A2-02)
    folder   Base folder containing the module subfolder (e.g. content/modules)

Reads:
    <folder>/<module>/<module>-vocabulary.json
    <folder>/<module>/<module>-grammar.json

Output:
    JSON object:
    {
      "vocabularyItemIds": ["A2-02-v-kaffe-7392", ...],
      "grammarConceptIds": ["A2-02-g-inversion-4821", ...]
    }

Exits with code 1 and an error message if either file is missing or malformed.
"""

import sys
import json
from pathlib import Path


def load_ids(path: Path, label: str) -> list[str]:
    if not path.exists():
        print(f"Error: {label} file not found: {path}", file=sys.stderr)
        sys.exit(1)
    try:
        items = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"Error: {label} file is not valid JSON: {e}", file=sys.stderr)
        sys.exit(1)
    if not isinstance(items, list):
        print(f"Error: {label} file must be a JSON array, got {type(items).__name__}", file=sys.stderr)
        sys.exit(1)
    ids = []
    for i, item in enumerate(items):
        if "id" not in item:
            print(f"Error: {label} item at index {i} is missing 'id' field", file=sys.stderr)
            sys.exit(1)
        ids.append(item["id"])
    return ids


def main():
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    module, folder = sys.argv[1], sys.argv[2]
    base = Path(folder) / module

    vocab_ids = load_ids(base / f"{module}-vocabulary.json", "vocabulary")
    grammar_ids = load_ids(base / f"{module}-grammar.json", "grammar")

    result = {
        "vocabularyItemIds": vocab_ids,
        "grammarConceptIds": grammar_ids,
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
