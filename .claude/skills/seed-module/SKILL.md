---
name: seed-module
description: Seeds a Tome Language Learning module by calling the POST /modules API. Supports dev and prod environments.
---

# Seed Module

## Overview

Seeds a module into the Tome language API using the single-insert endpoint (`POST /tomelang/modules`). Reads the module definition from the local `content/` folder. The auth token and API endpoint are retrieved directly from macOS Keychain by the script — **Claude never reads or sees them**.

## When to Use

- The user wants to seed or re-seed a module.
- Trigger phrases: "seed module A1-01", "seed A2-02 module to prod", "upload module X", "create module A1-01".

## One-Time Setup (user must do this before the skill runs)

Store four Keychain entries — one pair per environment (shared with the seed-vocabulary and seed-grammar skills):

```bash
# Dev
security add-generic-password -s "tome-ms-language-api-dev"  -a "url"   -w "<DEV_API_BASE_URL>"
security add-generic-password -s "tome-ms-language-api-dev"  -a "token" -w "<DEV_AUTH_TOKEN>"

# Prod
security add-generic-password -s "tome-ms-language-api-prod" -a "url"   -w "<PROD_API_BASE_URL>"
security add-generic-password -s "tome-ms-language-api-prod" -a "token" -w "<PROD_AUTH_TOKEN>"
```

The base URL should not include a trailing slash (e.g. `http://localhost:8080` or `https://api.tome.example.com`).

macOS may prompt for your login password when writing each entry. On first read by the script, macOS may show a dialog asking whether to allow `security` to access the item — click **Allow** or **Always Allow**.

To update a stored value:
```bash
security delete-generic-password -s "tome-ms-language-api-dev" -a "token"
security add-generic-password    -s "tome-ms-language-api-dev" -a "token" -w "<NEW_TOKEN>"
```

## What Claude Must Do

1. Identify the module ID (e.g. `A1-01`) and the target environment (`dev` or `prod`, default `dev`) from the user's request.
2. Verify that `content/<module-id>/<module-id>.json` exists.
3. Run the script as a single opaque command:

```bash
python3 .claude/skills/seed-module/seed_module.py <module-id> --env <dev|prod>
```

4. Report the non-sensitive summary the script prints to the user.

## Security Rules — Claude Must Never Break These

- **Never** call `security find-generic-password` directly.
- **Never** read, print, echo, or inspect the auth token or the API URL.
- **Never** print HTTP request headers or raw HTTP response bodies.
- **Never** modify the script to surface the token or URL.
- Only report what the script itself prints: environment, module id, and status.

## Expected Output

Success:
```
Environment:  dev
Module:       danish-A1-01
Status:       created
```

Re-run (idempotent):
```
Environment:  dev
Module:       danish-A1-01
Status:       already exists (duplicate id)
```

Validation error (missing or invalid fields, unknown vocab/grammar ids):
```
Environment:  dev
Module:       danish-A1-01
Status:       validation error
  Error: cefrLevel must be one of: A1, A2, B1, B2, C1, C2
```
