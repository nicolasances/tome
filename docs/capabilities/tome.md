# Tome — App Specifications

Tome is a web app to help memorise information from personal reading and study. It is built around a Knowledge Base with active recall via Challenges.

---

## Core Concepts

### 1. Topic

A **Topic** represents an entire source of information the user wants to remember — a book, an article, a blog post, or any other document. For example, *War and Peace* or *A Brief History of Time* would each be a single Topic.

Topics are the foundation of the Knowledge Base. Each Topic is split into **Sections** (chapters, parts, or logical segments), and Q&A is typically generated at the section level to keep questions focused.

See also: [Knowledge Base](../kb.md)

---

### 2. Challenges

**Challenges** are a way to gamify the memorisation of Topics. They correspond to different difficulty levels and test the user's recall in different ways.

The following challenges are currently supported:

| Challenge | Description |
|-----------|-------------|
| **Juice Challenge** | The easiest challenge. The user must recall the core concepts or events of the topic, the core dates, and the key people involved. |

See also: [Memory & Challenges](./memory-challenges.md)

---

### 3. Trial

A **Trial** is an instance of a Challenge.

When a user starts a Challenge, a Trial is created. Each Trial tracks the user's progress and score for that specific run of the Challenge.

---

### 4. Tests

**Tests** are the core element of Challenges and Trials. Each challenge is composed of a series of Tests.

Tests are questions the user must answer to prove they have memorised the Topic. Tests come in different types:

| Type | Description |
|------|-------------|
| **Date Test** | The user is asked to recall a date or time period associated with an event. |
| **Free Text Test** | The user writes a free-text answer to an open question about the topic. |
| **Genealogic Tree Test** | The user reconstructs a family tree or hierarchical relationship. |
| **Timeline Test** | The user places events in the correct chronological order. |

See also: [Memory & Challenges](./memory-challenges.md)

---

### 5. Language Learning

Tome supports language-learning exercises to help the user practise a target language through active recall.

See: [Language Learning](./language-learning.md)

---

## Design Principles

* **Active Recall** — Tome focuses on retrieving information from memory rather than passive re-reading.
* **Spaced Learning** — Challenges and Trials are designed to encourage regular, spaced practice.
* **Gamification** — Practice Points and Badges reward consistent practice.
* **Progressive Difficulty** — Challenges can vary in difficulty to match the user's growing familiarity with the material.
