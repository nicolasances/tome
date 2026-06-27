---
name: post-module-content
description: Seeds all content for a Tome Language Learning module in one pass — vocabulary, grammar concepts, module, and exercises — then prints a unified report. Supports dev and prod environments.
---

# Post Module Content

## Overview

Seeds all four content artifacts for a given module into the Tome language API in the correct dependency order: vocabulary items → grammar concepts → module → exercises. Reads content from the local `content/` folder. The auth token and API endpoint are retrieved directly from macOS Keychain by the script — **Claude never reads or sees them**.

The skill produces a unified seeding report showing how many items were created, already present, or rejected for each artifact type.

## When to Use

- The user wants to seed or re-seed a complete module's content.
- Trigger phrases: "post module content for A1-01", "seed A1-02 to prod", "upload module A2-02", "seed all content for A1-03", "post A1-01 to dev".

## One-Time Setup (user must do this before the skill runs)

Store four Keychain entries — one pair per environment:

```bash
# Dev
security add-generic-password -s "tome-ms-language-api-dev"  -a "url"   -w "<DEV_API_BASE_URL>"
security add-generic-password -s "tome-ms-language-api-dev"  -a "token" -w "<DEV_AUTH_TOKEN>"

# Prod
security add-generic-password -s "tome-ms-language-api-prod" -a "url"   -w "<PROD_API_BASE_URL>"
security add-generic-password -s "tome-ms-language-api-prod" -a "token" -w "<PROD_AUTH_TOKEN>"
```

The base URL must include the `/tomelang` base path and must not have a trailing slash (e.g. `http://localhost:8080/tomelang`).

macOS may prompt for your login password when writing each entry. On first read by the script, macOS may show a dialog asking whether to allow `security` to access the item — click **Allow** or **Always Allow**.

To update a stored value:
```bash
security delete-generic-password -s "tome-ms-language-api-dev" -a "token"
security add-generic-password    -s "tome-ms-language-api-dev" -a "token" -w "<NEW_TOKEN>"
```

## Content Files Required

The skill expects these four files under `content/<module-id>/`:

| File | API endpoint |
|------|-------------|
| `<module-id>-vocabulary.json` | `POST /vocabularyItems/batch` |
| `<module-id>-grammar.json` | `POST /grammarConcepts/batch` |
| `<module-id>.json` | `POST /modules` |
| `<module-id>-exercises.json` | `POST /exercises` |

## What Claude Must Do

1. Identify the module ID (e.g. `A1-01`) and the target environment (`dev` or `prod`, default `dev`) from the user's request.
2. Verify that all four content files exist under `content/<module-id>/`.
3. Run the script as a single opaque command:

```bash
python3 .claude/skills/post-module-content/post_module_content.py <module-id> --env <dev|prod>
```

4. Report the non-sensitive summary the script prints to the user.

## Security Rules — Claude Must Never Break These

- **Never** call `security find-generic-password` directly.
- **Never** read, print, echo, or inspect the auth token or the API URL.
- **Never** print HTTP request headers or raw HTTP response bodies.
- **Never** modify the script to surface the token or URL.
- Only report what the script itself prints: environment, module, counts, and status labels.

## Expected Output

Fresh seed:
```
============================================================
Module Content Seeding Report
============================================================
Environment:     dev
Module:          danish-A1-01

--- Vocabulary ---
Submitted:       47
Created:         47
Already present: 0
Rejected:        0

--- Grammar Concepts ---
Submitted:       3
Created:         3
Already present: 0
Rejected:        0

--- Module ---
Status:          created

--- Exercises ---
Submitted:       50
Created:         50
Already present: 0

============================================================
Summary
Vocabulary:      47 created, 0 already present, 0 rejected
Grammar:         3 created, 0 already present, 0 rejected
Module:          created
Exercises:       50 created, 0 already present
============================================================
```

Re-run (idempotent):
```
============================================================
Module Content Seeding Report
============================================================
Environment:     dev
Module:          danish-A1-01

--- Vocabulary ---
Submitted:       47
Created:         0
Already present: 47
Rejected:        0

--- Grammar Concepts ---
Submitted:       3
Created:         0
Already present: 3
Rejected:        0

--- Module ---
Status:          already exists

--- Exercises ---
Submitted:       50
Created:         0
Already present: 50

============================================================
Summary
Vocabulary:      0 created, 47 already present, 0 rejected
Grammar:         0 created, 3 already present, 0 rejected
Module:          already exists
Exercises:       0 created, 50 already present
============================================================
```

With validation errors (partial):
```
--- Vocabulary ---
Submitted:       47
Created:         46
Already present: 0
Rejected:        1

  Validation errors:
    A1-01-v-en-8962: type must be one of: noun, verb, adjective, ...
```
