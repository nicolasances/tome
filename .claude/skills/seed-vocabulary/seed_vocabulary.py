#!/usr/bin/env python3
"""Seed vocabulary items for a Tome module via the batch API.

Auth token and API endpoint are read from macOS Keychain and never printed
or surfaced. Only a non-sensitive summary is written to stdout.

Usage:
    python3 seed_vocabulary.py <module-id> [--env dev|prod]

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


def _keychain_read(service: str, account: str) -> str:
    """Retrieve a single value from macOS Keychain. Never prints the value."""
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
    """Return (base_url, token) for the given environment, both from Keychain."""
    service = f"tome-ms-language-api-{env}"
    base_url = _keychain_read(service, "url")
    token = _keychain_read(service, "token")
    return base_url, token


def _load_vocabulary(module_id: str) -> list:
    vocab_path = Path("content") / module_id / f"{module_id}-vocabulary.json"
    if not vocab_path.exists():
        print(f"ERROR: Vocabulary file not found: {vocab_path}")
        sys.exit(1)
    with open(vocab_path) as f:
        return json.load(f)


def _call_batch_api(items: list, base_url: str, token: str) -> dict:
    url = f"{base_url}/tomelang/vocabularyItems/batch"

    payload = json.dumps({"items": items}).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"ERROR: API returned HTTP {e.code}.")
        # Suppress body if it might contain auth-related content
        if "token" not in body.lower() and "auth" not in body.lower():
            print(f"  Response: {body}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"ERROR: Could not reach API: {e.reason}")
        sys.exit(1)


def _parse_args() -> tuple[str, str]:
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        print("Usage: python3 seed_vocabulary.py <module-id> [--env dev|prod]")
        print("  e.g.: python3 seed_vocabulary.py A1-01 --env prod")
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


def main():
    module_id, env = _parse_args()

    items = _load_vocabulary(module_id)
    base_url, token = _load_config(env)
    result = _call_batch_api(items, base_url, token)

    # Only non-sensitive counts reach stdout — token and URL never appear here
    print(f"Environment:       {env}")
    print(f"Module:            {module_id}")
    print(f"Items submitted:   {len(items)}")
    print(f"Inserted:          {result.get('inserted', '?')}")
    print(f"Already present:   {result.get('alreadyPresent', '?')}")
    print(f"Validation errors: {result.get('validationErrors', '?')}")

    errors = [i for i in result.get("items", []) if i.get("status") == "validation_error"]
    if errors:
        print("\nValidation errors:")
        for err in errors:
            print(f"  {err['id']}: {err.get('reason', '(no reason)')}")


if __name__ == "__main__":
    main()
