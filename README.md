# Tome

Tome is a **language learning app** built around active recall. It helps users practise a target language through production-focused exercises — vocabulary, sentences, and grammar — organised into structured CEFR-level modules.

---

## Contents

1. [Language Learning](#1-language-learning)
2. [Skills](#2-skills)

---

## 1. Language Learning

Tome's language learning system is organised into **modules**, each targeting a specific CEFR level, theme, and communication goal. A module bundles vocabulary items, grammar concepts, and an exercise bank.

**Feature documentation:**

| Feature | Description |
|---|---|
| [Idea & Core Concepts](./docs/specs/language-learning/idea.md) | Vision, design principles, and system architecture |
| [Data Model](./docs/specs/language-learning/data-model.md) | Schemas for modules, vocabulary items, grammar concepts, and exercises |
| [Default Modules (Curriculum)](./docs/specs/language-learning/default-modules.md) | Full list of default Danish modules across all CEFR levels |
| [Home Page](./docs/specs/language-learning/home-page.md) | Language learning home page behaviour |
| [Vocabulary Practice](./docs/specs/language-learning/vocabulary-practice.md) | Vocabulary practice session flow and API integration |
| [Inversions](./docs/specs/language-learning/inversions.md) | Sentence inversion practice (Danish-specific word order rules) |
| [Sentence Practice](./docs/specs/language-learning/sentence-practice.md) | Sentence practice session flow and API integration |
| [Sentences](./docs/specs/language-learning/sentences.md) | Sentences list and on-demand sentence generation |
| [Knowledge Base](./docs/specs/language-learning/knowledge-base.md) | Knowledge base hub (vocabulary + sentences navigation) |
| [Vocabulary Management](./docs/specs/language-learning/vocabulary-management.md) | Adding and managing vocabulary items |
| [Source Management](./docs/specs/language-learning/source-management.md) | Managing language knowledge sources (data ingestion) |
| [Practice Summary](./docs/specs/language-learning/language-learning-summary.md) | End-of-session summary screen |

---

## 2. Skills

Skills are Claude Code slash commands available in this repo. They automate content generation and data seeding workflows.

| Skill | Trigger | What it does |
|---|---|---|
| `generate-module-content` | `"Generate content for module A2-02"` | Full 5-phase pipeline: generates vocabulary items, grammar concepts, an exercise bank, and the root module file for a given CEFR module. Runs distribution QA automatically. |
| `seed-module` | `"Seed module A1-01"` | Uploads a module definition (`<module>.json`) to the language API via `POST /tomelang/modules`. Supports dev and prod. |
| `seed-vocabulary` | `"Seed vocabulary for A1-01"` | Uploads vocabulary items (`<module>-vocabulary.json`) to the language API via `POST /tomelang/vocabularyItems/batch`. Supports dev and prod. |
| `seed-grammar` | `"Seed grammar for A1-01"` | Uploads grammar concepts (`<module>-grammar.json`) to the language API via `POST /tomelang/grammarConcepts/batch`. Supports dev and prod. |

All seeding skills read credentials from macOS Keychain — Claude never sees auth tokens or API URLs.
