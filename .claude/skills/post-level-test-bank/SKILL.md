---
name: post-level-test-bank
description: Posts a generated Tome Language Learning Level Test Bank — a CEFR level's ~60 cross-module exercises — to the dev or prod environment. Supports creating a new bank or appending to an existing one.
---

# Post Level Test Bank

## Overview

A **Level Test Bank** is one exercise bank per CEFR level (~60 exercises) used by the Level
Test to assess the full breadth of that level (idea.md §3.5; backend feature F20). This skill
**posts an already-generated bank** to the Tome language API. It does **not** generate the
bank — use the `generate-level-test-bank` skill for that first.

The auth token and API endpoint are retrieved directly from macOS Keychain by the script —
**Claude never reads or sees them.** The skill reports only the non-sensitive summary the
script prints.

## When to Use

- The user wants to seed/post an already-generated Level Test Bank to dev or prod.
- The user wants to append exercises to an existing level test bank.

**Trigger Phrases:**
- "Post the A2 level test bank to dev"
- "Seed the B1 level test bank to prod"
- "Append exercises to the A1 level test bank"

## Prerequisites

- The bank's exercises file must already exist (produced by `generate-level-test-bank`):
  `<content-folder>/level-tests/<level>/<level>-level-test-exercises.json`
- You **MUST** have been told the target **CEFR level** (e.g. `A2`).
- Identify the target environment (`dev` or `prod`, default `dev`).
- The content folder defaults to `content`. If the bank lives elsewhere, ask the user and
  pass `--content-folder`.

## One-Time Setup (user must do this before the skill runs)

Store the Keychain entries — one pair per environment (same entries as `post-module-content`):

```bash
# Dev
security add-generic-password -s "tome-ms-language-api-dev"  -a "url"   -w "<DEV_API_BASE_URL>"
security add-generic-password -s "tome-ms-language-api-dev"  -a "token" -w "<DEV_AUTH_TOKEN>"

# Prod
security add-generic-password -s "tome-ms-language-api-prod" -a "url"   -w "<PROD_API_BASE_URL>"
security add-generic-password -s "tome-ms-language-api-prod" -a "token" -w "<PROD_AUTH_TOKEN>"
```

The base URL must include the `/tomelang` base path and must not have a trailing slash
(e.g. `http://localhost:8080/tomelang`).

## What Claude Must Do

1. Identify the CEFR level, the target environment, and (if non-default) the content folder.
2. Verify the exercises file exists at
   `<content-folder>/level-tests/<level>/<level>-level-test-exercises.json`.
3. Run the script as a single opaque command:

```bash
python3 .claude/skills/post-level-test-bank/post_level_test_bank.py <level> --env <dev|prod>
```

   Add `--content-folder <path>` if the bank is not under the default `content` folder.

4. Report the non-sensitive summary the script prints: environment, level, mode, submitted,
   created/appended, total in bank.

## Append mode

- A fresh post creates the bank (`POST /levelTestBanks`).
- `409 / "bank already exists"` → the level already has a bank. To add exercises to it, rerun
  with `--append` (hits `POST /levelTestBanks/<level>/exercises`):

```bash
python3 .claude/skills/post-level-test-bank/post_level_test_bank.py <level> --env <dev|prod> --append
```

## Security Rules — Claude Must Never Break These

- **Never** call `security find-generic-password` directly.
- **Never** read, print, echo, or inspect the auth token or the API URL.
- **Never** print HTTP request headers or raw HTTP response bodies.
- **Never** modify the script to surface the token or URL.
- Only report what the script itself prints: environment, level, mode, counts, and status labels.

## Red Flags

- Posting a bank that was never generated/validated (run `generate-level-test-bank` first).
- Posting to `prod` without the user explicitly asking for prod.
- Reading, printing, or otherwise surfacing the auth token or API URL.
