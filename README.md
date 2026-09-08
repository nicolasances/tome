# Tome

Tome is a **language learning app** built around active recall. It helps users practise a target language through production-focused exercises — vocabulary, sentences, and grammar — organised into structured CEFR-level modules.

---

## Contents

1. [Architecture](#1-architecture)
2. [Core Capabilities](#2-core-capabilities)
3. [Language Learning — Idea & Design](#3-language-learning--idea--design)
4. [Language Learning — Feature Specs](#4-language-learning--feature-specs)
5. [Skills](#5-skills)

---

## 1. Architecture

| Feature | Description |
|---|---|
| [Architecture](./docs/architecture/architecture.md) | Microservices architecture: the frontend PWA and the backend services it relies on |

---

## 2. Core Capabilities

Tome bundles two macro-capabilities — **Tome Topics** (knowledge retention) and **Language Learning** — on top of a shared knowledge base and gamification layer.

| Feature | Description |
|---|---|
| [Tome — App Specifications](./docs/capabilities/tome.md) | Core concepts: Topics, Sections, Remembering vs Learning |
| [Memory & Challenges](./docs/capabilities/memory-challenges.md) | Challenge-based recall mechanism and topic accuracy scoring |
| [Language Learning](./docs/capabilities/language/language-learning.md) | Language learning capability overview (vocabulary, sentences, active recall) |
| [Data Sources](./docs/capabilities/language/data-sources.md) | Connecting external learning materials (docs, PDFs, homework) as data sources |
| [Knowledge Base](./docs/kb.md) | Topics/Sections structure and GCS storage layout |
| [Badges](./docs/badges.md) | Gamification badges based on practice points and practices |
| [Practice Points](./docs/practice-points.md) | Practice Points (PP) accumulation rules |

---

## 3. Language Learning — Idea & Design

Tome's language learning system is organised into **modules**, each targeting a specific CEFR level, theme, and communication goal. A module bundles vocabulary items, grammar concepts, and an exercise bank.

| Feature | Description |
|---|---|
| [Idea & Core Concepts](./docs/idea/language-learning/idea.md) | Vision, glossary, and design principles (v2.0) |
| [Data Model](./docs/idea/language-learning/data-model.md) | Schemas for modules, vocabulary items, grammar concepts, and exercises |
| [Default Modules (Curriculum)](./docs/idea/language-learning/default-modules.md) | Full list of default Danish modules across all CEFR levels |
| [Practice Ladder](./docs/idea/language-learning/2026-07-29-practice-ladder.md) | Sequential rung phases for module practice |

---

## 4. Language Learning — Feature Specs

Feature specs for the v2.0 frontend experience, screen by screen.

| Feature | Description |
|---|---|
| [User Journeys](./docs/features/00-user-journeys.md) | Screen inventory and navigation map for the v2.0 frontend |
| [Home Dashboard](./docs/features/01-home-dashboard.md) | The motivational hub and landing screen |
| [Module Map](./docs/features/02-module-map.md) | Ordered list of a CEFR level's modules with lock/progress state |
| [Module Overview](./docs/features/03-module-overview.md) | The module hub: theme, communication goal, grammar and vocabulary |
| [Grammar Introduction](./docs/features/04-grammar-introduction.md) | Module step 1: instructional walkthrough of grammar concepts |
| [Practice Session](./docs/features/05-practice-session.md) | Module step 2: the repeating practice loop |
| [Module Test](./docs/features/06-module-test.md) | Module step 3: gated, scored assessment *(planned)* |
| [Level Test](./docs/features/07-level-test.md) | Cross-module CEFR-level assessment that promotes the learner |
| [Module Re-practice](./docs/features/08-module-re-practice.md) | Re-doing a completed module to change its proficiency signal |

---

## 5. Skills

Skills are Claude Code slash commands available in this repo. They automate content generation and data seeding workflows.

| Skill | Trigger | What it does |
|---|---|---|
| `generate-module-content` | `"Generate content for module A2-02"` | Full 5-phase pipeline: generates vocabulary items, grammar concepts, an exercise bank, and the root module file for a given CEFR module. Runs distribution QA automatically. |
| `post-module-content` | `"Post module content for A1-01"` | Seeds all content for a module (vocabulary, grammar concepts, module, exercises) to the language API in one pass. Supports dev and prod. |
| `generate-level-test-bank` | `"Generate the level test bank for A1"` | Generates and validates a CEFR level's ~60 cross-module exercises, drawn from the vocabulary and grammar of all its modules. |
| `post-level-test-bank` | `"Post the level test bank for A1 to dev"` | Posts a generated level test bank to the language API. Supports creating a new bank or appending to an existing one. |

All seeding skills read credentials from macOS Keychain — Claude never sees auth tokens or API URLs.
