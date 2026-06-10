# Grammar Introduction — module step 1

![Status](https://img.shields.io/badge/status-implemented-brightgreen?style=flat-square)

## 1. Purpose & Scope

Delivers **Step 1 of the module flow**: a paged, purely instructional walkthrough
of the module's grammar concepts. For each concept the user reads a short
explanation and 1–2 Danish examples, then advances. No interaction is scored,
and paging through the concepts makes no backend write — reading is read-only
end-to-end, mirroring the confirmed-read-only `GetGrammarIntroduction` on the
backend (F09). The only backend effect happens at **exit**: completing the last
concept immediately starts the module's practice session (§4, §5.1) — which is
what flips `UserModuleProgress` to `in_progress`, not a dedicated "grammar seen"
write. Owns this one screen (a self-paced pager) end-to-end.

Design: `module-screens.jsx` → `GrammarIntro`.

Participates in journey **J3** (learn a module's grammar).

**Out of scope**:
- The Module overview that launches this step (owned by `03-module-overview`).
- The Practice session itself — its screen, lifecycle and exercises (owned by `05-practice-session`/F10). This feature only **triggers** the session start on exit (§4, §5.1); everything from there on is `05`'s.
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
| Grammar intro | Session progress (`SessionBar`) | Segmented progress pill spanning the full width at the top of the screen body. `total` = number of grammar concepts in the module; `mastered` = count of concepts the user has advanced past (green segment); `deferred` = 0 (not applicable in this step). | Grows the green segment each time the user advances past a concept. |
| Grammar intro | Concept counter | Split row immediately below `SessionBar`: a `Label` component reading "Grammar" (uppercase, left-aligned) and an "n / N" counter (e.g. "1 / 3") right-aligned. | Reflects the current concept index; updates each time the user advances. |
| Grammar intro | Concept card | Inline layout — no card border. Header: a lime circle containing the teacher icon alongside the concept name as a heading. Below the header: the explanation paragraph. Below that: 1–2 Danish examples, each with an English translation (lime left-border). | Renders the concept's pre-generated `explanation` and examples; read-only. |
| Grammar intro | Next control | Forward `RoundButton` (primary variant), right-aligned at the bottom of the screen. | Advances to the next concept. On the **last** concept: immediately starts the module's practice session (`POST /users/:userId/modules/:moduleId/practiceSessions`, owned by `05-practice-session`/F10 — §5.1) and routes the user straight into Practice with that session — no stop at the overview. |

**Additional Notes:**
- **Single concept module**: `SessionBar` shows total=1 and the counter reads "1 / 1"; both collapse gracefully.
- Purely instructional — there is no answer input and nothing is scored here.
- Navigation back to a previous concept (swipe/back) is a nice-to-have; forward via the Next control is the core path.

## 4. Business Logic

- Iterates the module's grammar concepts in the order returned by `GET /modules/:moduleId/grammarIntroduction` — which mirrors the `grammarConceptIds` order on the module document (§5.1; the backend re-sorts its bulk lookup to preserve that order, per F09's technical decisions).
- Each concept's explanation and examples come from that response — `GrammarConcept.explanation` / `.examples`, **generated at module seeding time and stored**, never regenerated per session (§3.1.1, §5.1; F02/F09).
- The user does **not** need to interact beyond advancing; **no mastery is updated**, and paging through concepts makes **no progress write** — `GetGrammarIntroduction` (F09) is confirmed read-only.
- **On the last concept, finishing the step immediately starts a practice session**: the app calls `POST /users/:userId/modules/:moduleId/practiceSessions` (§5.1; owned by `05-practice-session`/F10) and routes the user straight into Practice with the returned session — there is **no intermediate stop at the overview**. This call is also what flips `UserModuleProgress` to `in_progress` (per F10's own business logic: "starting a practice session transitions UserModuleProgress to `in_progress`"), so Grammar Intro needs no completion-marking write or endpoint of its own — the practice-session-start call *is* the mechanism that "completes" Grammar from the backend's point of view (§5, Technical Decision #3).

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/module/[moduleId]/grammar`. | Sub-route of the module flow. |
| 2 | Load all concepts up front with a single call to `GET /modules/:moduleId/grammarIntroduction` and page client-side. | Content is small, pre-generated, already enriched and ordered server-side, and offline of AI (§5.1). |
| 3 | On the last concept, do **not** navigate back to the overview or make a dedicated "grammar step complete" write — instead immediately call the practice-session-start endpoint (`POST /users/:userId/modules/:moduleId/practiceSessions`, owned by `05-practice-session`/F10) and enter Practice directly with the returned session. | Matches the actual backend contract: there is no Step-1-completion endpoint (F09's `GetGrammarIntroduction` is confirmed read-only), while starting a practice session is exactly what flips `UserModuleProgress` to `in_progress` (F10 business logic) — so triggering that start *is* the natural "completion" signal. It also removes the dead stop on the overview between Grammar and Practice. Supersedes the earlier "mark grammar-step completion" decision, which assumed a write the backend does not provide. |
| 4 | `RoundButton` for the Next control (style guide). | Project convention. |
| 5 | **`GET /me` is called in parallel with grammar data to obtain the `userId`** needed for `POST /users/:userId/modules/:moduleId/practiceSessions`. | The practice-session-start endpoint requires a userId in the URL path. The frontend derives this via `GET /me` (returns `{ id, email, cefrLevel, createdAt }`), fetched in parallel with the grammar intro data so there is no added latency. A 409 response from the practice-session-start call is handled gracefully — the user is routed to Practice regardless, where the existing session will be loaded. |

### 5.1. API Integrations

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Concept card, Concept counter, Pager dots | `GET /modules/:moduleId/grammarIntroduction` (`tome-ms-language`, basepath `NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT`) | Returns the module's grammar concepts already resolved and enriched, in presentation order: `{ concepts: [{ name, explanation, examples }] }`, where each `examples` entry is a `{ danish, english }` pair (1–2 per concept). One call loads everything the pager needs (F09/`GetGrammarIntroduction`); no further requests as the user advances. |
| Next control (last concept) | `POST /users/:userId/modules/:moduleId/practiceSessions` (`tome-ms-language`, owned by `05-practice-session`/F10) | Triggered immediately when the user finishes the last concept: starts the module's practice session (drawing `practiceSessionSize` exercises, mastery-aware per F08) and the app routes straight into Practice with the returned session — no stop at the overview. This call is also what flips `UserModuleProgress` to `in_progress` (F10 business logic), so Grammar Intro needs no completion endpoint of its own (Technical Decision #3). |

**Missing**

None — every component's backend need is covered by an existing, implemented endpoint (see table above).

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | Each concept renders its stored explanation + 1–2 examples, loaded in one call to `GET /modules/:moduleId/grammarIntroduction`. | §3.1.1; §5.1. |
| 2 | The pager advances through all concepts and exits cleanly on the last. | — |
| 3 | Completing the last concept immediately starts a practice session and routes the user straight into Practice with it — with no intermediate stop at the overview. | §4; §5.1; resolves Open Question 1. Replaces the earlier "finishing the step unlocks Practice on the overview" framing — see Technical Decision #3. |
| 4 | No scoring or mastery change occurs in this step. | §3.1.1. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | ~~After the last concept, go straight to Practice or back to the overview?~~ | **Resolved** — straight to Practice: finishing the last concept immediately starts a practice session and routes the user directly into it (§4, §5.1, Technical Decision #3). |
| 2 | Is backward navigation between concepts required? | **Resolved** - forward-only. |
| 3 | Can the user revisit Grammar after completing it (from the overview)? | **Resolved** - no. |
