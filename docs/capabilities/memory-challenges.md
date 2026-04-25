# Memory & Challenges

Tome helps users retain knowledge through a structured recall mechanism built on **Challenges**. For each topic in the knowledge base, a series of challenges is maintained to periodically push the user to retrieve information from memory.

---

## Challenges

A **Challenge** is a practice session scoped to a specific topic (or section of a topic). Its purpose is to test whether the user can still recall key information — not to teach new material.

- Each topic can have multiple challenges, each covering different aspects or sections.
- Challenges are designed to be short enough to complete in a single sitting.
- Completing a challenge updates the topic's **accuracy score** (see below).

---

## Questions

Each challenge is made up of a set of **questions**. Questions are generated based on the topic's content and are designed to provoke active recall rather than recognition.

- Questions target specific facts, concepts, or relationships within the topic.
- Multiple question types are supported (e.g. open answer, multiple choice, date recall, graph-based).
- The difficulty and framing of questions may vary across challenges to avoid rote memorisation.

---

## Scoring & Accuracy

After answering all questions in a challenge, each answer is **rated** — either automatically or with AI assistance — and a score is produced.

### Accuracy Score
The **accuracy score** expresses how well the user remembers a topic. It is derived from the scores of completed challenges.

- Each question answer contributes a partial score based on correctness and completeness.
- The challenge score is the aggregate of its question scores, normalised to a percentage.
- The topic's accuracy score reflects performance across recent challenges, giving more weight to recent attempts.

### What the Score Reflects
| Score range | Interpretation |
|-------------|----------------|
| 80–100 %    | Strong recall — the user remembers the topic well |
| 50–79 %     | Partial recall — some gaps remain |
| 0–49 %      | Weak recall — the topic needs significant review |

---

## Relationship to the Knowledge Base

Challenges are always linked to a **Topic** (and optionally to a specific **Section**) in the knowledge base. This means:

- A topic that has never been challenged has no accuracy score.
- As the user completes more challenges on a topic, the score stabilises and reflects long-term retention.
- Topics with a low accuracy score can be surfaced by Tome as **review recommendations**.

→ See [Knowledge Base](../kb.md)
