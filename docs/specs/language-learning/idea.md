# Tome — Language Learning
**Idea Document v2.0**
*Language: Danish | Framework: CEFR A1–C2*

---

## Table of Contents

1. [Purpose & Scope](#1-purpose--scope)
2. [Core Concepts (Glossary)](#2-core-concepts-glossary)
3. [Features](#3-features)
   - 3.1 [Modules](#31-modules)
   - 3.2 [Vocabulary System](#32-vocabulary-system)
   - 3.3 [Grammar Concepts](#33-grammar-concepts)
   - 3.4 [Exercises](#34-exercises)
   - 3.5 [CEFR Level Progression](#35-cefr-level-progression)
   - 3.6 [Dialog Sessions](#36-dialog-sessions)
   - 3.7 [Analyze Content](#37-analyze-content)
4. [Data Models](./data-model.md)
5. [AI Usage](#5-ai-usage)
6. [Key User Stories](#6-key-user-stories)
7. [Open Questions](#7-open-questions)
8. [Constraints & Assumptions](#8-constraints--assumptions)

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

## 3. Features

### 3.1 Modules

A module is a self-contained learning unit. See [Data Model](./data-model.md#module) for the full Module schema.

*Note: Module status (`locked`, `available`, `in_progress`, `completed`) is tracked per-user in UserModuleProgress, not on the module itself.*

#### 3.1.1 Module Execution Flow

Each module runs through the following steps in order. **Mastery scores are only updated during the Module Test (Step 4), not during practice (Steps 1 and 3).**

**Step 1 — Vocabulary Introduction**

1. The user is shown each vocabulary item in English and asked to translate to Danish
2. Items are presented in this order: Nouns → Verbs → Adjectives → Expressions & chunks → Pattern sentences
3. If the user is wrong, the correct answer is shown and the user moves to the next word
4. "Explain my mistake" is available on demand after incorrect answers (AI-generated)
5. When all words are done, any missed words are retried until the user gets them all correct
6. Mastery scores are **not** updated during this step

**Step 2 — Grammar Concept Introduction**

For each Grammar Concept in the module, the app presents a short explanation with 1–2 Danish examples. The user does not need to interact; this is purely instructional.

Grammar explanations are AI-generated on demand. 

**Step 3 — Contextual Exercises (Practice)**

1. A sequence of exercises using the module's vocabulary and grammar in context (see §3.4 for exercise types)
2. If the user is wrong, the correct answer is shown and the user moves to the next exercise
3. "Explain my mistake" is available on demand after incorrect answers (AI-generated)
4. When all exercises are done, any missed exercises are retried until the user gets them all correct
5. Mastery scores are **not** updated during this step

**Step 4 — Module Test (Locked)**

The test is **locked** until `testUnlockDelayHours` (default: 4 hours) have passed after completing Step 3. This enforces spaced repetition — the user cannot test immediately while memory is fresh.

Once unlocked:
1. An assessment (20 questions) testing the module's vocabulary and grammar
2. Uses the same exercise types as Step 3
3. **50% fresh exercises** (not seen during practice) + **50% may repeat** from practice
4. Answers are **not shown** during the test — user completes all questions first
5. At the end, the user sees:
   - Final score (% correct)
   - All questions with their answers: for incorrect answers, both the user's answer and the correct answer are shown
   - "Explain my mistake" available on demand for any incorrect answer (AI-generated)
6. **Mastery scores are updated** based on test performance

**Passing:**
- Threshold: **80%**
- On pass: module status → `completed`
- On fail: the attempt is recorded (score + timestamp) in the user's test history for this module; user can retry after `testRetryDelayMinutes` (default: 20 minutes); the test draws a new selection from the exercise bank

#### 3.1.2 Configurable Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `testUnlockDelayHours` | 4 | Hours after completing practice before test unlocks |
| `testRetryDelayMinutes` | 20 | Minutes after failed test before retry is allowed |
| `testFreshExercisePercent` | 50 | % of test exercises that must be unseen during practice |
| `testPassThreshold` | 80 | % correct required to pass the module test |


#### 3.1.3 Default Module Generation

The default modules defined in the curriculum are seeded during development, not generated on demand. The process:

1. **Module shell** — human-authored: theme, communication goal, grammar concepts, and vocabulary focus are defined in the curriculum specification. The modules and their shell are defined in [Default Modules)](./default-modules.md).

2. **Vocabulary set** — AI-generated from the shell: given the module's theme, CEFR level, and grammar focus, the AI produces the vocabulary items (word, translation, type, tags). No human review step; the shell provides sufficient constraint.

3. **Exercise bank** — AI-generated immediately after the vocabulary set: a bank of ~50 exercises covering the vocabulary and grammar concepts (see §3.4.3 for bank mechanics).

4. **Storage** — the vocabulary set and exercise bank are stored in the database and are identical for all users accessing the same default module.

This seeding runs once during development. If a default module's shell is updated, its vocabulary set and exercise bank are regenerated.

---

### 3.2 Vocabulary System

A vocabulary item is a single learnable unit. See [Data Model](./data-model.md#vocabularyitem) for the full VocabularyItem schema.

*Note: User-specific tracking (masteryScore, lastReviewed, history) is stored in UserVocabularyProgress, not on the vocabulary item itself. This allows the same word to be referenced by multiple modules while maintaining a single global mastery score per user.*

#### 3.2.1 Vocabulary Type Taxonomy

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

#### 3.2.2 Mastery Score Computation

The Mastery Score for a vocabulary item is derived from the user's exercise history for that item:
- A correct answer increases it (more weight if the answer was quick / unprompted).
- An incorrect answer decreases it.
- Items not reviewed for a long time decay slightly (spaced repetition).
- Score of **0.8 or above** = item is considered "mastered".

*The exact algorithm can be tuned, but the principle is standard SRS (Spaced Repetition System).*

#### 3.2.3 Vocabulary Review Session

A standalone session, accessible from the Home Dashboard at any time.

The user can optionally filter by:
- CEFR level
- Vocabulary type (noun, verb, etc.)
- Mastery score range (e.g. "only items I'm struggling with")
- Module / theme tag

The session presents items as translation cards (Danish → English or English → Danish), updating mastery scores after each answer.

---

### 3.3 Grammar Concepts

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

### 3.4 Exercises

Exercises are the interactive tasks presented during module execution and review. All exercises are tied to vocabulary items and/or grammar concepts.

#### Exercise Types

| Type | Description | Tests |
|---|---|---|
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

#### 3.4.3 Exercise Generation Strategy

Exercises are **never generated during a user's live session**. All AI generation runs upfront (at module creation or seeding) or in the background between sessions. This keeps session latency zero and AI costs bounded.

**The exercise bank**

Each module maintains an exercise bank of approximately 50 exercises — roughly 3× a typical session size. The bank is generated by AI when the module is created (default modules: at seeding time; user-generated modules: at creation time) and stored in the database. The bank is shared across all users for default modules; it is per-user for user-generated modules.

**Mastery-aware session selection**

At session start, the system draws a session-sized subset from the bank using the following algorithm — no AI involved:

1. Vocabulary items with mastery score > 0.85 are deprioritized (skipped unless the bank is nearly empty).
2. Remaining items are weighted by `(1 − masteryScore)` — lower mastery → higher probability of appearing.
3. Items the user answered incorrectly in their most recent session get an additional priority boost.
4. A random sample is drawn according to the weights, ensuring each vocabulary item appears in at least one exercise per session on first attempt.

The exercise *content* is fixed (from the bank). The *selection* is personalized to the user's current mastery state.

**Bank refresh**

When the bank falls below one full session's worth of exercises that the user has not yet seen, the system triggers an async background job to generate additional exercises. The user is never blocked waiting for this. This also naturally handles the case where a user wants more exercises than the initial bank provides.

**Retry experience**

When a user retakes a module after failing the test, the session draws again from the bank using the same weighted selection. Because the weights reflect current mastery (which has changed since the last attempt), and because the bank is larger than a single session, the retry feels fresh without requiring new generation.

---

### 3.5 CEFR Level Progression

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

### 3.6 Dialog Sessions

A Dialog Session is a free-form, AI-driven conversation in Danish. Unlike modules (which are structured and exercise-based), a dialog is an open-ended conversation where the user types in Danish and an AI interlocutor responds — calibrated to the user's current CEFR level while covering any topic the user chooses.

#### 3.6.1 Purpose

Dialog Sessions train production and fluency under realistic communicative pressure. They are complementary to modules: modules teach rules and vocabulary in a controlled environment; dialogs force the user to apply them in real time, under the pressure of a responding interlocutor. A dialog on a topic like "microservices architecture" or "managing a team restructure" puts professional vocabulary to use in an unscripted context.

#### 3.6.2 Session Setup

Before starting, the user configures:

| Setting | Options |
|---|---|
| **Topic** | Any free-text description, e.g. "microservices architecture", "climate policy", "negotiating a salary", "discussing a board report" |
| **AI persona** | `Peer` — natural conversation; `Challenger` — pushes back on the user's positions; `Interviewer` — asks questions as if in a job interview or press call; `Expert` — plays a domain expert the user must engage with at depth |
| **Correction mode** | `Silent` — no corrections during dialog, feedback only at end; `Inline` — AI briefly notes significant errors in-context then continues; `Strict` — AI pauses on each notable error before proceeding |

The AI's language complexity is calibrated to the user's current CEFR level. The topic domain is unconstrained.

#### 3.6.3 During the Session

- The user types in Danish; the AI responds in Danish, maintaining the chosen persona throughout.
- In `Inline` and `Strict` correction modes, corrections are woven briefly into the AI's response — never breaking the conversation to lecture. Example: *"Du sagde 'jeg har gået', men her er det 'jeg gik' — afsluttet handling. Men det er en god pointe om..."*
- The AI never switches to English during the session.

#### 3.6.4 Post-Session Feedback

After the dialog ends, the AI generates a structured session report:

- **Grammar issues** — specific errors from the conversation, with the correct form and a one-line rule
- **Vocabulary gaps** — words/expressions the user could have used but didn't (missed opportunities)
- **Vocabulary used correctly** — positive reinforcement
- **Suggested modules** — modules that would address recurring weaknesses
- **Overall note** — brief qualitative assessment of fluency, register, and confidence

#### 3.6.5 Integration with the Learning System

- Words the user produces correctly in a dialog contribute to their mastery score at a lower weight than structured exercise answers.
- Grammar errors identified during a dialog can flag corresponding modules for review, surfaced on the Home Dashboard.
- Dialog sessions do not count towards the module completion threshold for Level Tests, but may be used as supporting signal.

---

### 3.7 Analyze Content

The "Analyze Content" feature lets the user paste any Danish text — a podcast transcript, article, document, email, or contract clause — and receive a curriculum gap report. The purpose is diagnostic and routing: it shows the user what they would need to master to understand and produce content like this, and maps that to their existing curriculum path.

#### 3.7.1 Input

The user pastes text directly into the app. Any length and any register is accepted.

*Note: URL ingestion and automatic audio transcript fetching are out of scope for v2.0. The user provides text manually. These are candidates for a future version.*

#### 3.7.2 Analysis Output — the Content Report

| Section | Content |
|---|---|
| **CEFR level estimate** | Approximate level of the pasted content, e.g. "This text is approximately B2–C1" |
| **Vocabulary coverage** | % of the content's vocabulary items already in the user's set; list of new items |
| **Grammar coverage** | Grammar patterns detected in the text; which are covered by completed modules, which are ahead in the curriculum, which are not in any default module |
| **Curriculum routing** | The specific default modules that address the identified gaps, ranked by impact |
| **Readiness estimate** | "After completing modules X, Y, Z, you will be equipped to read and produce content at this level" |

#### 3.7.3 Actions from the Report

From the Content Report, the user can:
- **Add unknown vocabulary** to their review pool (word-level quick win, immediate)
- **Navigate to a suggested module** directly from the report
- **Generate a custom module** — if a gap is not covered by any existing default module, the user can request a targeted module generated using the pasted content as the context corpus. This follows the same module structure as §3.1.3.

#### 3.7.4 Architectural Note

The content analysis logic is designed as an isolated, callable component. In a future version, this could be exposed so that an external agent (e.g., a personal assistant that processes documents the user reads) can invoke the analysis and return a gap report without going through the app UI.

---

## 5. AI Usage

The app is AI-powered in several places. These are the AI touchpoints:

| Feature | AI Role |
|---|---|
| Module creation (user-generated) | Generate title, communication goal, vocabulary set, grammar concepts, and exercise bank (~50 exercises) given a user prompt and CEFR level — runs once at creation time, not at session time |
| Module seeding (default modules) | Given a module shell (theme, goal, grammar concepts), generate the vocabulary set and exercise bank — runs once during development per default module |
| Exercise bank refresh | Generate additional exercises for a module whose bank has fallen below one session's capacity — runs asynchronously in the background, never during a live session |
| Error explanation | Explain why a user's answer was wrong, with rule + example |
| Grammar concept explanation | Generate a short, friendly explanation of a grammar concept with 1–2 Danish examples |
| Vocabulary hint | On request, give a hint for a translation exercise without revealing the full answer |
| Dialog session — response | Generate the AI interlocutor's turn in Danish, maintaining the chosen persona (peer / challenger / interviewer / expert) at the user's CEFR level |
| Dialog session — inline correction | Detect and briefly correct a grammar or vocabulary error in the user's message, woven into the AI's response, without breaking the conversation flow |
| Dialog session — post-session feedback | Analyze the full dialog transcript and produce a structured DialogFeedback report: grammar issues, vocabulary gaps, module suggestions |
| Content analysis — vocabulary | Identify vocabulary items in a pasted text; map against the user's existing vocabulary set to produce coverage and gap lists |
| Content analysis — grammar | Detect grammar patterns in a pasted text; map against the grammar concept taxonomy and the user's completed modules |
| Content analysis — report generation | Synthesize vocabulary and grammar findings into a ContentReport with CEFR level estimate, readiness assessment, and curriculum routing |

AI calls should always be aware of the user's current CEFR level so that vocabulary and explanations are pitched at the right complexity.

---

## 6. Key User Stories

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
| US-11 | Start a dialog session on any topic I choose, with an AI that challenges my positions | I can practise producing Danish freely, not just doing exercises |
| US-12 | Receive a structured feedback report after each dialog session | I know which grammar and vocabulary gaps to address next |
| US-13 | Paste a Danish text I encountered (podcast transcript, document, article) and see a curriculum gap report | I know which modules will get me to the point where I can understand and produce content like this |
| US-14 | Add unknown vocabulary from a pasted text directly to my review pool | I can act immediately on gaps without waiting to complete a full module |
| US-15 | See which existing modules cover the gaps in a pasted text | The app routes me through its curriculum rather than always generating something new |

---

## 7. Open Questions

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
| OQ-09 | Should dialog sessions have a time limit or minimum length? | A minimum (e.g. 5 exchanges) ensures meaningful feedback; no maximum needed |
| OQ-10 | Should dialog sessions contribute to CEFR level progression? | Probably not for v2 — keep progression gated to module completion + Level Test |
| OQ-11 | How should the content analysis handle texts that are too far above the user's level? | Show the gap but still route — even C1 content is useful as a destination map for a B1 learner |
| OQ-12 | Should the content analysis expose an external API for agent-driven invocation? | Recommended for v3; design the function as isolated in v2 to make this straightforward later |
| OQ-13 | What is the minimum text length for a meaningful content analysis? | Suggest: at least 50 words; shorter inputs produce unreliable CEFR estimates |

---

## 8. Constraints & Assumptions

- **Danish only** for v2.0. The data model should be language-agnostic where possible to allow future expansion.
- **Mobile-first** UI assumed (though not specified). Exercises must work well on a phone screen.
- **AI backend** is available and can handle module generation, exercise generation, and explanations.
- **No audio** in v2.0 — listening and speaking exercises are out of scope.
- The vocabulary taxonomy (§3.2.1) is fixed for v2.0 but can be extended.
- CEFR levels above B2 will have limited pre-built modules at launch; user-generated modules fill the gap.
