# Language Learning — Session Summary Screen Spec

## Overview

The Session Summary Screen is displayed at the end of every Language Learning session (both Vocabulary Practice and Inversions). It gives the user a snapshot of their performance for that session.

---

## When It Appears

The Summary Screen is shown automatically when the session queue is empty — i.e., when all items in the session have been answered correctly.

It is shared between:
* [Vocabulary Practice](./vocabulary-practice.md)
* [Sentence Practice](./sentence-practice.md)
* [Inversions](./inversions.md)

---

## Content

The screen must display the following information:

| Element | Description |
|---------|-------------|
| **Session size** | Total number of items in the session (fixed at session start) |
| **First-attempt correct** | Number of items the user answered correctly on their very first attempt |
| **Score / Accuracy** | Percentage of items answered correctly on the first attempt (`first-attempt correct / session size × 100`) |

### Score Display

* The score is expressed as a **percentage**, rounded to the nearest whole number.
* Example: 7 correct out of 10 → **70%**

---

## Actions

After reviewing their results, the user must be able to:

| Action | Description |
|--------|-------------|
| **Return to Home / Language Learning menu** | Navigates the user back to the Language Learning section of the app |

---

## Scoring Rules

* An item counts as a **first-attempt correct** only if the user answered it correctly the very first time it appeared in the session.
* Items that were answered incorrectly, deferred, and later answered correctly do **not** count as first-attempt correct.
* The session size is fixed at the start of the session and does not change even if items are deferred and re-answered.

---

## Out of Scope

* Persisting session results or history is not part of this screen.
* Comparing results across sessions is not part of this feature.
