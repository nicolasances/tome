# Memory & Challenges

Challenges are the core mechanism Tome uses for active recall practice. This document describes how Challenges work, how they are scored, and how accuracy is tracked.

---

## Challenges

A **Challenge** is a structured practice session tied to a Topic. Challenges vary in difficulty and test the user's recall through a series of **Tests** (questions).

### Challenge Types

| Challenge | Difficulty | Description |
|-----------|-----------|-------------|
| **Juice Challenge** | Easy | Tests core concepts, key dates, and important people from the topic. |

---

## Tests

Tests are the individual questions within a Challenge. Each Test is generated from the content of the Topic's Sections.

### Test Types

| Type | Description | Answer Format |
|------|-------------|---------------|
| **Date Test** | Recall a date or time period for a given event. | Free text |
| **Free Text Test** | Answer an open question about the topic. | Free text |
| **Genealogic Tree Test** | Reconstruct a family tree or hierarchical relationship. | Graph interaction |
| **Timeline Test** | Place events in the correct chronological order. | Drag-and-drop ordering |

---

## Scoring

Each Test is scored individually. The overall score for a Trial is the aggregate of all Test scores.

### Practice Points

Practice Points (PP) are awarded for answering Tests. The rules vary by Test type:

| Test Type | Right Answer | Wrong Answer |
|-----------|-------------|-------------|
| Options / Free Text | Earns PP | No PP |
| Date Test | Earns PP | Earns PP (learning from the correct answer) |
| Graph / Timeline | No PP per question | PP awarded on completion (proportional to questions) |

> Wrong answers on Date Tests earn PP because the user can only answer once — the app immediately shows the correct answer, and there is clear learning value in seeing the right date.

See also: [Practice Points](../practice-points.md)

---

## Accuracy

Accuracy is tracked at the **Trial level** and represents the percentage of Tests answered correctly on the first attempt.

* A Test is considered **correct** if the user's first answer is accepted.
* Subsequent attempts (after a wrong answer) do not improve the accuracy score for that Test.

Accuracy is displayed at the end of each Trial on the summary screen.
