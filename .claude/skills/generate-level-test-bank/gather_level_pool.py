#!/usr/bin/env python3
"""
Gathers the full vocabulary + grammar pool for a CEFR level from the local content
folder, ready for level-test-bank generation.

A level test bank references EXISTING vocabulary items and grammar concepts that were
already generated for the level's modules (under content/<module>/). This script
consolidates them into a single pool file so the generator never has to invent an id.

Usage:
    python3 gather_level_pool.py <level> <content_folder>

Arguments:
    level           CEFR level, e.g. A1, A2, B1, B2, C1, C2
    content_folder  Base folder containing the per-module subfolders (e.g. content)

Reads, for every module folder matching <level>-NN under <content_folder>:
    <content_folder>/<module>/<module>-vocabulary.json
    <content_folder>/<module>/<module>-grammar.json

Grammar concepts are deduplicated by `name` (the same concept — e.g. "Inversion" —
appears across several modules with distinct module-scoped ids). For each unique name the
pool keeps one representative id plus the full list of ids and the modules it came from.

Writes:
    <content_folder>/level-tests/<level>/<level>-level-test-pool.json

Prints a human-readable summary, including which curriculum modules for the level (parsed
from docs/idea/language-learning/default-modules.md, if present) are missing locally.

Exit codes:
    0   Pool gathered (even if some curriculum modules are missing — only a warning)
    1   No module content found for the level, or a content file is malformed
"""

import json
import os
import re
import sys
from pathlib import Path

CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
DEFAULT_MODULES_DOC = Path("docs/idea/language-learning/default-modules.md")


def load_json_array(path: Path, label: str) -> list[dict]:
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
    """A1-01-v-kaffe-7392 -> A1-01."""
    parts = item_id.split("-")
    return "-".join(parts[:2]) if len(parts) >= 2 else item_id


def find_module_dirs(content_dir: Path, level: str) -> list[str]:
    pattern = re.compile(rf"^{re.escape(level)}-\d+$")
    if not content_dir.exists():
        return []
    return sorted(
        d.name for d in content_dir.iterdir()
        if d.is_dir() and pattern.match(d.name)
    )


def curriculum_modules(level: str) -> list[str]:
    """Parse default-modules.md for the level's module codes (e.g. '### A1-03 — ...')."""
    if not DEFAULT_MODULES_DOC.exists():
        return []
    pattern = re.compile(rf"^###\s+({re.escape(level)}-\d+)\b", re.MULTILINE)
    text = DEFAULT_MODULES_DOC.read_text(encoding="utf-8")
    seen: list[str] = []
    for m in pattern.findall(text):
        if m not in seen:
            seen.append(m)
    return sorted(seen)


def main() -> None:
    if len(sys.argv) != 3:
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    level, content_folder = sys.argv[1], sys.argv[2]
    if level not in CEFR_LEVELS:
        print(f"Error: unknown CEFR level '{level}'. Must be one of: {', '.join(CEFR_LEVELS)}", file=sys.stderr)
        sys.exit(1)

    content_dir = Path(content_folder)
    modules = find_module_dirs(content_dir, level)
    if not modules:
        print(f"Error: no module content found for level {level} under {content_dir}/", file=sys.stderr)
        print(f"  Expected subfolders like {content_dir}/{level}-01/ with *-vocabulary.json and *-grammar.json", file=sys.stderr)
        sys.exit(1)

    vocab_pool: list[dict] = []
    # name -> aggregated grammar concept
    grammar_by_name: dict[str, dict] = {}

    for module in modules:
        base = content_dir / module
        vocab_path = base / f"{module}-vocabulary.json"
        grammar_path = base / f"{module}-grammar.json"

        if vocab_path.exists():
            for item in load_json_array(vocab_path, "vocabulary"):
                vocab_pool.append({
                    "id": item["id"],
                    "danish": item.get("danish"),
                    "english": item.get("english"),
                    "type": item.get("type"),
                    "context": item.get("context"),
                    "module": module,
                })
        else:
            print(f"Warning: {vocab_path} not found — skipping its vocabulary", file=sys.stderr)

        if grammar_path.exists():
            for concept in load_json_array(grammar_path, "grammar"):
                name = concept["name"]
                entry = grammar_by_name.get(name)
                if entry is None:
                    grammar_by_name[name] = {
                        "name": name,
                        "category": concept.get("category"),
                        "cefrLevelIntroduced": concept.get("cefrLevelIntroduced"),
                        "representativeId": concept["id"],
                        "ids": [concept["id"]],
                        "modules": [module],
                        "examples": concept.get("examples", []),
                    }
                else:
                    if concept["id"] not in entry["ids"]:
                        entry["ids"].append(concept["id"])
                    if module not in entry["modules"]:
                        entry["modules"].append(module)
        else:
            print(f"Warning: {grammar_path} not found — skipping its grammar", file=sys.stderr)

    grammar_pool = list(grammar_by_name.values())

    pool = {
        "cefrLevel": level,
        "modulesFound": modules,
        "vocabularyItems": vocab_pool,
        "grammarConcepts": grammar_pool,
    }

    out_dir = content_dir / "level-tests" / level
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{level}-level-test-pool.json"
    out_path.write_text(json.dumps(pool, indent=2, ensure_ascii=False), encoding="utf-8")

    # ── Summary ──────────────────────────────────────────────────────────────
    expected = curriculum_modules(level)
    missing = [m for m in expected if m not in modules]

    print(f"\nLevel Pool — {level}")
    print(f"Modules found:            {len(modules)}  ({', '.join(modules)})")
    print(f"Vocabulary items:         {len(vocab_pool)}")
    print(f"Distinct grammar concepts:{len(grammar_pool):>3}  ({', '.join(c['name'] for c in grammar_pool)})")
    if expected:
        print(f"Curriculum modules at {level}: {len(expected)}")
        if missing:
            print(f"! Missing locally ({len(missing)}): {', '.join(missing)}")
            print("  The bank will cover only the modules present above — generate the rest for full breadth.")
        else:
            print("  All curriculum modules for this level are present locally.")
    else:
        print(f"Note: {DEFAULT_MODULES_DOC} not found — cannot check curriculum completeness.")
    print(f"\nPool written: {out_path}")
    print("Use the ids in this file verbatim when generating exercises — never invent ids.")


if __name__ == "__main__":
    main()
