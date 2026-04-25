# Vocabulary Practice — Feature Spec

## Overview

Vocabulary Practice is a language-learning feature that trains the user to recall the target-language (TL) translation of words they are studying. The user is shown a word in the source language (English) and must type the correct TL word from memory.

The target language currently supported is **Danish**.

---

## Entry Point

The user accesses Vocabulary Practice from the Language Learning section of the app. No setup or configuration is required before starting a session.

---

## Session Structure

* The session consists of a **fixed number of words**, determined by the app.
* Words are drawn from the user's active vocabulary list.
* Words are presented one at a time.

---

## User Flow

### 1. Word Prompt

* The app displays a **source-language word** (English) prominently on screen.
* An **input field** is shown below the word for the user to type their answer.
* A **submit button** (or pressing Enter) confirms the answer.

### 2. Answer Evaluation

The app evaluates the answer immediately after submission using a **case-insensitive exact string match** against the expected TL word.

* Punctuation and whitespace handling follows the same case-insensitive rule (trim leading/trailing spaces before matching).

#### 2a. Correct Answer

* The app provides a **correct feedback indicator** (e.g. green highlight or checkmark).
* After a brief moment, the app automatically advances to the next word in the queue.

#### 2b. Wrong Answer

1. The app provides a **wrong feedback indicator** (e.g. red highlight or cross).
2. The **correct TL word is revealed** below the input field.
3. A **3-second fade** plays while the correct word is displayed.
4. After the fade, the word is **moved to the end of the session queue** (it will be shown again later in the session).
5. The app advances to the next word in the queue.

### 3. Session Completion

* A word is considered **mastered for this session** once the user answers it correctly.
* The session ends when **all words have been answered correctly** (including words that were previously answered incorrectly and deferred).
* On session completion, the app navigates to the **[Session Summary Screen](./language-learning-summary.md)**.

---

## Answer Validation Rules

| Rule | Detail |
|------|--------|
| Matching method | Exact string match |
| Case sensitivity | Case-insensitive |
| Whitespace | Leading and trailing spaces are trimmed before matching |
| Validation location | Client-side (no API call required) |

---

## State Management

| State | Description |
|-------|-------------|
| **Pending queue** | Words not yet answered correctly in this session |
| **Mastered** | Words answered correctly; removed from the queue |
| **Deferred** | Words answered incorrectly; appended to the end of the pending queue |

At any point during the session, the app must track:
* The ordered pending queue
* The number of items originally in the session
* The number of items answered correctly on the first attempt (used on the summary screen)

---

## Edge Cases

* If the user submits an empty answer, the app treats it as a wrong answer and follows the wrong-answer flow.
* The session cannot be completed until every word has been answered correctly at least once; there is no skip option.

---

## Out of Scope

* Hints or partial-credit scoring are not supported.
* Audio pronunciation is not part of this feature.
* The app does not persist session progress; if the user exits mid-session, the session is lost.
