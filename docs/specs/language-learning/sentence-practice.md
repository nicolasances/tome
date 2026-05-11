# Sentence Practice — Feature Spec

## Overview

Sentence Practice is a language-learning feature that trains the user to recall the target-language (TL) sentence corresponding to an English translation. The user is shown an English translation and must type the correct Danish sentence from memory. The goal is active recall and correct production — not recognition.

The target language currently supported is **Danish**.

All session content — sentences and expected answers — is **generated and supplied by the backend API** (`tome-ms-language`). The app is responsible only for presenting challenges, processing responses, and managing session queue state locally.

---

## Entry Point

The user accesses Sentence Practice from the Language Learning **practice type selection screen** (`/language-learning/select`), which is reached by pressing **Start Practice** on the Language Learning home page.

A **loading spinner** is displayed while the session data is being fetched from the backend API. Once the data is ready, the first sentence prompt is shown immediately.

---

## Session Persistence & Resuming

Sessions are **persisted on the backend** (`tome-ms-language`). If the user exits a session before completing it (e.g. by tapping the back button), the session remains open on the server and can be resumed later.

The Language Learning home page detects whether an active session exists for the current user and presents a **Resume Practice** button in place of the Start button. The resume button routes directly to the correct in-progress practice page based on the session's `practiceType` field. See the [Language Learning Home Page spec](./home-page.md) for details.

### What the backend stores vs. what the frontend manages

| Data | Stored by | Notes |
|------|-----------|-------|
| Session ID, language, sentence list, total sentences | **Backend** | Retrieved via `GET /sessions/active` |
| Individual submitted answers (per sentence, correct/incorrect) | **Backend** | Stored on each `submitAnswer` call |
| Queue state: pending, mastered, deferred, first-attempt-correct, failed-attempt counts | **Frontend** (localStorage) | Persisted in `localStorage` under key `sentence-queue-{sessionId}` |

The backend does **not** store or return queue state. Queue state is managed entirely on the client and persisted to `localStorage` so it survives navigation and page reloads.

### Resume flow

1. The app calls `getActiveSession()`.
2. If the backend returns an active session with `practiceType = "sentences"`, the API class reads queue state from `localStorage` using key `sentence-queue-{sessionId}`.
3. If `localStorage` has state for that session: the existing queue state is restored and the user resumes exactly where they left off.
4. If `localStorage` is empty (e.g. cleared by the user): the queue state is initialised fresh — all sentences placed in the pending queue, mastered/deferred lists empty. The user effectively restarts the sentence list (but the session ID on the backend is the same).
5. A loading spinner is displayed while session state is being fetched.

A user with an active session **cannot start a new session** until the active one is completed.

---

## Session Structure

* The **number of sentences** in a session is determined and returned by the backend API; the app does not hard-code this value.
* Sentences are drawn from the stored sentence list.
* Sentences are presented one at a time.

---

## User Flow

### 0. Loading

On session start or resume, a loading spinner is displayed while the app fetches session data from the backend. Once ready, the first sentence prompt is shown.

### 1. Sentence Prompt

* The app displays a **"TRANSLATE"** label and the **English translation** prominently in the centre of the screen.
* A **text input field** is pinned at the bottom of the screen for the user to type their Danish answer.
* A **submit button** inside the input field (or pressing Enter) confirms the answer.
* When a new sentence is shown, the input field is **cleared and auto-focused** so the user can start typing immediately.

### 2. Answer Evaluation

The app evaluates the answer immediately after submission using a **three-tier cascade**. Each tier is tried in order; if a tier passes, subsequent tiers are not run.

#### Tier 1 — Exact match (normalised)

The answer is compared using a **case-insensitive exact string match** after normalisation:
* Leading and trailing spaces are trimmed.
* Punctuation is stripped.
* Consecutive spaces are collapsed to one.
* Special characters (æ, ø, å) are **preserved as-is** — they are not folded to ASCII equivalents.

If Tier 1 passes → **correct answer** (see §2a).

#### Tier 2 — Fuzzy match (Levenshtein distance)

If Tier 1 fails, the app computes the Levenshtein distance between the two normalised strings. A distance of **≤ 2** (at most 2 insertions, deletions, or substitutions) is treated as a trivial typo and silently passed as correct.

* Danish special characters are **not** folded: ø ≠ o, å ≠ a, æ ≠ ae. Substituting ø→o costs 1 edit like any other substitution.
* No UI difference from Tier 1 — the user sees the same correct-answer result.

If Tier 2 passes → **correct answer** (see §2a).

#### Tier 3 — LLM verification ("Ask AI")

If both Tier 1 and Tier 2 fail, the result screen shows the wrong-answer view (see §2b) plus a **"Was my answer acceptable?"** button. The user may optionally tap this to request an LLM review.

Tapping the button:
1. Disables the button and shows a loading indicator.
2. Calls the internal `/api/llm-verify` route, which runs a **Gemini Flash → Gemini Pro cascade** on Vertex AI.
3. Displays the LLM's verdict and explanation (see §2c and §2d below).

**Important:** `submitAnswer` is **not** called for wrong answers until the user explicitly advances (see §2b and §2c/§2d). This prevents false failed-attempt counts when the LLM later upgrades the result.

The sentence-prompt area transitions to a **result view** (described below) while the input field remains visible at the bottom of the screen (disabled until the user advances).

#### 2a. Correct Answer (Tier 1 or Tier 2)

The result view shows:
1. The original English translation (unchanged).
2. A **green checkmark** and the user's answer.

`submitAnswer(isCorrect: true)` is called immediately. The user taps a **Continue** button to advance to the next sentence. There is no auto-advance timer.

#### 2b. Wrong Answer (Tier 1 and Tier 2 both fail)

The result view shows:
1. The original English translation (unchanged).
2. A **red cross** and the user's (wrong) answer.
3. The **correct Danish sentence** displayed below.
4. A **"Was my answer acceptable?"** button for LLM review.
5. A **Continue** button.

`submitAnswer` is **deferred** — it is called only when the user explicitly advances:
* If the user taps **Continue** (without asking AI): `submitAnswer(isCorrect: false)` fires, the sentence is moved to the end of the queue, and the next sentence is shown.
* If the user taps **"Was my answer acceptable?"**: see §2c / §2d.

#### 2c. LLM says the answer is acceptable

The result view updates to show:
1. The original English translation (unchanged).
2. The user's answer, now styled as **correct** (green).
3. The LLM's explanation (e.g. *"Your answer is an acceptable paraphrase…"*), displayed in a distinct AI-labelled card.
4. A **Continue** button.

`submitAnswer(isCorrect: true)` is called when the verdict is received. Queue state is updated to treat the sentence as **mastered** (same as a correct answer). The user taps Continue to advance.

#### 2d. LLM says the answer is not acceptable

The result view updates to show:
1. The original English translation (unchanged).
2. The user's answer, styled as **incorrect** (red).
3. The correct Danish sentence.
4. The LLM's explanation from Gemini Pro (a short grammatical note), displayed in a distinct AI-labelled card.
5. A **Continue** button.

`submitAnswer(isCorrect: false)` is called when the verdict is received. The sentence remains in the deferred queue. The user taps Continue to advance.

### 3. Session Completion

* A sentence is considered **mastered for this session** once the user types it correctly.
* The session ends when **all sentences have been answered correctly** (including sentences that were previously answered incorrectly and deferred).
* On session completion, the app navigates to the **[Session Summary Screen](./language-learning-summary.md)**.

---

## Progress Bar

A **tri-segment progress bar** is displayed at the top of the screen throughout the session. It gives the user an at-a-glance view of their progress:

| Segment | Colour | Meaning |
|---------|--------|---------|
| Left | **Green** | Sentences answered correctly (mastered) |
| Middle | **Grey** | Sentences not yet practiced in this session |
| Right | **Red** | Sentences answered incorrectly (deferred — waiting to be retried) |

Each segment's width is proportional to the number of sentences it represents, relative to the total session size.

When a deferred (red) sentence is eventually answered correctly, its portion moves from the red segment to the green segment.

---

## Exit Behaviour (Back Button)

Tapping the **back button** in the header during an active session exits the session immediately — no confirmation dialog is shown.

The **session** (sentence list) remains open on the backend. The **queue state** (pending, deferred, mastered sentences) is persisted to `localStorage` by the page component on every answer, so it is available when the user returns. The user can resume at any time via the **Resume Practice** button on the Language Learning home page.

---

## Answer Validation Rules

| Tier | Rule | Detail |
|------|------|--------|
| 1 | Matching method | Normalised case-insensitive exact string match |
| 1 | Punctuation | Stripped before comparison — punctuation differences are **not errors** |
| 1 | Whitespace | Leading/trailing trimmed; internal runs collapsed |
| 1 | Special characters | æ, ø, å preserved; not folded to ASCII |
| 2 | Fuzzy match | Levenshtein distance ≤ 2 on normalised strings |
| 2 | Special chars in fuzzy | ø, å, æ are distinct characters (not aliased); substituting ø→o costs 1 edit |
| 3 | LLM | Gemini Flash → Pro cascade via `/api/llm-verify`; user-initiated only |
| — | Validation location | Tiers 1 & 2 are client-side; Tier 3 calls an internal Next.js API route |

### `submitAnswer` timing

| Answer outcome | When `submitAnswer` is called | `isCorrect` value |
|---|---|---|
| Tier 1 or 2 correct | Immediately after evaluation | `true` |
| Wrong (no AI asked) | When user taps Continue | `false` |
| LLM says acceptable | When LLM verdict is received | `true` |
| LLM says not acceptable | When LLM verdict is received | `false` |

---

## State Management

| State | Description | Stored in |
|-------|-------------|-----------|
| **Pending queue** | Sentences not yet answered correctly in this session | React state + localStorage |
| **Mastered** | Sentences answered correctly; removed from the queue | React state + localStorage |
| **Deferred** | Sentences answered incorrectly; appended to the end of the pending queue | React state + localStorage |
| **First-attempt correct IDs** | Sentences answered correctly on the first attempt | React state + localStorage |
| **Failed attempts per sentence** | Count of wrong answers per sentence (used in the summary) | React state + localStorage |

At any point during the session, the app must track all of the above. After each answer, the page component must **persist the current queue state to `localStorage`** under the key `sentence-queue-{sessionId}`, so that the session can be accurately resumed if the user navigates away.

The stored object shape:

```json
{
  "sessionId": "...",
  "pendingQueue": ["sentenceId1", "sentenceId2"],
  "masteredIds": ["sentenceId3"],
  "deferredIds": [],
  "firstAttemptCorrectIds": ["sentenceId3"],
  "sentenceFailedAttempts": { "sentenceId1": 0, "sentenceId2": 1 }
}
```

---

## Backend API Integration

### API interface: `ISentencePracticeAPI`

All sentence practice pages interact with the backend through the `ISentencePracticeAPI` interface, which has the following methods:

```ts
interface ISentencePracticeAPI {
  startSession(language: string): Promise<SentencePracticeSession>;
  getActiveSession(): Promise<SentencePracticeSession | null>;
  submitAnswer(sessionId: string, sentenceId: string, isCorrect: boolean): Promise<void>;
  completeSession(sessionId: string): Promise<SentenceSessionSummary>;
}
```

Note: `startSession` takes a `language` parameter (e.g. `"danish"`). Currently only `"danish"` is supported.

### Switching between mock and real backend

The factory `SentencePracticeAPIFactory.getSentencePracticeAPI()` returns either:
- **`MockSentencePracticeAPI`** when `NEXT_PUBLIC_SENTENCE_PRACTICE_MOCK=true` (for development/testing without the backend)
- **`TomeSentencePracticeAPI`** otherwise (production, using `tome-ms-language`)

### `TomeSentencePracticeAPI` — method contracts

All calls go to the `tome-ms-language` microservice via the `TotoAPI` wrapper (adds auth header, correlation ID, etc.).

#### `startSession(language: string): Promise<SentencePracticeSession>`

1. Call `POST /tomelang/languages/{language}/sessions` with body `{ "practiceType": "sentences" }`.
2. On `409 Conflict`: the user already has an active session — surface an error to the user.
3. Map the backend response to `SentencePracticeSession`:

| Backend field | `SentencePracticeSession` field |
|---------------|---------------------------------|
| `sessionId` | `sessionId` |
| `payload.sentences[].sentenceId` | `sentences[].id` |
| `payload.sentences[].sentence` | `sentences[].sentence` |
| `payload.sentences[].translation` | `sentences[].translation` |
| _(none — initialised to 0)_ | `sentences[].failedAttempts` |
| `payload.sentences` (all, in order) | `pendingQueue` (initial: all sentence IDs) |
| _(none — initialised empty)_ | `masteredIds`, `deferredIds`, `firstAttemptCorrectIds` |
| `payload.totalSentences` | `totalSentences` |

4. Store the initial queue state in `localStorage` under key `sentence-queue-{sessionId}`.
5. Return the `SentencePracticeSession`.

#### `getActiveSession(): Promise<SentencePracticeSession | null>`

1. Call `GET /tomelang/sessions/active`.
2. If `404`: return `null` (no active session).
3. If `200` and `practiceType !== "sentences"`: return `null` (active session is of a different type; this API handles only sentence sessions).
4. If `200` and `practiceType === "sentences"`: map backend response to `SentencePracticeSession` (same field mapping as above).
5. Read queue state from `localStorage` under key `sentence-queue-{sessionId}`:
   - **If found**: restore `pendingQueue`, `masteredIds`, `deferredIds`, `firstAttemptCorrectIds`, and per-sentence `failedAttempts`.
   - **If not found** (localStorage cleared): initialise fresh — all sentences in `pendingQueue`, everything else empty, all `failedAttempts = 0`.
6. Return the `SentencePracticeSession`.

#### `submitAnswer(sessionId: string, sentenceId: string, isCorrect: boolean): Promise<void>`

1. Call `POST /tomelang/sessions/{sessionId}/answers` with body `{ "entityId": sentenceId, "isCorrect": isCorrect }`.
2. Returns when the call completes (the page handles queue-state updates in React state).
3. Note: queue state persistence to `localStorage` is the **page component's responsibility** (not this method's).

#### `completeSession(sessionId: string): Promise<SentenceSessionSummary>`

1. Call `POST /tomelang/sessions/{sessionId}/completion`.
2. Map the backend response to `SentenceSessionSummary`:

| Backend field | `SentenceSessionSummary` field |
|---------------|-------------------------------|
| `totalSentences` | `totalSentences` |
| `firstAttemptCorrect` | `firstAttemptCorrect` |
| `accuracy` | `accuracy` |
| `sentenceResults[].sentenceId` | `sentenceResults[].sentenceId` |
| `sentenceResults[].sentence` | `sentenceResults[].sentence` |
| `sentenceResults[].translation` | `sentenceResults[].translation` |
| `sentenceResults[].failedAttempts` | `sentenceResults[].failedAttempts` |

3. Remove the queue state entry from `localStorage` (`sentence-queue-{sessionId}`).
4. Return the `SentenceSessionSummary`.

### Queue state persistence responsibility

- **`startSession()`** initialises and writes queue state to localStorage.
- **`getActiveSession()`** reads queue state from localStorage.
- **The page component** must write updated queue state to localStorage after each answer (e.g. in a `useEffect` that fires when `pendingQueue`, `masteredIds`, `deferredIds`, `firstAttemptCorrectIds`, or sentence `failedAttempts` change).
- **`completeSession()`** clears queue state from localStorage.

---

## LLM Verification API

### Route: `POST /api/llm-verify`

An internal Next.js API route (not an external microservice). Follows the same pattern as `app/api/tts/synthesize/route.ts`.

**Request body:**
```json
{
  "originalSentence": "string",
  "userAnswer": "string",
  "expectedAnswer": "string",
  "language": "danish"
}
```

* `originalSentence`: the English sentence the learner was asked to translate
* `userAnswer`: the learner's Danish answer
* `expectedAnswer`: the reference correct Danish answer
* `language`: the target language (currently always `"danish"`)

**Response (success):**
```json
{ "acceptable": true, "explanation": "Your phrasing is a valid paraphrase." }
```

**Response (error):**
```json
{ "message": "..." }
```
with an appropriate HTTP error status.

#### Cascade logic

1. Call **Gemini Flash** (`gemini-2.0-flash`) via Vertex AI with a prompt asking whether `userAnswer` is an acceptable translation. Request structured JSON output `{ "acceptable": boolean, "explanation": string }`.
2. If Flash returns `acceptable: true` → return immediately.
3. If Flash returns `acceptable: false` → call **Gemini Pro** (`gemini-2.5-pro`) for a final, thoughtful verdict with a short grammatical explanation.
4. Return Gemini Pro's response.

#### Prompt design

```
You are evaluating a language learner's Danish translation.
English sentence to translate: "<originalSentence>"
Reference Danish answer: "<expectedAnswer>"
Learner's answer: "<userAnswer>"
Is the learner's answer an acceptable Danish translation of the English sentence?
A translation is acceptable if it conveys the same meaning correctly, even if phrased slightly differently. Minor word-order differences or synonyms are acceptable; wrong grammar or wrong meaning is not.
Respond with JSON only: {"acceptable": true/false, "explanation": "<one sentence>"}
```

### API Wrapper: `TomeLLMVerifyAPI`

File: `api/TomeLLMVerifyAPI.ts`

```ts
export class TomeLLMVerifyAPI {
  async verifyAnswer(
    originalSentence: string,
    userAnswer: string,
    expectedAnswer: string,
    language: string
  ): Promise<{ acceptable: boolean; explanation: string }> { ... }
}
```

Calls `/api/llm-verify` via plain `fetch` (not `TotoAPI`, since this is an internal Next.js route).

---



* If the user submits an empty answer, the app treats it as a wrong answer and follows the wrong-answer flow.
* The session cannot be completed until every sentence has been answered correctly at least once; there is no skip option.

---

## Out of Scope

* Audio pronunciation is not part of this feature.
* Comparing results across sessions is not supported.
* LLM verification for vocabulary practice is out of scope.
* Auto-firing the LLM on every wrong answer (the user must opt in via the "Ask AI" button).
* Caching or rate-limiting LLM calls.
