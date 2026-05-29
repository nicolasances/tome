# Exercise Generation Rules
*Rules the AI must follow when generating exercises for any module.*

These rules apply to all exercise generation: default module seeding, user-generated modules, bank refreshes, and level test banks.

---

## Required inputs

The exercises-generator skill must receive the following before producing any output. **Do not proceed if any of these are missing — request them explicitly.**

- **Module shell**: theme, communication goal, CEFR level.
- **Vocabulary list**: the full set of `VocabularyItem` records for the module, including `id`, `danish`, `english`, `type`, and `context`. Every `vocabularyItemId` in generated exercises must reference an `id` from this list.
- **Grammar concept list**: the full set of `GrammarConcept` records for the module, including `id` and `name`. Every `grammarConceptId` must reference an `id` from this list.

If the vocabulary or grammar concepts for the target module have not yet been generated, the vocabulary-generator skill must run first.

---

## Cross-cutting rules (all exercise types)

- Always set `type` to the correct string value: `multiple_choice`, `fill_blank`, `sentence_reorder`, `conjugation_drill`, `error_correction`, or `translation_active`.
- **Exactly one of `vocabularyItemId` or `grammarConceptId` must be set — never both, never neither.** The assignment is determined by exercise type, not by content:

  | Type | Links to |
  |---|---|
  | `multiple_choice` | `vocabularyItemId` |
  | `fill_blank` | `vocabularyItemId` |
  | `conjugation_drill` | `vocabularyItemId` (the verb being drilled; its forms are part of knowing the word) |
  | `translation_active` | `vocabularyItemId` |
  | `sentence_reorder` | `grammarConceptId` |
  | `error_correction` | `grammarConceptId` |

- The bank must include at least one exercise for **every vocabulary item** in the module and at least one for **every grammar concept** in the module. Vocabulary items are covered by vocabulary exercise types; grammar concepts are covered by grammar exercise types.
- `timesShown` is always `0` at generation time.
- Sentences must reflect the module's theme and CEFR register — a B2 business module should not produce A1-sounding sentences.
- Use vocabulary the learner has already seen earlier in the session (the Multiple Choice → Translation ordering scaffolds this).
- Do not use proper nouns as the blank or production target — they are either trivially guessable or arbitrarily unguessable.
- One focus per exercise. Do not introduce two unfamiliar structures in the same sentence.

---

## Multiple Choice

**Quality rules**

- Always populate `promptTranslation` with a natural English rendering of the full Danish sentence. The translation must include the correct English word in place of the blank — never `___`.
- The blank must represent a single, coherent lexical or grammatical unit.
- **Never split a discontinuous verb phrase across the blank boundary.** If the target phrase requires a negation or particle that appears after it, restructure the sentence so the blank captures the whole unit.
  - ✗ `Jeg ___ ikke kaffe.` → answer: `kan lide` → produces "Jeg kan lide ikke kaffe" (ungrammatical)
  - ✓ `Jeg ___ kaffe meget.` → answer: `kan lide`
  - ✓ `Jeg kan ___ lide kaffe.` → answer: `ikke` (if testing negation placement)
- Always generate exactly 3 distractors. Distractors must be:
  - The same word class as the answer
  - Plausible in context (not obviously wrong)
  - Distinct from each other and from the answer
- The correct answer must be unambiguous: inserting any distractor must not produce a second valid, natural sentence.
- Sentence length: at least 5 words.

**JSON output spec**
```json
{
  "type": "multiple_choice",
  "prompt": "Danish sentence with ___ marking the blank",
  "promptTranslation": "Full English sentence with the correct word in place of ___",
  "answer": "The correct Danish word or phrase",
  "distractors": ["wrong option 1", "wrong option 2", "wrong option 3"],
  "alternativeAnswers": [],
  "vocabularyItemId": "<id>",
  "grammarConceptId": null,
  "timesShown": 0
}
```

---

## Sentence Reorder

**Quality rules**

- Always populate `promptTranslation` with the English translation of the target sentence. The learner sees scrambled Danish word tiles and must know what sentence they are building.
- All words needed to form the correct sentence must be present — no omissions, no extras.
- The target sentence must have exactly one valid ordering. If two orderings are both grammatically and semantically valid, choose a different sentence.
- The exercise must test a specific structural rule (inversion after fronted adverbials, verb-second, subordinate clause word order, negation placement). A sentence with no structural challenge is not worth a reorder exercise.
- Ideal length: 5–9 words. Shorter is trivial; longer becomes a working-memory task.
- Punctuation belongs in the answer, not in the word tile list.

**JSON output spec**

The `prompt` contains the target sentence. The UI splits it into word tiles and scrambles them for display; the learner reassembles them. `answer` holds the same correctly ordered sentence.
```json
{
  "type": "sentence_reorder",
  "prompt": "The correctly ordered Danish target sentence",
  "promptTranslation": "English translation of the target sentence",
  "answer": "The correctly ordered Danish target sentence",
  "distractors": [],
  "alternativeAnswers": [],
  "vocabularyItemId": null,
  "grammarConceptId": "<id>",
  "timesShown": 0
}
```

---

## Fill in the Blank

**Quality rules**

- `promptTranslation` must translate the **entire** prompt sentence, not just the clause containing the blank. If the prompt is two clauses, both must appear — no truncation with `...`.
- `promptTranslation` must **never contain `___`**. Replace the blank position with the actual English equivalent of the target word. The full English sentence is how the learner understands what they are being asked to produce.
- **Same discontinuous-phrase rule as Multiple Choice.** The blank must not split a phrase whose parts require specific relative ordering with negation, reflexive pronouns, or particles.
- The sentence context must constrain the answer to exactly one correct form. If two different words or inflections are both valid in the blank, rewrite the exercise.
- When the task is inflection (not lexical choice), include a form hint in parentheses: the infinitive, e.g., *(spise)*, optionally with the tense, e.g., *(spise, preterite)*.
- The blank should not be the first word of the sentence — an unconstrained opening provides too little context.

**JSON output spec**
```json
{
  "type": "fill_blank",
  "prompt": "Danish sentence with ___ marking the blank",
  "promptTranslation": "Full English sentence with the target word included (no ___)",
  "answer": "The correct Danish word or inflected form",
  "distractors": [],
  "alternativeAnswers": [],
  "vocabularyItemId": "<id>",
  "grammarConceptId": null,
  "timesShown": 0
}
```

---

## Conjugation Drill

**Quality rules**

- `promptTranslation` is `null` for this type — the prompt is metalinguistic, not a sentence.
- The `prompt` must follow the exact format: `<infinitive> | <tense> | <subject>`, e.g., `at arbejde | preterite | jeg`.
- Always specify all three components. Never leave any implicit.
- For reflexive verbs, the expected answer includes the reflexive pronoun, e.g., *at føle sig*, present, *han* → `føler sig`.
- Vary the subject across exercises in a bank — do not default to *jeg* for all drills.
- Irregular verbs are the primary target for this type. A fully regular verb is only worth a conjugation drill when it is the first introduction of a tense pattern.
- At A1–A2, focus on present and preterite. At B1+, include modal constructions, past perfect, and conditional forms.

**JSON output spec**
```json
{
  "type": "conjugation_drill",
  "prompt": "at <verb> | <tense> | <subject>",
  "promptTranslation": null,
  "answer": "The correctly conjugated Danish form",
  "distractors": [],
  "alternativeAnswers": [],
  "vocabularyItemId": "<id>",
  "grammarConceptId": null,
  "timesShown": 0
}
```

---

## Error Correction

**Quality rules**

- Always populate `promptTranslation` with the English translation of the **intended** (correct) meaning. The learner must understand what the sentence is supposed to say in order to spot what is wrong.
- Exactly one error per sentence. A sentence with two errors forces the learner to guess which one to fix.
- The error must be a plausible learner mistake at the module's CEFR level.
- The sentence must otherwise be fully correct and natural — do not introduce additional awkwardness around the error.
- The intended meaning must be recoverable despite the error.
- `answer` contains the **full corrected sentence**, not just the fixed word.
- Good error types by level:
  - A1–A2: wrong verb form (infinitive instead of present/preterite), wrong preposition (*af* vs *fra*), adjective not inflected for gender/number
  - B1: inversion missing after fronted adverbial, wrong subordinate clause word order, incorrect negation placement in embedded clause
  - B2–C2: register mismatch, wrong noun (*prioriteringer* vs *prioriteter*), redundant verb form, incorrect adjective agreement on less common gender

**JSON output spec**
```json
{
  "type": "error_correction",
  "prompt": "The erroneous Danish sentence",
  "promptTranslation": "English translation of the intended correct meaning",
  "answer": "The full corrected Danish sentence",
  "distractors": [],
  "alternativeAnswers": [],
  "vocabularyItemId": null,
  "grammarConceptId": "<id>",
  "timesShown": 0
}
```

---

## Translation (Active)

**Quality rules**

- `promptTranslation` is `null` for this type — the prompt is already in English.
- The canonical `answer` should be the most natural, common phrasing — not the most literal rendering.
- `alternativeAnswers` must cover all valid paraphrases. For single-word targets with no synonyms (e.g., *I* → *jeg*), the list is empty — that is correct and expected.
- Store `alternativeAnswers` in natural form (not pre-normalized). The matching engine normalizes before comparing.
- The English prompt must be unambiguous. If the sentence has two possible readings, constrain it with a context note or rewrite it.
- At A1–A2, use single-clause sentences. At B1+, the prompt may include two clauses; at C1+, it may include a dependent clause or idiomatic structure.
- If a vocabulary item carries a `context` note in the data model, scope the prompt and alternatives to that sense (e.g., *stor — physical size*).

**JSON output spec**
```json
{
  "type": "translation_active",
  "prompt": "The English sentence to translate",
  "promptTranslation": null,
  "answer": "Canonical Danish translation (most natural phrasing)",
  "distractors": [],
  "alternativeAnswers": ["valid paraphrase 1", "valid paraphrase 2"],
  "vocabularyItemId": "<id>",
  "grammarConceptId": null,
  "timesShown": 0
}
```
