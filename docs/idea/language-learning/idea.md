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
   - 3.6 [Analyze Content](#36-analyze-content)
4. [Data Models](./data-model.md)
5. [AI Usage](#5-ai-usage)
6. [Key User Stories](#6-key-user-stories)
7. [Open Questions](#7-open-questions)
8. [Constraints & Assumptions](#8-constraints--assumptions)
9. [Ideas for Future Versions](#9-ideas-for-future-versions)

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
| **Vocabulary Item** | A single learnable unit: a word, verb, phrase, or pattern. |
| **Mastery Score** | A float [0.0 – 1.0] representing how well the user knows a vocabulary item or has mastered a grammar concept. Computed from exercise history using SRS. Applies to both `UserVocabularyProgress` and `UserGrammarConceptProgress`. |
| **Grammar Concept** | A named grammatical topic (e.g. "Inversion", "Modal Verbs") that appears inside modules. |
| **Exercise** | A single interactive task presented to the user (translation, fill-in-the-blank, multiple choice, etc.). |
| **Level Test** | A cumulative assessment that unlocks the next CEFR level when passed. |

---

## 3. Features

### 3.1 Modules

A module is a self-contained learning unit. See [Data Model](./data-model.md#module) for the full Module schema.

*Note: Module status (`locked`, `available`, `in_progress`, `completed`) is tracked per-user in UserModuleProgress, not on the module itself.*

#### 3.1.1 Module Execution Flow

Each module runs through the following steps in order. **Mastery scores are updated continuously: every exercise the user completes — in practice (Step 2) and in the Module Test (Step 3) — updates the mastery score of its linked vocabulary item or grammar concept.**

**Step 1 — Grammar Concept Introduction**

For each Grammar Concept in the module, the app presents a short explanation with 1–2 Danish examples. The user does not need to interact; this is purely instructional.

Grammar explanations are generated at module seeding time and stored in `GrammarConcept.explanation`. They are not regenerated per session.

**Step 2 — Contextual Exercises (Practice)**

Vocabulary is introduced implicitly through the exercises themselves — no separate vocabulary drilling step. Exercises are ordered by type to follow the recognition → production progression, so the user encounters vocabulary in a supported context before being asked to produce it freely:

| Order | Exercise Type | Role |
|---|---|---|
| 1 | Multiple Choice | Receptive — word seen in context, correct answer among 4 options |
| 2 | Sentence Reorder | Structural — all words provided, user arranges them |
| 3 | Fill in the Blank | Controlled production — sentence context scaffolds the answer |
| 4 | Conjugation Drill | Targeted production — specific verb form, no sentence context |
| 5 | Error Correction | Analytical — must know the correct form to spot the deviation |
| 6 | Translation (active) | Free production — no scaffolding |

Only exercise types present in the module's bank appear. Within each type, the mastery-aware selection (§3.4.3) determines which exercises are shown. Each practice session presents `practiceSessionSize` exercises (default: 20).

1. If the user is wrong, the correct answer is shown and the user moves to the next exercise
2. "Explain my mistake" is available on demand after incorrect answers (AI-generated)
3. When all exercises are done, any missed exercises are retried until the user gets them all correct
4. Mastery scores **are** updated during this step — practice and the Module Test update mastery identically; there is no "practice doesn't count" mode

**Practice continues until full vocabulary coverage**

A single practice session is not the end of Step 2. The user repeats practice sessions until **every vocabulary item in the module has appeared in at least one exercise** (shown to the user, regardless of whether they answered it correctly). Grammar concepts are **not** part of this gate — they are already introduced explicitly in Step 1.

To guarantee this converges within a predictable number of sessions, each practice session reserves a minimum share — `practiceMinUnseenVocabPercent` (default 50%) — of its exercises for vocabulary items the user has not yet encountered in this module. This requirement **overrides** the mastery-based deprioritization in §3.4.3 (an unseen item technically also has the lowest possible mastery, but coverage must win outright, not just statistically). With at least 50% of a 20-exercise session dedicated to unseen items, a module with, say, 30 vocabulary items reaches full coverage within at most 3 sessions — a hard bound, not a probabilistic hope.

Once every vocabulary item has been seen at least once, Step 2 is complete and the Module Test countdown (`testUnlockDelayHours`) begins.

**Step 3 — Module Test (Locked)**

The test is **locked** until `testUnlockDelayHours` (default: 4 hours) have passed after Step 2 is **complete** — i.e., after the user has reached full vocabulary coverage (see above), not merely after a single practice session. This enforces spaced repetition — the user cannot test immediately while memory is fresh.

Once unlocked:
1. An assessment of **30–40 questions** testing the module's vocabulary and grammar
2. Uses the same exercise types as Step 2, drawn from the **same exercise bank**, using the **same mastery-aware selection** (§3.4.3) — there is no separate "fresh vs. repeat" split. Because Step 2 already guarantees the user has encountered every vocabulary item at least once, every test exercise necessarily targets known material regardless of whether it was seen during practice or not
3. Unlike practice, the **test does not need to cover every vocabulary item** — it's a sample-based check of the module's content, not an exhaustive re-walk of it
4. Each answer is **checked and shown immediately** — exactly as in practice (Step 2). After every question the correct answer is revealed and "Explain my mistake" is available on demand; the user then continues to the next question. This keeps the in-test experience coherent with the practice flow. Unlike practice, the test is **single-pass**: a missed question is not re-presented until correct — the first answer is what counts toward the score.
5. The user answers all questions, then **submits**. After submitting, the user sees:
   - Final score (% correct)
   - A review of all questions with their answers: for incorrect answers, both the user's answer and the correct answer are shown
   - "Explain my mistake" available on demand for any incorrect answer (AI-generated)
6. **Mastery scores are updated** based on test performance, exactly as in practice

**Passing:**
- Threshold: **80%**
- On pass: module status → `completed`
- On fail: the attempt is recorded (score + timestamp) in the user's test history for this module; user can retry after `testRetryDelayMinutes` (default: 20 minutes); the test draws a new selection from the exercise bank

#### 3.1.2 Configurable Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `practiceSessionSize` | 20 | Number of exercises presented in each practice session (Step 2) |
| `practiceMinUnseenVocabPercent` | 50 | Minimum % of each practice session's exercises that must target vocabulary items the user has not yet encountered in this module — guarantees full vocabulary coverage is reached within a bounded number of sessions |
| `testUnlockDelayHours` | 4 | Hours after Step 2 is complete (every vocabulary item practiced at least once) before the Module Test unlocks |
| `testRetryDelayMinutes` | 20 | Minutes after failed test before retry is allowed |
| `testPassThreshold` | 80 | % correct required to pass the Module Test |


#### 3.1.3 Default Module Generation

The default modules defined in the curriculum are seeded during development, not generated on demand. The process:

1. **Module shell** — human-authored: theme, communication goal, grammar concepts, and vocabulary focus are defined in the curriculum specification. The modules and their shell are defined in [Default Modules)](./default-modules.md).

2. **Vocabulary set** — AI-generated from the shell: given the module's theme, CEFR level, and grammar focus, the AI produces the vocabulary items (word, translation, type, tags) and grammar concepts for the module. No human review step; the shell provides sufficient constraint.

3. **Exercise bank** — AI-generated immediately after the vocabulary set: a bank of ~50 exercises covering the vocabulary and grammar concepts (see §3.4.3 for bank mechanics). The bank must include at least one exercise for every vocabulary item in the module and at least one exercise for every grammar concept in the module.

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
| `phrase` | Hvad koster det?, Mange tak, Undskyld mig |
| `pattern` | Jeg vil gerne have…, Kan jeg få…?, Jeg er ikke sikker på, om… |
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

#### 3.2.3 User-Added Vocabulary

A user can manually add a Danish word they have encountered (e.g. while reading an article). The user provides the Danish word and its English translation; the item is stored as a `VocabularyItem` with `source = user_added` (no AI involvement, no generated alternatives or context).

**In v2.0, user-added words are stored but not used.** They are not referenced by any module and there is no standalone practice surface, so they are never presented in exercises. The capability exists so that the words are captured; how they enter the learning curriculum is deferred to a future version (see §9, "Ideas for Future Versions").

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
| **Translation (active)** | Show English word/sentence → user writes Danish. Answer is checked against the canonical answer and any pre-generated alternatives (3–5 valid phrasings stored with the exercise). Both answers are normalized before comparison (lowercase, punctuation stripped). Fuzzy compare can also be used to give the user some slack. | Vocabulary production |
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

#### AI Answer Verification (Translation exercises only)

After a `translation_active` exercise is marked wrong, the user can explicitly request an AI verification. This is strictly on-demand — it is never triggered automatically.

The AI checks whether the user's answer is a valid translation, independent of the pre-generated answer list. Two outcomes:

- **Valid**: the exercise is marked correct; the user's translation is appended to `userContributedAnswers` for that exercise, stored separately from AI-generated alternatives for auditability
- **Invalid**: the exercise remains wrong; the AI generates an explanation of why the translation is not valid

One verification is allowed per exercise attempt. There is no limit on how many times a user can invoke this across different exercises.

*Note: This is a deliberate exception to the no-live-AI rule in §3.4.3. It is opt-in and expected to be used sparingly.*

#### 3.4.3 Exercise Generation Strategy

Exercises are **never generated during a user's live session**. All AI generation runs upfront (at module creation or seeding) or in the background between sessions. This keeps session latency zero and AI costs bounded.

**The exercise bank**

Each module maintains an exercise bank of approximately 50 exercises. The bank is generated by AI when the module is created (default modules: at seeding time; user-generated modules: at creation time) and stored in the database. The bank is shared across all users for default modules; it is per-user for user-generated modules.

For `translation_active` exercises, the AI generates 3–5 accepted alternative answers alongside the canonical answer. These cover valid paraphrases and synonym clusters for all exercise targets — single words included (e.g. `stor` → *big, large, great*) as well as full sentences (e.g. *Jeg vil have* vs *Jeg vil gerne have*). It is **important** to note, that if there are **no accepted alternatives** (e.g. "I" is "jeg"), the alternatives list **can be empty**. 
Where a vocabulary item carries a `context` note (see data model), the AI uses it to scope the alternatives to the intended sense and may include it in the exercise prompt to disambiguate for the user (e.g. *"stor — physical size"*). Answer matching is done after normalization (lowercase, punctuation stripped) against the full accepted answer set — no AI call is made at answer time.

**Mastery-aware session selection**

At session start, the system draws a session-sized subset from the bank using the following algorithm — no AI involved:

Each exercise links to exactly one item — either a vocabulary item or a grammar concept. Its weight is derived from the mastery score of that item:
- `vocabularyItemId` set → look up `UserVocabularyProgress.masteryScore`
- `grammarConceptId` set → look up `UserGrammarConceptProgress.masteryScore`

Selection steps:
1. Exercises whose linked item has mastery > 0.85 are deprioritized (skipped unless the bank is nearly empty).
2. Remaining exercises are weighted by `(1 − masteryScore)` — lower mastery → higher probability of appearing.
3. Exercises the user answered incorrectly in their most recent session get an additional priority boost.
4. When multiple exercises test the same vocabulary item or grammar concept, one is chosen at random among them.
5. A weighted random sample is drawn to fill the session.

The exercise *content* is fixed (from the bank). The *selection* is personalized to the user's current mastery state.

**Coverage override (practice only)**

During Step 2 (practice) only, the algorithm above is constrained by `practiceMinUnseenVocabPercent` (§3.1.2): at least that fraction of each session is reserved for exercises whose linked vocabulary item the user has not yet encountered in this module — regardless of step 1's mastery-based deprioritization. An unseen item already has the lowest possible mastery, so this override mostly reinforces what the weighting favors anyway; its purpose is to convert that statistical tendency into a hard guarantee, so full-module vocabulary coverage completes within a bounded number of sessions (see §3.1.1, Step 2). The Module Test and Level Test are not subject to this override — they draw purely from the mastery-aware algorithm above.

**Bank refresh**

When the bank falls below one full session's worth of exercises that the user has not yet seen, the system triggers an async background job to generate additional exercises. The user is never blocked waiting for this. This also naturally handles the case where a user wants more exercises than the initial bank provides.

**Retry experience**

When a user retakes a module after failing the test, the session draws again from the bank using the same weighted selection. Because the weights reflect current mastery (which has changed since the last attempt), and because the bank is larger than a single session, the retry feels fresh without requiring new generation.

---

### 3.5 CEFR Level Progression

#### Unlocking a New Level

The user's CEFR level defaults to A1 at account creation. A placement test at onboarding is out of scope for v2.0 but the data model supports setting a higher starting level when that feature is added. To progress to A2 (and so on), the user must:
1. Complete **all modules** at the current level. 
2. Pass the **Level Test** for the current level.

#### Level Tests

A Level Test is a comprehensive assessment covering the full scope of the current CEFR level: all vocabulary from completed modules at that level and all grammar concepts introduced at that level.

**Level Test Bank**

Each CEFR level has a dedicated exercise bank generated at seeding time — not drawn from individual module banks. Exercises are purpose-built for cross-module breadth: a single exercise may combine vocabulary from different modules or test a grammar concept across several themes. Bank size: ~60 exercises. Generation follows the same upfront pattern as module exercise banks, never live.

**Exercise Selection**

At test start, 20–30 exercises are drawn from the bank using the same mastery-aware algorithm as module sessions (§3.4.3), applied across the full level's vocabulary and grammar scope.

**Results**

After the test, the user sees:
- Final score (% correct)
- All questions with correct answers; incorrect answers shown alongside the user's answer
- "Explain my mistake" available on demand for any incorrect answer
- Summary of weak areas (grammar concepts and vocabulary items where the user underperformed)

Passing threshold: **75%**. If failed, the weak areas summary is shown and the user can retry freely (no cooldown for v2).

#### CEFR Level Visibility

The user's current CEFR level is always visible on the Home Dashboard. It should be prominent — it is one of the key motivational anchors of the app.

#### Module Progress

The user's module progress, within a CEFR level, should also always be visible in the Home Dashboard.

---

### 3.6 Analyze Content

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
| Level test bank seeding | Given all vocabulary items and grammar concepts for a CEFR level, generate a bank of ~60 cross-module exercises — runs once at seeding time per level |
| Exercise bank refresh | Generate additional exercises for a module whose bank has fallen below one session's capacity — runs asynchronously in the background, never during a live session |
| Error explanation | Explain why a user's answer was wrong, with rule + example |
| Answer verification | On explicit user request after a wrong `translation_active` answer: check whether the user's translation is valid; if valid, mark correct and store in `userContributedAnswers`; if invalid, explain why |
| Grammar concept explanation | Generate a short explanation of a grammar concept with 1–2 Danish examples — runs at module seeding time, stored in GrammarConcept.explanation, not generated live |
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
| US-05 | See my mastery score per vocabulary item | I know which words I've truly learned |
| US-06 | Take a Level Test when I feel ready | I can unlock the next CEFR level |
| US-07 | Retry a module test if I fail | I'm not blocked; I can keep improving |
| US-08 | See my weaknesses after a Level Test | I know exactly what to study next |
| US-09 | Paste a Danish text I encountered (podcast transcript, document, article) and see a curriculum gap report | I know which modules will get me to the point where I can understand and produce content like this |
| US-10 | Add unknown vocabulary from a pasted text directly to my review pool | I can act immediately on gaps without waiting to complete a full module |
| US-11 | See which existing modules cover the gaps in a pasted text | The app routes me through its curriculum rather than always generating something new |

---

## 7. Open Questions

These are things not yet decided that will need resolution before or during build:

| # | Question | Options / Notes |
|---|---|---|
| OQ-01 | How many modules are required to unlock a Level Test? | All modules? Min 5? Any count? |
| OQ-02 | Does the mastery score decay over time (true SRS)? | Recommended: yes, with gentle decay |
| OQ-03 | Should the user be able to generate modules at a level above their current? | Probably not — keep progression gated |
| OQ-04 | What is the retry cooldown for the Level Test? | Suggest: none for v2 |
| OQ-05 | How should the content analysis handle texts that are too far above the user's level? | Show the gap but still route — even C1 content is useful as a destination map for a B1 learner |
| OQ-06 | Should the content analysis expose an external API for agent-driven invocation? | Recommended for v3; design the function as isolated in v2 to make this straightforward later |
| OQ-07 | What is the minimum text length for a meaningful content analysis? | Suggest: at least 50 words; shorter inputs produce unreliable CEFR estimates |

---

## 8. Constraints & Assumptions

- **Danish only** for v2.0. The data model should be language-agnostic where possible to allow future expansion.
- **Mobile-first** UI assumed (though not specified). Exercises must work well on a phone screen.
- **AI backend** is available and can handle module generation, exercise generation, and explanations.
- **No audio** in v2.0 — listening and speaking exercises are out of scope.
- The vocabulary taxonomy (§3.2.1) is fixed for v2.0 but can be extended.
- CEFR levels above B2 will have limited pre-built modules at launch; user-generated modules fill the gap.

---

## 9. Ideas for Future Versions

Features and directions intentionally deferred beyond v2.0. Captured here so the decisions and their context are not lost.

### 9.1 Bringing User-Added Vocabulary into the Curriculum

In v2.0 a user can add custom words (§3.2.3), but they are stored only — never practiced. A future version should give these words a path into the learning curriculum. The leading direction:

- User-added words accumulate in a per-user "collected words" pool.
- When the pool reaches a threshold (or on demand), the app generates a custom module from the collected words — **at the user's current CEFR level**, reusing the custom-module generation machinery (§3.1.3 / §3.6). The generated module is the vehicle that brings the words into the curriculum with exercises.
- The word's own `cefrLevel` is treated as descriptive metadata only — it never gates or filters the word out of the user's practice. The act of adding it is the signal that the user wants to learn it, which overrides the level.

**Open questions to resolve when designing this:**

| # | Question | Notes |
|---|---|---|
| FV-01 | How are user-added words brought into practice? | Leading option: batch into a generated custom module at the user's level. Alternatives (per-word exercise generation, a standalone review surface) were considered and set aside. |
| FV-02 | What triggers module generation from the pool? | A size threshold, an explicit user action, or both? |
| FV-03 | Thematically unrelated words produce an incoherent module — is that acceptable? | A "my collected words" module may lack a single theme; decide whether that is fine or whether words should be clustered first. |
| FV-04 | Should added sentences be supported, not just words? | A sentence is closer to a `pattern`/`phrase` or an Analyze Content input than a vocabulary item; decide how (or whether) to handle it. |
