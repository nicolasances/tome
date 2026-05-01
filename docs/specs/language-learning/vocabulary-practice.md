# Vocabulary Practice — Feature Spec

## Overview

Vocabulary Practice is a language-learning feature that trains the user to recall the target-language (TL) translation of words they are studying. The user is shown a word in the source language (English) and must type the correct TL word from memory. The goal is active recall and correct production — not recognition.

The target language currently supported is **Danish**.

All session content — vocabulary items and expected answers — is **generated and supplied by the backend API** (`tome-ms-language`). The app is responsible only for presenting challenges, processing responses, and managing session queue state locally.

## UI Reference

![Practice a single word](drawings/vocab-practice.png)

![Result](drawings/vocab-practice-result.png)

---

## Entry Point

The user accesses Vocabulary Practice from the Language Learning section of the app. No setup or configuration is required before starting a session.

A **loading spinner** is displayed while the session data is being fetched from the backend API. Once the data is ready, the first word is shown immediately.

---

## Session Persistence & Resuming

Sessions are **persisted on the backend** (`tome-ms-language`). If the user exits a session before completing it (e.g. by tapping the back button), the session remains open on the server and can be resumed later.

The Language Learning home page detects whether an active session exists for the current user and presents a **Resume Practice** button in place of the Start button. See the [Language Learning Home Page spec](./home-page.md) for details.

### What the backend stores vs. what the frontend manages

| Data | Stored by | Notes |
|------|-----------|-------|
| Session ID, language, word list, total words | **Backend** | Retrieved via `GET /sessions/active` |
| Individual submitted answers (per word, correct/incorrect) | **Backend** | Stored on each `submitAnswer` call |
| Queue state: pending, mastered, deferred, first-attempt-correct, failed-attempt counts | **Frontend** (localStorage) | Persisted in `localStorage` under key `vocab-queue-{sessionId}` |

The backend does **not** store or return queue state. Queue state is managed entirely on the client and persisted to `localStorage` so it survives navigation and page reloads.

### Resume flow

1. The app calls `getActiveSession()`.
2. If the backend returns an active session, the API class reads queue state from `localStorage` using key `vocab-queue-{sessionId}`.
3. If `localStorage` has state for that session: the existing queue state is restored and the user resumes exactly where they left off.
4. If `localStorage` is empty (e.g. cleared by the user): the queue state is initialised fresh — all words placed in the pending queue, mastered/deferred lists empty. The user effectively restarts the word list (but the session ID on the backend is the same).
5. A loading spinner is displayed while session state is being fetched.

A user with an active session **cannot start a new session** until the active one is completed.

---

## Session Structure

* The **number of words** in a session is determined and returned by the backend API; the app does not hard-code this value.
* Words are drawn from the user's active vocabulary list.
* Words are presented one at a time.

---

## User Flow

### 0. Loading

On session start or resume, a loading spinner is displayed while the app fetches session data from the backend. Once ready, the first word prompt is shown.

### 1. Word Prompt

* The app displays a **"TRANSLATE"** label and the **source-language word** (English) prominently in the centre of the screen.
* A **text input field** is pinned at the bottom of the screen for the user to type their answer.
* A **submit button** inside the input field (or pressing Enter) confirms the answer.
* When a new word is shown, the input field is **cleared and auto-focused** so the user can start typing immediately.

### 2. Answer Evaluation

The app evaluates the answer immediately after submission using a **case-insensitive exact string match** against the expected TL word.

* Punctuation and whitespace handling follows the same case-insensitive rule (trim leading/trailing spaces before matching).

The word-prompt area transitions to a **result view** (described below) while the input field remains visible at the bottom of the screen (disabled during the feedback pause).

#### 2a. Correct Answer

The result view shows:
1. The original source-language word (unchanged).
2. A **"YOU TRANSLATED"** label followed by the user's answer.
3. A **green checkmark** and the text **"Correct!"**.

After **3 seconds**, the app automatically clears the result view, clears the input field, and advances to the next word in the queue.

#### 2b. Wrong Answer

The result view shows:
1. The original source-language word (unchanged).
2. A **"YOU TRANSLATED"** label followed by the user's (wrong) answer.
3. A **red cross** and the text **"Wrong!"**.
4. The **correct TL word** displayed below the wrong indicator.

After **3 seconds**, the word is **moved to the end of the session queue** (it will be shown again later in the session). The app clears the result view, clears the input field, and advances to the next word in the queue.

### 3. Session Completion

* A word is considered **mastered for this session** once the user answers it correctly.
* The session ends when **all words have been answered correctly** (including words that were previously answered incorrectly and deferred).
* On session completion, the app navigates to the **[Session Summary Screen](./language-learning-summary.md)**.

---

## Progress Bar

A **tri-segment progress bar** is displayed at the top of the screen throughout the session. It gives the user an at-a-glance view of their progress:

| Segment | Colour | Meaning |
|---------|--------|---------|
| Left | **Green** | Words answered correctly (mastered) |
| Middle | **Grey** | Words not yet practiced in this session |
| Right | **Red** | Words answered incorrectly (deferred — waiting to be retried) |

Each segment's width is proportional to the number of words it represents, relative to the total session size.

When a deferred (red) word is eventually answered correctly, its portion moves from the red segment to the green segment.

---

## Exit Behaviour (Back Button)

Tapping the **back button** in the header during an active session exits the session immediately — no confirmation dialog is shown.

The **session** (word list) remains open on the backend. The **queue state** (pending, deferred, mastered words) is persisted to `localStorage` by the page component on every answer, so it is available when the user returns. The user can resume at any time via the **Resume Practice** button on the Language Learning home page.

---

## Answer Validation Rules

| Rule | Detail |
|------|--------|
| Matching method | Exact string match |
| Case sensitivity | Case-insensitive |
| Whitespace | Leading and trailing spaces are trimmed before matching |
| Special characters | No tolerance for missing special characters (æ, ø, å must match exactly) |
| Validation location | Client-side (no API call required) |

---

## State Management

| State | Description | Stored in |
|-------|-------------|-----------|
| **Pending queue** | Words not yet answered correctly in this session | React state + localStorage |
| **Mastered** | Words answered correctly; removed from the queue | React state + localStorage |
| **Deferred** | Words answered incorrectly; appended to the end of the pending queue | React state + localStorage |
| **First-attempt correct IDs** | Words answered correctly on the first attempt | React state + localStorage |
| **Failed attempts per word** | Count of wrong answers per word (used in the summary) | React state + localStorage |

At any point during the session, the app must track all of the above. After each answer, the page component must **persist the current queue state to `localStorage`** under the key `vocab-queue-{sessionId}`, so that the session can be accurately resumed if the user navigates away.

The stored object shape:

```json
{
  "sessionId": "...",
  "pendingQueue": ["wordId1", "wordId2"],
  "masteredIds": ["wordId3"],
  "deferredIds": [],
  "firstAttemptCorrectIds": ["wordId3"],
  "wordFailedAttempts": { "wordId1": 0, "wordId2": 1 }
}
```

---

## Backend API Integration

### API interface: `IVocabularyPracticeAPI`

All practice pages interact with the backend through the `IVocabularyPracticeAPI` interface, which has the following methods:

```ts
interface IVocabularyPracticeAPI {
  startSession(language: string): Promise<VocabPracticeSession>;
  getActiveSession(): Promise<VocabPracticeSession | null>;
  submitAnswer(sessionId: string, wordId: string, isCorrect: boolean): Promise<void>;
  completeSession(sessionId: string): Promise<SessionSummary>;
}
```

Note: `startSession` takes a `language` parameter (e.g. `"danish"`). Currently only `"danish"` is supported.

### Switching between mock and real backend

The factory `VocabularyPracticeAPIFactory.getVocabularyPracticeAPI()` returns either:
- **`MockVocabularyPracticeAPI`** when `NEXT_PUBLIC_VOCAB_PRACTICE_MOCK=true` (for development/testing without the backend)
- **`TomeVocabularyPracticeAPI`** otherwise (production, using `tome-ms-language`)

### `TomeVocabularyPracticeAPI` — method contracts

All calls go to the `tome-ms-language` microservice via the `TotoAPI` wrapper (adds auth header, correlation ID, etc.).

#### `startSession(language: string): Promise<VocabPracticeSession>`

1. Call `POST /tomelang/languages/{language}/sessions` with body `{ "practiceType": "vocabulary" }`.
2. On `409 Conflict`: the user already has an active session — surface an error to the user.
3. Map the backend response to `VocabPracticeSession`:

| Backend field | `VocabPracticeSession` field |
|---------------|------------------------------|
| `sessionId` | `sessionId` |
| `payload.words[].wordId` | `words[].id` |
| `payload.words[].english` | `words[].english` |
| `payload.words[].translation` | `words[].translation` |
| _(none — initialised to 0)_ | `words[].failedAttempts` |
| `payload.words` (all, in order) | `pendingQueue` (initial: all word IDs) |
| _(none — initialised empty)_ | `masteredIds`, `deferredIds`, `firstAttemptCorrectIds` |
| `payload.totalWords` | `totalWords` |

4. Store the initial queue state in `localStorage` under key `vocab-queue-{sessionId}`.
5. Return the `VocabPracticeSession`.

#### `getActiveSession(): Promise<VocabPracticeSession | null>`

1. Call `GET /tomelang/sessions/active`.
2. If `404`: return `null` (no active session).
3. If `200`: map backend response to `VocabPracticeSession` (same field mapping as above).
4. Read queue state from `localStorage` under key `vocab-queue-{sessionId}`:
   - **If found**: restore `pendingQueue`, `masteredIds`, `deferredIds`, `firstAttemptCorrectIds`, and per-word `failedAttempts`.
   - **If not found** (localStorage cleared): initialise fresh — all words in `pendingQueue`, everything else empty, all `failedAttempts = 0`.
5. Return the `VocabPracticeSession`.

#### `submitAnswer(sessionId: string, wordId: string, isCorrect: boolean): Promise<void>`

1. Call `POST /tomelang/sessions/{sessionId}/answers` with body `{ "entityId": wordId, "isCorrect": isCorrect }`.
2. Returns when the call completes (the page handles queue-state updates in React state).
3. Note: queue state persistence to `localStorage` is the **page component's responsibility** (not this method's).

#### `completeSession(sessionId: string): Promise<SessionSummary>`

1. Call `POST /tomelang/sessions/{sessionId}/completion`.
2. The backend response maps directly to `SessionSummary` — no transformation needed:

| Backend field | `SessionSummary` field |
|---------------|------------------------|
| `totalWords` | `totalWords` |
| `firstAttemptCorrect` | `firstAttemptCorrect` |
| `accuracy` | `accuracy` |
| `wordResults[].wordId` | `wordResults[].wordId` |
| `wordResults[].english` | `wordResults[].english` |
| `wordResults[].translation` | `wordResults[].translation` |
| `wordResults[].failedAttempts` | `wordResults[].failedAttempts` |

3. Remove the queue state entry from `localStorage` (`vocab-queue-{sessionId}`).
4. Return the `SessionSummary`.

### Queue state persistence responsibility

- **`startSession()`** initialises and writes queue state to localStorage.
- **`getActiveSession()`** reads queue state from localStorage.
- **The page component** must write updated queue state to localStorage after each answer (e.g. in a `useEffect` that fires when `pendingQueue`, `masteredIds`, `deferredIds`, `firstAttemptCorrectIds`, or word `failedAttempts` change).
- **`completeSession()`** clears queue state from localStorage.

---

## Edge Cases

* If the user submits an empty answer, the app treats it as a wrong answer and follows the wrong-answer flow.
* The session cannot be completed until every word has been answered correctly at least once; there is no skip option.

---

## Out of Scope

* Hints or partial-credit scoring are not supported.
* Audio pronunciation is not part of this feature.
* Comparing results across sessions is not supported.
