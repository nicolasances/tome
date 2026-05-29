# Exercise Generation Rules
*Rules the AI must follow when generating exercises for any module.*

These rules apply to all exercise generation: default module seeding, user-generated modules, bank refreshes, and level test banks.

---

## Cross-cutting rules (all exercise types)

- Every exercise must be tied to at least one vocabulary item or grammar concept from the module.
- Sentences should reflect the module's theme and CEFR register — a B2 business module should not produce A1-sounding sentences.
- Use vocabulary the learner has already seen earlier in the session (the Multiple Choice → Translation ordering exists precisely to scaffold this).
- Do not use proper nouns as the blank or production target — they are either trivially guessable or arbitrarily unguessable.
- One focus per exercise. Do not introduce two unfamiliar structures in the same sentence.

---

## Multiple Choice

- The blank must represent a single, coherent lexical or grammatical unit.
- **Never split a discontinuous verb phrase across the blank boundary.** If the target phrase requires a negation or particle that appears after it in the sentence, the sentence must be restructured so the blank captures the entire meaningful unit, or the context is made positive.
  - ✗ `Jeg ___ ikke kaffe.` → answer: `kan lide` → produces "Jeg kan lide ikke kaffe" (ungrammatical)
  - ✓ `Jeg ___ kaffe meget.` → answer: `kan lide`
  - ✓ `Jeg kan ___ lide kaffe.` → answer: `ikke` (if testing negation placement, not the phrase itself)
- All four options must produce syntactically valid sentences when inserted — distractors should be plausible (same word class, similar context), not grammatically broken.
- The correct answer must be unambiguous. If more than one option produces a valid, natural sentence, the exercise is flawed.
- Sentence length: at least 5 words. Very short sentences make answers guessable by elimination.

---

## Sentence Reorder

- All words needed to form the correct sentence must be present in the word list — no omissions, no extras.
- The correct ordering must be unambiguous. If two orderings are both grammatically and semantically valid, both must be listed as accepted answers.
- The exercise should test a specific structural rule (inversion after fronted adverbials, verb-second, subordinate clause word order, negation placement). A sentence with no structural challenge is not worth a reorder exercise.
- Ideal sentence length: 5–9 words. Shorter is trivial; longer becomes a working-memory exercise rather than a grammar exercise.
- Punctuation belongs in the answer, not in the scrambled word list.

---

## Fill in the Blank

- **Same discontinuous-phrase rule as Multiple Choice.** The blank must not split a phrase whose parts require specific relative ordering with negation, reflexive pronouns, or particles.
- The sentence context must constrain the answer to exactly one correct form. If two different words or inflections are both valid in the blank, the exercise is ambiguous and must be rewritten.
- When the task is inflection (not lexical choice), include a form hint: the infinitive in parentheses, e.g., *(at spise, present tense)* or just *(spise)*.
- The blank should not be the first word of the sentence — an unconstrained opening provides too little context.
- Do not place the blank at a position where the learner can answer correctly without understanding the target item (e.g., the only noun in a sentence is always the answer).

---

## Conjugation Drill

- Always specify all three: **verb (infinitive)**, **tense**, **subject**. Never leave any of these implicit.
- For reflexive verbs, the expected answer includes the reflexive pronoun (e.g., *at føle sig*, present, *han* → **føler sig**).
- Vary the subject across exercises in a bank — do not default to *jeg* for all drills.
- Irregular verbs are the primary target for this exercise type. Using a fully regular verb for a conjugation drill is low-value unless it is the first introduction of that tense pattern.
- At A1–A2, focus on present and preterite. At B1+, include modal constructions, past perfect, and conditional forms.

---

## Error Correction

- Exactly one error per sentence. A sentence with two errors forces the learner to guess which one to fix.
- The error must be a plausible learner mistake at the module's CEFR level — something a learner at this stage would actually produce.
- The sentence must otherwise be fully correct and natural. Do not introduce additional awkwardness around the error.
- The intended meaning must be recoverable despite the error — the learner needs to understand what the sentence is trying to say in order to identify the mistake.
- Clearly state what the error is and provide the corrected sentence. Format:
  ```
  Error: [description of the mistake]
  ✓ [corrected sentence with the fix bolded]
  ```
- Good error types by level:
  - A1–A2: wrong verb form (infinitive instead of present/preterite), wrong preposition (*af* vs *fra*), adjective not inflected for gender/number
  - B1: inversion missing after fronted adverbial, wrong subordinate clause word order, incorrect negation placement in embedded clause
  - B2–C2: register mismatch, wrong noun (*prioriteringer* vs *prioriteter*), redundant verb form, incorrect adjective agreement on less common gender

---

## Translation (Active)

- The canonical answer should be the most natural, common phrasing — not the most literal word-for-word rendering.
- The accepted alternatives list must cover all valid paraphrases for the target structure. For single-word targets with no synonyms (e.g., *I* → *jeg*), the list is empty — that is correct and expected.
- The English prompt must be unambiguous. If the English sentence has two possible readings, constrain it with a context note or rewrite it.
- At A1–A2, use single-clause sentences. At B1+ the prompt may include two clauses; at C1+ it may include a dependent clause or idiomatic structure.
- The exercise stores enough context for the AI "explain my mistake" call: the user's answer, the canonical answer, and the alternatives list. Do not generate exercises where the correct answer depends on unstated context.
- If a vocabulary item carries a `context` note in the data model, scope the prompt and alternatives to that sense (e.g., *stor — physical size*).
