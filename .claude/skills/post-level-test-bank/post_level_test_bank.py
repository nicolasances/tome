#!/usr/bin/env python3
"""Post a generated Level Test Bank to the Tome language API (F20).

Auth token and API endpoint are read from macOS Keychain and never printed or surfaced.
Only a non-sensitive summary is written to stdout.

Usage:
    python3 post_level_test_bank.py <level> [--env dev|prod] [--append] [--content-folder PATH]

    <level>            CEFR level, e.g. A1, A2, B1, B2, C1, C2
    --env              Target environment (default: dev)
    --append           Append to an EXISTING bank (POST /levelTestBanks/<level>/exercises)
                       instead of creating a new one (POST /levelTestBanks).
    --content-folder   Root content folder (default: content)

Reads:
    <content-folder>/level-tests/<level>/<level>-level-test-exercises.json

Keychain entries required (same as post-module-content, one-time setup per environment):
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

CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")
_W = 17  # label column width


# ---------------------------------------------------------------------------
# Keychain / config
# ---------------------------------------------------------------------------

def _keychain_read(service: str, account: str) -> str:
    try:
        result = subprocess.run(
            ["security", "find-generic-password", "-s", service, "-a", account, "-w"],
            capture_output=True, text=True, check=True,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        print(f"ERROR: Keychain entry not found — service='{service}' account='{account}'.")
        print(f"  Run: security add-generic-password -s \"{service}\" -a \"{account}\" -w \"<VALUE>\"")
        sys.exit(1)


def _load_config(env: str) -> tuple[str, str]:
    service = f"tome-ms-language-api-{env}"
    return _keychain_read(service, "url"), _keychain_read(service, "token")


# ---------------------------------------------------------------------------
# Content
# ---------------------------------------------------------------------------

def _load_exercises(level: str, content_folder: str) -> list:
    path = Path(content_folder) / "level-tests" / level / f"{level}-level-test-exercises.json"
    if not path.exists():
        print(f"ERROR: Exercises file not found: {path}")
        sys.exit(1)
    with open(path, encoding="utf-8") as f:
        exercises = json.load(f)
    if not exercises:
        print("ERROR: Exercises file is empty.")
        sys.exit(1)
    bad = [i for i, ex in enumerate(exercises) if ex.get("moduleId") is not None]
    if bad:
        print(f"ERROR: {len(bad)} exercise(s) have a non-null moduleId; level-test exercises must have moduleId = null.")
        sys.exit(1)
    return exercises


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------

def _post(url: str, payload: dict, token: str) -> tuple[int, dict]:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url, data=data,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if e.code in (400, 404, 409):
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
# CLI
# ---------------------------------------------------------------------------

def _parse_args() -> tuple[str, str, bool, str]:
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        print("Usage: python3 post_level_test_bank.py <level> [--env dev|prod] [--append] [--content-folder PATH]")
        sys.exit(1)

    level = args[0]
    if level not in CEFR_LEVELS:
        print(f"ERROR: level must be one of: {', '.join(CEFR_LEVELS)}")
        sys.exit(1)

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

    content_folder = "content"
    if "--content-folder" in args:
        idx = args.index("--content-folder")
        if idx + 1 >= len(args):
            print("ERROR: --content-folder requires a value")
            sys.exit(1)
        content_folder = args[idx + 1]

    return level, env, "--append" in args, content_folder


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    level, env, append, content_folder = _parse_args()
    exercises = _load_exercises(level, content_folder)
    base_url, token = _load_config(env)

    border = "=" * 60
    print(border)
    print("Level Test Bank Seeding Report")
    print(border)
    print(f"{'Environment:':<{_W}} {env}")
    print(f"{'Level:':<{_W}} {level}")
    print(f"{'Mode:':<{_W}} {'append' if append else 'create'}")
    print(f"{'Submitted:':<{_W}} {len(exercises)}")

    if append:
        url = f"{base_url}/levelTestBanks/{level}/exercises"
        status, body = _post(url, {"exercises": exercises}, token)
        created = len(body.get("addedExerciseIds", []))
        if status in (200, 201):
            print(f"{'Appended:':<{_W}} {created}")
            print(f"{'Total in bank:':<{_W}} {body.get('totalGenerated', '?')}")
        elif status == 404:
            print(f"{'Status:':<{_W}} no bank exists for {level} — create it first (run without --append)")
        elif status == 400:
            print(f"{'Status:':<{_W}} validation error: {body.get('message', '(no message)')}")
        else:
            print(f"{'Status:':<{_W}} unexpected HTTP {status}")
    else:
        url = f"{base_url}/levelTestBanks"
        status, body = _post(url, {"cefrLevel": level, "exercises": exercises}, token)
        created = len(body.get("exerciseIds", []))
        if status in (200, 201):
            print(f"{'Created:':<{_W}} {created}")
            print(f"{'Total in bank:':<{_W}} {body.get('totalGenerated', '?')}")
        elif status == 409:
            print(f"{'Status:':<{_W}} bank already exists for {level} — use --append to add exercises")
        elif status == 400:
            print(f"{'Status:':<{_W}} validation error: {body.get('message', '(no message)')}")
        else:
            print(f"{'Status:':<{_W}} unexpected HTTP {status}")

    print(border)


if __name__ == "__main__":
    main()
