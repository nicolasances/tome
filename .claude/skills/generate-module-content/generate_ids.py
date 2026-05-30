#!/usr/bin/env python3
"""
Generates IDs for Tome vocabulary items and grammar concepts.

Usage:
    python generate_ids.py <module> v <name1> [<name2> ...]
    python generate_ids.py <module> g <name1> [<name2> ...]

Arguments:
    module   Module code (e.g. A2-02)
    type     'v' for vocabulary item, 'g' for grammar concept
    names    One or more names (short, dash-separated, max 4 words)

Output:
    JSON array of {"name": ..., "id": ...} objects, printed to stdout.

ID format:
    <module>-v-<name>-<random>   e.g.  A2-02-v-kaffe-7392
    <module>-g-<name>-<random>   e.g.  A2-02-g-inversion-4821
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


def main():
    if len(sys.argv) < 4 or sys.argv[2] not in ('v', 'g'):
        print(
            "Usage: python generate_ids.py <module> <v|g> <name1> [<name2> ...]",
            file=sys.stderr,
        )
        sys.exit(1)

    module, type_code, names = sys.argv[1], sys.argv[2], sys.argv[3:]
    results = [{"name": n, "id": make_id(module, type_code, n)} for n in names]
    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == '__main__':
    main()
