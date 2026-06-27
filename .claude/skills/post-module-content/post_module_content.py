#!/usr/bin/env python3
"""Seed all content for a Tome module in one pass: vocabulary → grammar → module → exercises.

Auth token and API endpoint are read from macOS Keychain and never printed
or surfaced. Only a non-sensitive summary is written to stdout.

Usage:
    python3 post_module_content.py <module-id> [--env dev|prod]

Keychain entries required (one-time setup per environment):
    security add-generic-password -s "tome-ms-language-api-dev"  -a "url"   -w "<DEV_URL>"
    security add-generic-password -s "tome-ms-language-api-dev"  -a "token" -w "<DEV_TOKEN>"
    security add-generic-password -s "tome-ms-language-api-prod" -a "url"   -w "<PROD_URL>"
    security add-generic-password -s "tome-ms-language-api-prod" -a "token" -w "<PROD_TOKEN>"
"""

import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path


# ---------------------------------------------------------------------------
# Keychain / config
# ---------------------------------------------------------------------------

def _keychain_read(service: str, account: str) -> str:
    try:
        result = subprocess.run(
            ["security", "find-generic-password", "-s", service, "-a", account, "-w"],
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print(f"ERROR: Keychain entry not found — service='{service}' account='{account}'.")
        print(f"  Run: security add-generic-password -s \"{service}\" -a \"{account}\" -w \"<VALUE>\"")
        sys.exit(1)


def _load_config(env: str) -> tuple[str, str]:
    service = f"tome-ms-language-api-{env}"
    base_url = _keychain_read(service, "url")
    token = _keychain_read(service, "token")
    return base_url, token


# ---------------------------------------------------------------------------
# Content file loaders
# ---------------------------------------------------------------------------

def _load_vocabulary(module_id: str) -> list:
    path = Path("content") / module_id / f"{module_id}-vocabulary.json"
    if not path.exists():
        print(f"ERROR: Vocabulary file not found: {path}")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def _load_grammar(module_id: str) -> list:
    path = Path("content") / module_id / f"{module_id}-grammar.json"
    if not path.exists():
        print(f"ERROR: Grammar file not found: {path}")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def _load_module(module_id: str) -> dict:
    path = Path("content") / module_id / f"{module_id}.json"
    if not path.exists():
        print(f"ERROR: Module file not found: {path}")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def _load_exercises(module_id: str) -> tuple[str, list]:
    path = Path("content") / module_id / f"{module_id}-exercises.json"
    if not path.exists():
        print(f"ERROR: Exercises file not found: {path}")
        sys.exit(1)
    with open(path) as f:
        exercises = json.load(f)
    if not exercises:
        print("ERROR: Exercises file is empty.")
        sys.exit(1)
    full_module_id = exercises[0].get("moduleId")
    if not full_module_id:
        print("ERROR: First exercise is missing 'moduleId' field.")
        sys.exit(1)
    return full_module_id, exercises


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _post(url: str, payload: dict, token: str) -> tuple[int, dict]:
    """POST JSON payload, return (status_code, response_body). Never raises on 4xx."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if e.code in (400, 409):
            try:
                return e.code, json.loads(body)
            except json.JSONDecodeError:
                return e.code, {"message": body}
        print(f"ERROR: API returned HTTP {e.code}.")
        if "token" not in body.lower() and "auth" not in body.lower():
            print(f"  Response: {body}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"ERROR: Could not reach API: {e.reason}")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Seeding steps
# ---------------------------------------------------------------------------

def _seed_vocabulary(items: list, base_url: str, token: str) -> dict:
    _, body = _post(f"{base_url}/vocabularyItems/batch", {"items": items}, token)
    return body


def _seed_grammar(items: list, base_url: str, token: str) -> dict:
    _, body = _post(f"{base_url}/grammarConcepts/batch", {"items": items}, token)
    return body


def _seed_module(module: dict, base_url: str, token: str) -> tuple[int, dict]:
    return _post(f"{base_url}/modules", module, token)


def _seed_exercises(full_module_id: str, exercises: list, base_url: str, token: str) -> tuple[int, dict]:
    return _post(f"{base_url}/exercises", {"moduleId": full_module_id, "exercises": exercises}, token)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> tuple[str, str]:
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        print("Usage: python3 post_module_content.py <module-id> [--env dev|prod]")
        print("  e.g.: python3 post_module_content.py A1-01 --env prod")
        sys.exit(1)

    module_id = args[0]
    env = "dev"

    if "--env" in args:
        idx = args.index("--env")
        if idx + 1 >= len(args):
            print("ERROR: --env requires a value (dev or prod)")
            sys.exit(1)
        env = args[idx + 1]
        if env not in ("dev", "prod"):
            print(f"ERROR: --env must be 'dev' or 'prod', got '{env}'")
            sys.exit(1)

    return module_id, env


# ---------------------------------------------------------------------------
# Report helpers
# ---------------------------------------------------------------------------

_W = 17  # label column width


def _print_batch_section(title: str, submitted: int, result: dict):
    inserted = result.get("inserted", "?")
    already_present = result.get("alreadyPresent", "?")
    validation_errors = result.get("validationErrors", "?")

    print(f"\n--- {title} ---")
    print(f"{'Submitted:':<{_W}} {submitted}")
    print(f"{'Created:':<{_W}} {inserted}")
    print(f"{'Already present:':<{_W}} {already_present}")
    print(f"{'Rejected:':<{_W}} {validation_errors}")

    errors = [i for i in result.get("items", []) if i.get("status") == "validation_error"]
    if errors:
        print(f"\n  Validation errors:")
        for err in errors:
            print(f"    {err['id']}: {err.get('reason', '(no reason)')}")


def _batch_summary(result: dict) -> str:
    inserted = result.get("inserted", "?")
    already_present = result.get("alreadyPresent", "?")
    validation_errors = result.get("validationErrors", "?")
    return f"{inserted} created, {already_present} already present, {validation_errors} rejected"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    module_id, env = _parse_args()

    vocab_items = _load_vocabulary(module_id)
    grammar_items = _load_grammar(module_id)
    module_data = _load_module(module_id)
    full_module_id, exercises = _load_exercises(module_id)

    base_url, token = _load_config(env)

    # Seed in order: vocabulary → grammar → module → exercises
    vocab_result = _seed_vocabulary(vocab_items, base_url, token)
    grammar_result = _seed_grammar(grammar_items, base_url, token)
    module_status_code, module_body = _seed_module(module_data, base_url, token)
    exercises_status_code, exercises_body = _seed_exercises(full_module_id, exercises, base_url, token)

    # -----------------------------------------------------------------------
    # Report
    # -----------------------------------------------------------------------
    border = "=" * 60
    print(border)
    print("Module Content Seeding Report")
    print(border)
    print(f"{'Environment:':<{_W}} {env}")
    print(f"{'Module:':<{_W}} {full_module_id}")

    _print_batch_section("Vocabulary", len(vocab_items), vocab_result)
    _print_batch_section("Grammar Concepts", len(grammar_items), grammar_result)

    print(f"\n--- Module ---")
    if module_status_code in (200, 201):
        module_status_label = "created"
    elif module_status_code == 409:
        module_status_label = "already exists"
    elif module_status_code == 400:
        module_status_label = f"validation error: {module_body.get('message', '(no message)')}"
    else:
        module_status_label = f"unexpected HTTP {module_status_code}"
    print(f"{'Status:':<{_W}} {module_status_label}")

    print(f"\n--- Exercises ---")
    exercises_created = len(exercises_body.get("inserted", []))
    exercises_already_present = exercises_body.get("duplicatesSkipped", 0)
    if exercises_status_code in (200, 201):
        print(f"{'Submitted:':<{_W}} {len(exercises)}")
        print(f"{'Created:':<{_W}} {exercises_created}")
        print(f"{'Already present:':<{_W}} {exercises_already_present}")
    elif exercises_status_code == 400:
        print(f"{'Status:':<{_W}} validation error: {exercises_body.get('message', '(no message)')}")
    else:
        print(f"{'Status:':<{_W}} unexpected HTTP {exercises_status_code}")

    print(f"\n{border}")
    print("Summary")
    print(f"{'Vocabulary:':<{_W}} {_batch_summary(vocab_result)}")
    print(f"{'Grammar:':<{_W}} {_batch_summary(grammar_result)}")
    print(f"{'Module:':<{_W}} {module_status_label}")
    if exercises_status_code in (200, 201):
        print(f"{'Exercises:':<{_W}} {exercises_created} created, {exercises_already_present} already present")
    elif exercises_status_code == 400:
        print(f"{'Exercises:':<{_W}} validation error: {exercises_body.get('message', '(no message)')}")
    else:
        print(f"{'Exercises:':<{_W}} unexpected HTTP {exercises_status_code}")
    print(border)


if __name__ == "__main__":
    main()
