#!/usr/bin/env python3
"""Seed a Tome module via the POST /modules API.

Auth token and API endpoint are read from macOS Keychain and never printed
or surfaced. Only a non-sensitive summary is written to stdout.

Usage:
    python3 seed_module.py <module-id> [--env dev|prod]

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


def _load_module(module_id: str) -> dict:
    module_path = Path("content") / module_id / f"{module_id}.json"
    if not module_path.exists():
        print(f"ERROR: Module file not found: {module_path}")
        sys.exit(1)
    with open(module_path) as f:
        return json.load(f)


def _post_module(module: dict, base_url: str, token: str) -> tuple[int, dict]:
    """POST /modules and return (status_code, response_body)."""
    url = f"{base_url}/modules"
    payload = json.dumps(module).encode("utf-8")
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


def _parse_args() -> tuple[str, str]:
    args = sys.argv[1:]
    if not args or args[0].startswith("-"):
        print("Usage: python3 seed_module.py <module-id> [--env dev|prod]")
        print("  e.g.: python3 seed_module.py A1-01 --env prod")
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

    module = _load_module(module_id)
    base_url, token = _load_config(env)
    status_code, body = _post_module(module, base_url, token)

    module_db_id = module.get("id", module_id)

    print(f"Environment:  {env}")
    print(f"Module:       {module_db_id}")

    if status_code == 201:
        print(f"Status:       created")
    elif status_code == 409:
        print(f"Status:       already exists (duplicate id)")
    elif status_code == 400:
        message = body.get("message", "(no message)")
        print(f"Status:       validation error")
        print(f"  Error: {message}")
        sys.exit(1)
    else:
        print(f"Status:       unexpected HTTP {status_code}")
        sys.exit(1)


if __name__ == "__main__":
    main()
