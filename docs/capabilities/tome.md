# Tome — App Specifications

Tome is a **knowledge support app** that helps users build and maintain a strong personal knowledge base. It is designed around two core needs:

1. **Remembering** — refreshing memory on topics the user has already read or studied.
2. **Learning** — acquiring new knowledge in a structured, trackable way.

---

## Core Concepts

### Knowledge Base
Tome organises knowledge into **Topics**, each subdivided into **Sections**. This structure allows fine-grained practice and fits within the context constraints of AI-assisted question generation.

→ See [Knowledge Base](../kb.md)

### Challenges & Memory Refresh
For each topic, Tome maintains a set of **Challenges** — sessions of questions designed to push the user to recall what they have learned. The user's responses are scored and contribute to an **accuracy score** that reflects how well they remember the topic.

→ See [Memory & Challenges](./memory-challenges.md)

### Language Learning
Tome includes a dedicated module for practising a target language through active production exercises.

→ See [Language Learning](./language-learning.md)

---

## Design Principles

- **Active recall over passive reading** — Tome favours question-driven interaction to strengthen memory retention.
- **Incremental engagement** — Short, focused challenges encourage daily practice without overwhelming the user.
- **Honest scoring** — Accuracy scores reflect real performance to give the user a truthful picture of their knowledge.
