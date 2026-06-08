# Grammar Introduction — module step 1

## 1. Purpose & Scope

Delivers **Step 1 of the module flow**: a paged, purely instructional walkthrough
of the module's grammar concepts. For each concept the user reads a short
explanation and 1–2 Danish examples, then advances. No interaction is scored.
Owns this one screen (a self-paced pager) end-to-end.

Design: `module-screens.jsx` → `GrammarIntro`.

Participates in journey **J3** (learn a module's grammar).

**Out of scope**:
- The Module overview that launches this step (owned by `03-module-overview`).
- The Practice session that follows (owned by `05-practice-session`).
- Live AI generation of explanations — they are **pre-generated at seeding time** (§3.1.1), not produced here.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | Read a short explanation of each grammar concept in the module | I learn the rule before practising (US-03) |
| 2 | See real Danish examples for each concept | I see the rule in context |
| 3 | Move through the concepts at my own pace | I'm not rushed or pressured |
| 4 | See how many concepts there are and how far I am | I know how much is left in this step |

## 3. Interfaces

**Screen(s):** Grammar intro (step 1), per `module-screens.jsx`. `TomeScreen`
titled with the module name (e.g. "Who Are You?").

**Components:**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Grammar intro | Step indicator (`StepDots`) | Top row showing the 3 module steps — Grammar (current) · Practice (upcoming) · Test (locked). | Marks Grammar as the active step. |
| Grammar intro | Concept counter | "Concept n of N" label centered above the card. | Tracks position in the concept sequence. |
| Grammar intro | Concept card | Bordered card: concept icon + concept name + short gloss (e.g. "Present tense — at være / 'to be' in the now"), the explanation paragraph, and 1–2 Danish examples each with an English translation (lime left-border). | Renders the concept's pre-generated `explanation` and examples; read-only. |
| Grammar intro | Pager dots | Row of dots indicating concept count, with the current one elongated/highlighted. | Reflects current concept index. |
| Grammar intro | Next control | Forward `RoundButton`. | Advances to the next concept; on the last concept, advances out of the step (to Practice or back to overview). |

**Additional Notes:**
- **Single concept module**: pager dots and counter collapse gracefully for N=1.
- Purely instructional — there is no answer input and nothing is scored here.
- Navigation back to a previous concept (swipe/back) is a nice-to-have; forward via the Next control is the core path.

## 4. Business Logic

- Iterates the module's grammar concepts in their defined order.
- Each concept's explanation comes from `GrammarConcept.explanation`, **generated at module seeding time and stored** — never regenerated per session (§3.1.1, §5).
- The user does **not** need to interact beyond advancing; **no mastery is updated** in this step.
- Completing the last concept marks Step 1 as seen, which (per `03-module-overview`) unlocks the Practice step.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]/grammar`. | Sub-route of the module flow. |
| 2 | Load all concepts up front and page client-side. | Content is small, pre-generated, and offline of AI. |
| 3 | Mark grammar-step completion on finishing the last concept. | Drives Practice unlock in the overview. |
| 4 | `RoundButton` for the Next control (style guide). | Project convention. |

**API Integrations:**

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Concept card, Concept counter, Pager dots | *Not yet implemented* — `tome-ms-language` (basepath `NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT`), exact route TBD (e.g. an enrichment of `GET /modules/:id` or a dedicated `GET /modules/:id/grammar-concepts`) | Needs the module's grammar concepts **enriched** with their pre-generated content (`name`, gloss/icon, `explanation`, 1–2 Danish examples + translations, §3.1.1) — `GET /modules/:id` today returns only `grammarConceptIds: string[]` (`TomeModuleAPI.ModuleResponse`), not the full concept documents. See Open Question 4. |
| Next control (last concept) | *Not yet implemented* — likely a step-completion write on `UserModuleProgress` (mirrors how `03-module-overview` reads step state from `GET /me/progress`) | Persists that the user has seen all of the module's grammar concepts, which the overview reads back to unlock Practice. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | Each concept renders its stored explanation + 1–2 examples. | §3.1.1. |
| 2 | The pager advances through all concepts and exits cleanly on the last. | — |
| 3 | Step dots show Grammar as current, Practice upcoming, Test locked. | — |
| 4 | Finishing the step unlocks Practice on the overview. | Cross-feature with `03`. |
| 5 | No scoring or mastery change occurs in this step. | §3.1.1. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | After the last concept, go straight to Practice or back to the overview? | Affects exit navigation. |
| 2 | Is backward navigation between concepts required? | Wireframe shows forward-only. |
| 3 | Can the user revisit Grammar after completing it (from the overview)? | Tied to `03` open question. |
| 4 | What endpoint serves the module's grammar concepts **with their full pre-generated content** (explanation + examples), and how is grammar-step completion persisted? | `GET /modules/:id` currently returns only `grammarConceptIds`. Needs a contract decision before implementation — see §5 API Integrations. |
