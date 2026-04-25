# Language Learning

Tome includes a **Language Learning** module that helps users practise a target language (TL) through active, production-focused exercises. The current supported TL is **Danish**.

All exercise content — vocabulary items, sentences, and challenge sets — is generated and supplied by a **backend API**. The app is responsible only for presenting challenges and processing user responses.

---

## Vocabulary Practice

Vocabulary Practice presents the user with words in English and asks them to produce the correct translation in the TL. The goal is active recall and correct production — not recognition.

### Session structure

- A session contains a **fixed number of words**, determined by the app.
- Words are drawn from a set provided by the backend API for the current session.
- The user works through each word one at a time.

### Challenge flow

1. The app displays an English word.
2. The user types the TL translation into a text box and submits.
3. **If the answer is correct:** the app advances to the next word.
4. **If the answer is wrong:** <br>
   a. The correct TL word is shown to the user. <br>
   b. After **3 seconds**, the correct word fades out slowly. <br>
   c. The current word is **moved to the end of the session queue** — the user will encounter it again later in the same session. <br>
   d. The app advances to the next word in the queue. <br>

### Answer validation

- Matching is **case-insensitive**.
- The answer must otherwise be an **exact match** to the expected TL word (no tolerance for typos or missing special characters such as æ, ø, å).

### End of session

When all words in the session have been answered correctly, a **summary screen** is shown. It presents the user's performance for the session (e.g. how many words required correction).

---

## Inversions

Inversions is a Danish-specific exercise that trains the user on **sentence inversion rules** — the grammatical patterns that determine word order in Danish sentences (e.g. SAVO, VSAVO, SVOA). The user is shown an English sentence and must produce the correct Danish translation, applying the appropriate inversion where required.

### Session structure

- A session contains a **fixed number of sentences**, consistent with Vocabulary Practice.
- Sentences are drawn from a set provided by the backend API for the current session.
- The user works through each sentence one at a time.

### Challenge flow

1. The app displays an English sentence.
2. The user types the full Danish translation into a text box and submits.
3. **Correctness is evaluated by the backend API**, which assesses both the translation and the application of inversion rules.
4. **If the answer is correct:** the app advances to the next sentence.
5. **If the answer is wrong:** <br>
   a. The correct Danish sentence is shown to the user. <br>
   b. After **3 seconds**, the correct sentence fades out slowly.<br>
   c. The current challenge is **moved to the end of the session queue** — the user will encounter it again later in the same session.<br>
   d. The app advances to the next sentence in the queue.<br>

### End of session

When all sentences in the session queue have been answered correctly, a **summary screen** is shown. It presents the user's performance for the session (e.g. how many sentences required deferral, how many attempts were needed).

---

## Availability

| Feature             | Languages     |
|---------------------|---------------|
| Vocabulary Practice | Danish        |
| Inversions          | Danish only   |

Both features are accessible from the Language Learning section of the app.
