# Inversions — Feature Spec

## Overview

Inversions is a Danish-specific language-learning feature that trains the user on **sentence inversion rules** — the grammatical patterns that determine word order in Danish sentences (e.g. SAVO, VSAVO, SVOA). The user is shown an English sentence and must produce the correct Danish translation, applying the appropriate inversion where required.

Inversions are currently available for **Danish only**.

All session content — sentences and expected answers — is **generated and supplied by the backend API**. The app is responsible only for presenting challenges and processing responses. Correctness is evaluated server-side.

---

## Entry Point

The user accesses Inversions from the Language Learning section of the app. No setup or configuration is required before starting a session.

---

## Session Structure

* The session consists of a **fixed number of sentence challenges**, determined by the app.
* Challenges are drawn from the user's active grammar and vocabulary topics.
* Challenges are presented one at a time.

---

## User Flow

### 1. Sentence Prompt

* The app displays an **English sentence prompt** prominently on screen.
* A **multi-line text area** is shown below the prompt for the user to write their Danish sentence.
* A **submit button** confirms the answer.

### 2. Answer Evaluation

The user's answer is submitted to the **backend API** for evaluation. The API assesses grammatical correctness and meaning, and returns:
* A **pass or fail** result.
* The **expected correct Danish sentence**.

The frontend must wait for the API response before displaying feedback.

#### 2a. Correct Answer

* The app displays a **correct feedback indicator** (e.g. green highlight or checkmark).
* After a brief moment, the app automatically advances to the next challenge in the queue.

#### 2b. Wrong Answer

1. The app displays a **wrong feedback indicator** (e.g. red highlight or cross).
2. The **correct Danish sentence is revealed** below the text area.
3. A **3-second fade** plays while the correct sentence is displayed.
4. After the fade, the challenge is **moved to the end of the session queue** (it will be shown again later in the session).
5. The app advances to the next challenge in the queue.

### 3. Session Completion

* A challenge is considered **mastered for this session** once the user answers it correctly.
* The session ends when **all challenges have been answered correctly** (including challenges that were previously answered incorrectly and deferred).
* On session completion, the app navigates to the **[Session Summary Screen](./language-learning-summary.md)**.

---

## API Contract

### Request

The frontend sends the user's answer to the backend evaluation endpoint:

| Field | Description |
|-------|-------------|
| `challenge_id` | Identifier of the sentence challenge being answered |
| `user_answer` | The Danish sentence typed by the user |

### Response

| Field | Description |
|-------|-------------|
| `correct` | Boolean — whether the answer is accepted |
| `expected_answer` | The correct Danish sentence (always returned, used for feedback) |

> The frontend must always display `expected_answer` when `correct` is `false`.

---

## State Management

| State | Description |
|-------|-------------|
| **Pending queue** | Challenges not yet answered correctly in this session |
| **Mastered** | Challenges answered correctly; removed from the queue |
| **Deferred** | Challenges answered incorrectly; appended to the end of the pending queue |

At any point during the session, the app must track:
* The ordered pending queue
* The number of items originally in the session
* The number of items answered correctly on the first attempt (used on the summary screen)

---

## Edge Cases

* If the user submits an empty answer, the app treats it as a wrong answer and follows the wrong-answer flow (the API may be called with an empty string, or the client may short-circuit and skip the API call).
* If the API call fails, the app must display an error state and allow the user to retry submission.
* The session cannot be completed until every challenge has been answered correctly at least once; there is no skip option.

---

## Out of Scope

* Grammar hints or partial-credit scoring are not supported.
* Multiple target languages are not supported at this time (Danish only).
* The app does not persist session progress; if the user exits mid-session, the session is lost.
