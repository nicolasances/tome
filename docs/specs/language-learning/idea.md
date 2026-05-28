# Tome — Language Learning
**Idea Document v2.0**
*Language: Danish | Framework: CEFR A1–C2*

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Core Concepts (Glossary)](#2-core-concepts-glossary)
3. [User Journey](#3-user-journey)
4. [Features](#4-features)
   - 4.1 [Home Dashboard](#41-home-dashboard)
   - 4.2 [Modules](#42-modules)
   - 4.3 [Vocabulary System](#43-vocabulary-system)
   - 4.4 [Grammar Concepts](#44-grammar-concepts)
   - 4.5 [Exercises](#45-exercises)
   - 4.6 [CEFR Level Progression](#46-cefr-level-progression)
5. [Data Models](#5-data-models)
6. [AI Usage](#6-ai-usage)
7. [Key User Stories](#7-key-user-stories)
8. [Open Questions](#8-open-questions)
9. [Constraints & Assumptions](#9-constraints--assumptions)

---

## 1. Purpose & Scope

### 1.1 What is this?
Tome Language Learning is a structured, module-based app for learning Danish. It uses the CEFR framework (A1–C2) as its progression spine. The app combines vocabulary mastery tracking, contextual grammar instruction, and spaced-repetition exercises within thematic learning modules.

### 1.2 Who is it for?
Adult learners who want to progress from zero Danish towards conversational and eventually professional fluency, in a self-directed but structured way.

### 1.3 What problems does it solve?
- Most apps (e.g. Duolingo) lack a clear grammar progression tied to real communication goals.
- Learners don't know what they've truly mastered vs. what they've just seen once.
- There is no structured path from beginner to advanced; difficulty is opaque.

### 1.4 Out of scope (v2.0)
- Multiple languages (Danish only for now)
- Social / multiplayer features
- Speech recognition / pronunciation feedback
- Offline mode
- Monetisation / subscription logic

---

## 2. Core Concepts (Glossary)

| Term | Definition |
|---|---|
| **CEFR Level** | The user's current proficiency tier: A1, A2, B1, B2, C1, C2. The user has exactly one active level at a time. |
| **Module** | A self-contained learning unit with a theme, a communication goal, a vocabulary set, and a sequence of exercises. |
| **Vocabulary Item** | A single learnable unit: a word, verb, expression, or pattern sentence. |
| **Mastery Score** | A float [0.0 – 1.0] representing how well the user knows a vocabulary item. Computed from exercise history. |
| **Grammar Concept** | A named grammatical topic (e.g. "Inversion", "Modal Verbs") that appears inside modules. |
| **Exercise** | A single interactive task presented to the user (translation, fill-in-the-blank, multiple choice, etc.). |
| **Level Test** | A cumulative assessment that unlocks the next CEFR level when passed. |
| **Review Session** | A standalone vocabulary drill session, not tied to any module. |

---

## 3. User Journey

```
Sign up / onboarding
        │
        ▼
  Placement (optional)  ──── skipped ──▶  Start at A1
        │
        ▼
  Home Dashboard  (shows current level, active modules, vocabulary stats)
        │
   ┌────┴────────────────────┐
   ▼                         ▼
Open Module              Review Vocabulary
   │                         │
   ▼                         ▼
Step 1: Vocabulary       Flash-card style
Step 2: Grammar          translation drill
Step 3: Exercises        (any vocab items,
Step 4: Module Test      filtered by label)
   │
   ▼
Module Complete → Vocabulary updated
   │
   ▼  (when all modules at level are done)
Level Test → Pass → Unlock next CEFR level
```

---

## 4. Features

### 4.1 Home Dashboard

The entry point after login. Shows:
- Current CEFR level badge (e.g. A1)
- Overall vocabulary mastery (e.g. "47 words mastered")
- Active / in-progress modules
- Quick action: "Continue", "New Module", "Review Vocabulary"
- Streak or last-active indicator (for motivation)

**Tracking requirement:** The user's CEFR level must always be visible here.

---

### 4.2 Modules

#### 4.2.1 Module Attributes

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `title` | string | Human-readable name, e.g. "Ordering at a Café" |
| `theme` | string | Broad topic: food, work, travel, health, etc. |
| `communicationGoal` | string | What the user can do after completing it, e.g. "Order food and ask for the bill in Danish" |
| `cefrLevel` | enum A1–C2 | The level this module belongs to |
| `vocabularySet` | VocabularyItem[] | The words/verbs/expressions taught in this module |
| `grammarConcepts` | GrammarConcept[] | The grammar topics covered (see §4.4) |
| `status` | enum | `locked`, `available`, `in_progress`, `completed` |

#### 4.2.2 Module Execution Flow

Each module runs through the following steps in order:

**Step 1 — Vocabulary Introduction**
The user is shown each vocabulary item in the module's set and asked to translate it (Danish → English or English → Danish). Items are presented in this order:
1. Nouns
2. Verbs
3. Adjectives
4. Expressions & chunks
5. Pattern sentences

Each answer updates the Mastery Score for that item.

**Step 2 — Grammar Concept Introduction**
For each Grammar Concept in the module, the app presents a short explanation with 1–2 Danish examples. The user does not need to interact; this is purely instructional.

*Open question: Should grammar explanations be AI-generated on demand, or authored content? — Recommend AI-generated for v2, with the user able to ask follow-up questions.*

**Step 3 — Contextual Exercises**
A sequence of exercises that use the module's vocabulary and grammar concepts in context. See §4.5 for exercise types.

**Step 4 — Module Test**
A short assessment (5–10 questions) testing the vocabulary and grammar of this module. Passing threshold: 80%. The module moves to `completed` when passed. Failing allows the user to retry after reviewing errors.

#### 4.2.3 Module Creation

The user can request a new module by describing a scenario in natural language, e.g.:
> *"Make a module about discussing the weather with colleagues."*

The system creates the module with:
- A generated title, theme, and communication goal
- A vocabulary set appropriate to the CEFR level
- Grammar concepts relevant to the theme and level
- The full exercise sequence

Modules are created for the user's **current CEFR level**. Once created, they appear in the module list as `available`.

---

### 4.3 Vocabulary System

#### 4.3.1 Vocabulary Item Attributes

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `danish` | string | The Danish word/phrase |
| `english` | string | English translation |
| `type` | enum | See taxonomy below |
| `tags` | string[] | Additional labels (e.g. module theme, topic) |
| `masteryScore` | float 0–1 | Current mastery level |
| `lastReviewed` | timestamp | When last seen in an exercise |
| `history` | ExerciseResult[] | Record of past answers used to compute mastery |

#### 4.3.2 Vocabulary Type Taxonomy

| Type | Examples |
|---|---|
| `noun` | hund, bil, kaffe |
| `verb` | spise, gå, ville |
| `adjective` | stor, rød, hurtig |
| `adverb` | hurtigt, meget, aldrig |
| `expression` | Hvad koster det?, Mange tak |
| `chunk` | Jeg vil gerne have…, Kan jeg få…? |
| `pattern_sentence` | Jeg er ikke sikker på, om… |
| `connector` | fordi, men, selvom, hvis, når |
| `pronoun` | jeg, dig, sin |
| `number` | en, to, tre |

#### 4.3.3 Mastery Score Computation

The Mastery Score for a vocabulary item is derived from the user's exercise history for that item:
- A correct answer increases it (more weight if the answer was quick / unprompted).
- An incorrect answer decreases it.
- Items not reviewed for a long time decay slightly (spaced repetition).
- Score of **0.8 or above** = item is considered "mastered".

*The exact algorithm can be tuned, but the principle is standard SRS (Spaced Repetition System).*

#### 4.3.4 Vocabulary Review Session

A standalone session, accessible from the Home Dashboard at any time.

The user can optionally filter by:
- CEFR level
- Vocabulary type (noun, verb, etc.)
- Mastery score range (e.g. "only items I'm struggling with")
- Module / theme tag

The session presents items as translation cards (Danish → English or English → Danish), updating mastery scores after each answer.

---

### 4.4 Grammar Concepts

Each module includes a subset of the grammar concepts below, chosen based on the module's CEFR level. Not all concepts are available at all levels.

#### Tenses
| Concept | Available from |
|---|---|
| Present (nutid) | A1 |
| Preterite / Simple past (datid) | A2 |
| Present Perfect (førnutid med "har/er") | A2 |
| Future with "skal/vil" | A2 |
| Future with "kommer til at" | B1 |
| Past Perfect | B2 |

#### Sentence Structure
| Concept | Available from |
|---|---|
| Main clause word order (SVO) | A1 |
| Inversion (verb-second rule) | A2 |
| Question formation | A1 |
| Negation placement ("ikke") | A1 |
| Subordinate clause word order | B1 |

#### Verbs
| Concept | Available from |
|---|---|
| Regular verb conjugation | A1 |
| Modal verbs (kan, skal, vil, må, bør) | A1 |
| Auxiliary verbs (har, er, blev) | A2 |
| Reflexive verbs | B1 |
| Separable expressions (phrasal verbs) | B1 |
| Infinitive usage | A2 |

#### Nouns
| Concept | Available from |
|---|---|
| Grammatical gender (en/et) | A1 |
| Definite/indefinite articles | A1 |
| Plural forms | A1 |
| Definiteness (double definiteness) | A2 |

#### Pronouns
| Concept | Available from |
|---|---|
| Personal pronouns | A1 |
| Possessive pronouns | A2 |
| Reflexive pronouns (sig/selv) | B1 |
| Demonstrative pronouns (denne/dette) | B1 |

#### Adjectives
| Concept | Available from |
|---|---|
| Basic agreement (en/et/plural) | A1 |
| Predicative vs. attributive use | A2 |
| Comparison (større, størst) | A2 |
| Common descriptive patterns | A1 |

#### Connectors & Subordinate Clauses
| Concept | Available from |
|---|---|
| Basic connectors (og, men, eller) | A1 |
| Causal/conditional connectors (fordi, hvis, når, selvom, selv hvis) | A2 |
| Subordinate clauses with word-order change | B1 |
| Embedded clauses | B2 |

#### Advanced / Natural Speech (Later Levels)
| Concept | Available from |
|---|---|
| Common contractions (det's, jeg's) | B2 |
| Reductions in spoken Danish | C1 |
| Discourse fillers (altså, jo, nok) | B2 |
| Natural speech rhythm & prosody notes | C1 |

---

### 4.5 Exercises

Exercises are the interactive tasks presented during module execution and review. All exercises are tied to vocabulary items and/or grammar concepts.

#### Exercise Types

| Type | Description | Tests |
|---|---|---|
| **Translation (passive)** | Show Danish word/sentence → user writes English | Vocabulary recognition |
| **Translation (active)** | Show English word/sentence → user writes Danish | Vocabulary production |
| **Multiple Choice** | Present a sentence with a blank → choose the correct word from 4 options | Vocabulary or grammar |
| **Fill in the Blank** | Present a sentence with a blank → user types the correct word/form | Grammar application |
| **Sentence Reorder** | Words are given out of order → user arranges them correctly | Sentence structure |
| **Error Correction** | A sentence is shown with a mistake → user identifies and corrects it | Grammar accuracy |
| **Conjugation Drill** | A verb is given in infinitive → user conjugates it for a given tense and subject | Verb tenses |

#### Explanation on Demand

After any exercise where the user answers **incorrectly**, they can tap "Explain my mistake." The app provides:
- What the correct answer is
- Why it is correct (grammar rule or vocabulary note)
- The rule stated simply (in English)
- A second Danish example demonstrating the same rule

This explanation is generated dynamically by the AI.

---

### 4.6 CEFR Level Progression

#### Unlocking a New Level

The user's CEFR level starts at A1. To progress to A2 (and so on), the user must:
1. Complete a minimum number of modules at the current level *(threshold TBD — suggest: all available modules, or at least 5)*.
2. Pass the **Level Test** for the current level.

#### Level Tests

A Level Test is a comprehensive assessment covering:
- Vocabulary from all modules completed at that level
- Grammar concepts introduced at that level
- 20–30 questions, mix of exercise types

Passing threshold: **75%**. If failed, the user receives a summary of weak areas and can retry after a cooldown period *(suggest: no cooldown for v2, retry freely)*.

#### CEFR Level Visibility

The user's current CEFR level is always visible on the Home Dashboard. It should be prominent — it is one of the key motivational anchors of the app.

---

## 5. Data Models

### User
```
User {
  id
  name
  email
  cefrLevel          // A1 | A2 | B1 | B2 | C1 | C2
  createdAt
  lastActiveAt
}
```

### VocabularyItem
```
VocabularyItem {
  id
  danish
  english
  type               // noun | verb | adjective | ... (see §4.3.2)
  tags               // string[]
  cefrLevel          // level at which this item was introduced
  masteryScore       // float 0.0–1.0
  lastReviewed       // timestamp | null
  exerciseHistory    // ExerciseResult[]
}
```

### ExerciseResult
```
ExerciseResult {
  exerciseType
  isCorrect
  userAnswer
  correctAnswer
  timestamp
  moduleId           // null if from review session
}
```

### Module
```
Module {
  id
  title
  theme
  communicationGoal
  cefrLevel
  status             // locked | available | in_progress | completed
  vocabularySet      // VocabularyItem[]
  grammarConcepts    // GrammarConcept[]
  createdAt
  isUserGenerated    // boolean
}
```

### GrammarConcept
```
GrammarConcept {
  id
  name               // e.g. "Inversion"
  category           // tenses | sentence_structure | verbs | nouns | ...
  cefrLevelIntroduced
  explanation        // short text (AI-generated or authored)
  examples           // DanishExample[] — each with danish + english
}
```

### LevelTest
```
LevelTest {
  id
  cefrLevel          // the level being tested
  userId
  score              // float 0–1
  passed             // boolean
  takenAt            // timestamp
  weakAreas          // GrammarConcept[] | VocabularyItem[]
}
```

---

## 6. AI Usage

The app is AI-powered in several places. These are the AI touchpoints:

| Feature | AI Role |
|---|---|
| Module creation | Generate title, communication goal, vocabulary set, grammar concepts, and full exercise sequence given a user prompt and CEFR level |
| Exercise generation | Generate contextually appropriate exercises (translation, fill-in-blank, etc.) for a given vocabulary set and grammar concept set |
| Error explanation | Explain why a user's answer was wrong, with rule + example |
| Grammar concept explanation | Generate a short, friendly explanation of a grammar concept with 1–2 Danish examples |
| Vocabulary hint | On request, give a hint for a translation exercise without revealing the full answer |

AI calls should always be aware of the user's current CEFR level so that vocabulary and explanations are pitched at the right complexity.

---

## 7. Key User Stories

| # | As a user, I want to… | So that… |
|---|---|---|
| US-01 | See my current CEFR level on the home screen | I always know where I stand |
| US-02 | Create a module from a natural language prompt | I can learn vocabulary relevant to my real life |
| US-03 | Run through a module step by step | I learn both vocabulary and grammar in context |
| US-04 | Ask for an explanation when I get something wrong | I understand the rule, not just the right answer |
| US-05 | Do a vocabulary review session at any time | I can practise outside of modules |
| US-06 | Filter vocabulary review by type or mastery | I can focus on what I'm weak at |
| US-07 | See my mastery score per vocabulary item | I know which words I've truly learned |
| US-08 | Take a Level Test when I feel ready | I can unlock the next CEFR level |
| US-09 | Retry a module test if I fail | I'm not blocked; I can keep improving |
| US-10 | See my weaknesses after a Level Test | I know exactly what to study next |

---

## 8. Open Questions

These are things not yet decided that will need resolution before or during build:

| # | Question | Options / Notes |
|---|---|---|
| OQ-01 | How many modules are required to unlock a Level Test? | All modules? Min 5? Any count? |
| OQ-02 | Should grammar concepts be AI-generated per session, or stored as authored content? | AI-generated is more flexible; authored is more controllable |
| OQ-03 | Does the mastery score decay over time (true SRS)? | Recommended: yes, with gentle decay |
| OQ-04 | Should there be an optional placement test at onboarding? | Allows non-beginners to skip A1 |
| OQ-05 | How is the module exercise sequence structured — fixed length or adaptive? | Adaptive (stop when mastery threshold hit) is better UX |
| OQ-06 | Can the user add custom vocabulary items outside of modules? | Nice-to-have for v2 |
| OQ-07 | Should the user be able to generate modules at a level above their current? | Probably not — keep progression gated |
| OQ-08 | What is the retry cooldown for the Level Test? | Suggest: none for v2 |

---

## 9. Constraints & Assumptions

- **Danish only** for v2.0. The data model should be language-agnostic where possible to allow future expansion.
- **Mobile-first** UI assumed (though not specified). Exercises must work well on a phone screen.
- **AI backend** is available and can handle module generation, exercise generation, and explanations.
- **No audio** in v2.0 — listening and speaking exercises are out of scope.
- The vocabulary taxonomy (§4.3.2) is fixed for v2.0 but can be extended.
- CEFR levels above B2 will have limited pre-built modules at launch; user-generated modules fill the gap.
