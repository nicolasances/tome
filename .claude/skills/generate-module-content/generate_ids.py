#!/usr/bin/env python3
"""
Generates IDs for Tome vocabulary items and grammar concepts.

Usage (simple words):
    python3 generate_ids.py <module> <v|g> <name1> [<name2> ...]

Usage (phrases and words mixed — preferred, avoids shell-quoting issues):
    python3 generate_ids.py <module> <v|g> '["name one", "Jeg vil gerne have...", "kaffe"]'

Arguments:
    module   Module code (e.g. A2-02)
    type     'v' for vocabulary item, 'g' for grammar concept
    names    Either a JSON array string (recommended) or one or more positional args

Output:
    JSON array of {"name": ..., "id": ...} objects, printed to stdout.

ID format:
    <module>-v-<name>-<random>   e.g.  A2-02-v-kaffe-7392
    <module>-g-<name>-<random>   e.g.  A2-02-g-inversion-4821

The <name> segment is derived from the input by: lowercasing, replacing Danish
characters (æ→ae, ø→oe, å→aa), replacing spaces/punctuation with dashes, and
keeping the first 4 dash-separated words. "Jeg vil gerne have..." → "jeg-vil-gerne-have".
"""

import sys
import json
import random
import re


def normalize(name: str) -> str:
    name = name.lower()
    name = name.replace('æ', 'ae').replace('ø', 'oe').replace('å', 'aa')
    name = re.sub(r'[\s_]+', '-', name)
    name = re.sub(r'[^a-z0-9-]', '', name)
    name = re.sub(r'-+', '-', name).strip('-')
    parts = name.split('-')[:4]
    return '-'.join(parts)


def make_id(module: str, type_code: str, name: str) -> str:
    return f"{module}-{type_code}-{normalize(name)}-{random.randint(1000, 9999)}"


def parse_names(args: list[str]) -> list[str]:
    """Accept either a JSON array string or positional args."""
    if len(args) == 1 and args[0].strip().startswith('['):
        return json.loads(args[0])
    return args


def main():
    if len(sys.argv) < 4 or sys.argv[2] not in ('v', 'g'):
        print(__doc__, file=sys.stderr)
        sys.exit(1)

    module, type_code = sys.argv[1], sys.argv[2]
    names = parse_names(sys.argv[3:])
    results = [{"name": n, "id": make_id(module, type_code, n)} for n in names]
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
