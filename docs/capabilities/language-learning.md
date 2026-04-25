# Language Learning

Tome supports language-learning features that help the user practise a target language through active recall exercises.

The target language currently supported is **Danish**.

---

## Features

| Feature | Target Language |
|---------|----------------|
| Vocabulary Practice | Danish |
| Inversions | Danish |

---

## Vocabulary Practice

Vocabulary Practice tests the user's ability to recall target-language (TL) translations of words they are learning.

### Session Structure

* The session size is **fixed and determined by the app**.
* Each item in the session is a word the user is learning, presented in the source language (English).

### User Flow

1. The app displays a word in the source language.
2. The user types the TL (Danish) translation.
3. The app evaluates the answer using a **case-insensitive exact match**.
4. **Correct answer** → the app advances to the next word.
5. **Wrong answer**:
   a. The app shows the correct TL word.
   b. After a **3-second fade**, the word is moved to the **end of the queue**.
   c. The app advances to the next word in the queue.
6. Once all words have been answered correctly, the session ends with a **summary / score screen**.

### Answer Validation

Answers are validated client-side using a **case-insensitive exact string match** against the expected TL word.

---

## Inversions

Inversions test the user's ability to construct grammatically correct sentences in Danish. The user is given an English prompt and must write the full corresponding Danish sentence.

> Inversions are currently available for **Danish only**.

### Session Structure

* The session size is **fixed and determined by the app**.
* Each item in the session is a sentence challenge generated from the user's vocabulary or grammar topics.

### User Flow

1. The app displays an English sentence prompt.
2. The user writes the full **Danish sentence**.
3. The app submits the answer to the **backend API** for evaluation.
4. **Correct answer** → the app advances to the next challenge.
5. **Wrong answer**:
   a. The app shows the correct Danish sentence.
   b. After a **3-second fade**, the challenge is moved to the **end of the queue**.
   c. The app advances to the next challenge in the queue.
6. Once all challenges have been answered correctly, the session ends with a **summary / score screen**.

### Answer Validation

Answers are evaluated by the **backend API**, which assesses grammatical correctness and meaning. The frontend submits the user's answer and receives a pass/fail result along with the expected correct sentence.

---

## End-of-Session Summary Screen

Both features display a summary screen at the end of the session. The summary shows:

* Total number of items in the session
* Number of items answered correctly on the first attempt
* Score / accuracy percentage
