---
name: seed-grammar
description: Seeds grammar concepts for a Tome Language Learning module by calling the POST /grammarConcepts/batch API. Supports dev and prod environments.
---

# Seed Grammar

## Overview

Seeds all grammar concepts for a given module into the Tome language API using the batch endpoint (`POST /tomelang/grammarConcepts/batch`). Reads grammar concepts from the local `content/` folder. The auth token and API endpoint are retrieved directly from macOS Keychain by the script — **Claude never reads or sees them**.

## When to Use

- The user wants to seed or re-seed grammar concepts for a module.
- Trigger phrases: "seed grammar for A1-01", "seed grammar concepts for A2-02 to prod", "upload grammar concepts for module X".

## One-Time Setup (user must do this before the skill runs)

Store four Keychain entries — one pair per environment (shared with the seed-vocabulary skill):

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
2. Verify that `content/<module-id>/<module-id>-grammar.json` exists.
3. Run the script as a single opaque command:

```bash
python3 .claude/skills/seed-grammar/seed_grammar.py <module-id> --env <dev|prod>
```

4. Report the non-sensitive summary the script prints to the user.

## Security Rules — Claude Must Never Break These

- **Never** call `security find-generic-password` directly.
- **Never** read, print, echo, or inspect the auth token or the API URL.
- **Never** print HTTP request headers or raw HTTP response bodies.
- **Never** modify the script to surface the token or URL.
- Only report what the script itself prints: environment, module, counts, and validation error details.

## Expected Output

Success:
```
Environment:       dev
Module:            A1-01
Items submitted:   3
Inserted:          3
Already present:   0
Validation errors: 0
```

Re-run (idempotent):
```
Environment:       dev
Module:            A1-01
Items submitted:   3
Inserted:          0
Already present:   3
Validation errors: 0
```

With validation errors:
```
Environment:       dev
Module:            A1-01
Items submitted:   3
Inserted:          2
Already present:   0
Validation errors: 1

Validation errors:
  A1-01-g-present-tense-nutid-6604: category must be one of: tenses, sentence_structure, verbs, nouns, pronouns, adjectives, connectors, advanced
```
