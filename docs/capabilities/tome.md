# Tome — App Specifications

Tome is a **knowledge support app** that helps users build and maintain a strong personal knowledge base. It is designed around two core needs:

1. **Remembering** — refreshing memory on topics the user has already read or studied.
2. **Learning** — acquiring new knowledge in a structured, trackable way.

---

## Core Concepts

### Topic
A Topic is something the user needs to remember — a book, an article, or any document they have read.

Topics are organised into **Sections**, allowing fine-grained practice and fitting within the context constraints of AI-assisted question generation.

→ See [Knowledge Base](../kb.md)

### Challenges
Challenges are a way to gamify the memorisation of Topics. There are different types of challenges, typically corresponding to difficulty levels.

- **Juice Challenge** — the easiest challenge type. The user is asked to recall:
  - The core concepts or events of the topic
  - The core dates and people involved

→ See [Memory & Challenges](./memory-challenges.md)

### Trial
A Trial is an instance of a Challenge. When a user starts a Challenge, a Trial is created.

### Tests
Tests are the core element of Challenges and Trials. Each challenge is made up of a series of Tests — questions the user must answer to prove they have memorised the Topic.

Supported test types:
- Date Tests
- Free Text Tests
- Genealogic Tree Tests
- Timeline Tests

### Language Learning
Tome includes a dedicated module for practising a target language through active production exercises.

→ See [Language Learning](./language-learning.md)

---

## Design Principles

- **Active recall over passive reading** — Tome favours question-driven interaction to strengthen memory retention.
- **Incremental engagement** — Short, focused challenges encourage daily practice without overwhelming the user.
- **Honest scoring** — Accuracy scores reflect real performance to give the user a truthful picture of their knowledge.
