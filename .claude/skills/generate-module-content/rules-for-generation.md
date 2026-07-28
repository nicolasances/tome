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

## Exercise bank composition by CEFR level

The bank's distribution across exercise types must respect the targets below. These are **bank-level targets**, not per-exercise quotas — hit the range across the full bank, not on every individual exercise.

The progression reflects a deliberate pedagogical shift: at A1 recognition is appropriate while production skills are being bootstrapped; by C2 production should dominate and multiple choice is nearly useless.

| Level | `multiple_choice` | `fill_blank` | `sentence_reorder` | `conjugation_drill` | `error_correction` | `translation_active` |
|---|---|---|---|---|---|---|
| A1 | ≤ 45% | 10–15% | 8–12% | 8–12% | 5–10% | ≥ 10% |
| A2 | ≤ 35% | 12–18% | 8–12% | 8–12% | 8–12% | ≥ 15% |
| B1 | ≤ 25% | 15–20% | 10–15% | 10–15% | 10–15% | ≥ 20% |
| B2 | ≤ 20% | 15–20% | 10–15% | 8–12% | 12–18% | ≥ 25% |
| C1 | ≤ 15% | 15–20% | 10–15% | 5–10% | 15–20% | ≥ 30% |
| C2 | ≤ 10% | 15–20% | 10–15% | 5–8% | 15–20% | ≥ 35% |

**Notes:**
- The percentages in a row do not sum to 100 — ranges overlap intentionally. The distribution should land within all stated bounds simultaneously; adjust proportions to fit.
- At C1–C2, `conjugation_drill` is limited because regular conjugation is already mastered; target irregular or register-specific forms only.
- The coverage requirement (≥1 exercise per vocabulary item — target 2 — and ≥1 per grammar concept) takes precedence. If a module has many vocabulary items, meeting coverage may push `multiple_choice` above the ceiling — flag this in the self-validation note rather than leaving items uncovered. Coverage is the hard gate; distribution targets yield to it.

---

## Cross-cutting rules (all exercise types)

- Always set `type` to the correct string value: `multiple_choice`, `fill_blank`, `sentence_reorder`, `conjugation_drill`, `error_correction`, or `translation_active`.
- **Exactly one of `vocabularyItemId` or `grammarConceptId` must be set — never both, never neither.** For most types the assignment is fixed by exercise type; `translation_active` is the one exception, where it depends on content:

  | Type | Links to |
  |---|---|
  | `multiple_choice` | `vocabularyItemId` |
  | `fill_blank` | `vocabularyItemId` |
  | `conjugation_drill` | `vocabularyItemId` (the verb being drilled; its forms are part of knowing the word) |
  | `translation_active` | `vocabularyItemId` **or** `grammarConceptId` — whichever the exercise's single focus is testing (see below) |
  | `sentence_reorder` | `grammarConceptId` |
  | `error_correction` | `grammarConceptId` |

  For `translation_active`, decide the link by what the exercise is actually testing: if the English prompt's only real challenge is recalling/producing a specific word, link `vocabularyItemId`; if the only real challenge is producing a specific grammatical structure (word order, inversion, negation placement, etc.), link `grammarConceptId` instead. See the "Translation (Active)" section below for authoring guidance on the grammar-linked case.

- **Coverage is a hard MUST, and it now has two independent targets:**
  - **Baseline (scaffolding) coverage** — every vocabulary item and every grammar concept must have **at least one** exercise of any type. This is the existing floor and stays as-is; aim for two exercises per item so this passes comfortably.
  - **Production coverage (new, gates practice completion)** — every vocabulary item **and** every grammar concept must additionally have **at least two `translation_active` exercises** each. This is the number that actually matters: the app's practice-completion gate counts correct answers on `translation_active` exercises specifically, so a vocab item or grammar concept with only `multiple_choice`/`fill_blank`/`sentence_reorder`/etc. coverage will never let a user complete practice for it, no matter how many non-`translation_active` exercises exist. Two *distinct* exercises are required (not one exercise reused) so a user's two spaced production reps aren't the same question twice.

  Both checks are enforced by `validate_coverage.py` (Phase 4, Step 1): generation is not done until it exits 0.

  > **Bank-size note:** the production-coverage requirement is a much bigger ask than it looks. A typical A1 module (e.g. ~47 vocab items + ~3 grammar concepts) now needs on the order of **100 `translation_active` exercises** just to satisfy this, versus banks generated under the old rules that had as few as 17. In practice this means the overall exercise bank must grow substantially (roughly 2–3x current sizes) — you cannot hit this by only adding more `translation_active` exercises in isolation; the other exercise types must scale up proportionally too, or they'll fall below their own distribution floors (see the composition table above). `validate_distribution.py` needs no logic change for this — `translation_active` already has no ceiling — but expect noticeably larger banks going forward.
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

- `prompt` is the **English translation** of the target sentence — the clue that tells the learner what sentence they are building. It is never the Danish sentence.
- `answer` is the **correctly ordered Danish sentence** (the canonical target).
- `words` is the **shuffled array of Danish word tokens** the app renders as draggable tiles. Rules:
  - Strip trailing sentence punctuation (`.`, `!`, `?`) from the last token — punctuation goes in `answer`, not in the tile list.
  - Preserve all other surface forms exactly as they appear in `answer` (capitalisation of the first word, hyphens, etc.).
  - The array must be shuffled — do not emit the words in their correct order.
  - No omissions, no extras: the tiles must be exactly sufficient to form `answer` (minus final punctuation).
- When multiple word orderings are grammatically and semantically valid (e.g. SVO vs. fronted-object inversion), **do not discard the sentence** — use the most natural spoken Danish form as `answer` and list all other valid orderings in `alternativeAnswers`. The tile set in `words` covers all orderings automatically since they use the same tokens.
- The exercise must test a specific structural rule (inversion after fronted adverbials, verb-second, subordinate clause word order, negation placement). A sentence with no structural challenge is not worth a reorder exercise.
- Ideal length: 5–9 words. Shorter is trivial; longer becomes a working-memory task.

**JSON output spec**
```json
{
  "type": "sentence_reorder",
  "prompt": "English translation of the target sentence",
  "promptTranslation": null,
  "answer": "The correctly ordered Danish target sentence.",
  "words": ["Danish", "word", "Jeg", "tokens", "shuffled"],
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
- `answer` contains the **full corrected sentence**, not just the fixed word. Use the most natural spoken Danish form as the canonical answer.
- If the corrected sentence admits multiple valid word orderings (e.g. both "Det ved jeg ikke" and "Jeg ved det ikke" are valid corrections of "Jeg ikke ved det"), list all valid forms in `alternativeAnswers`. The error itself is still exactly one; it is the corrected result that can have variants.
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
- The canonical `answer` should be the most natural spoken Danish form — not the most literal or most SVO rendering.
- `alternativeAnswers` must cover all valid paraphrases, including word-order variants. In Danish, fronted-object and SVO forms are often both valid (e.g. *Det ved jeg ikke* vs. *Jeg ved det ikke*): the more natural spoken form goes in `answer`, the other in `alternativeAnswers`. For single-word targets with no synonyms (e.g., *I* → *jeg*), the list is empty — that is correct and expected.
- Store `alternativeAnswers` in natural form (not pre-normalized). The matching engine normalizes before comparing.
- The English prompt must be unambiguous. If the sentence has two possible readings, constrain it with a context note or rewrite it.
- At A1–A2, use single-clause sentences. At B1+, the prompt may include two clauses; at C1+, it may include a dependent clause or idiomatic structure.
- This type links to **either** `vocabularyItemId` or `grammarConceptId` (see Cross-cutting rules above) — decide which before writing the prompt, since that decision shapes what the sentence must force:
  - **Vocabulary-focused**: if a vocabulary item carries a `context` note in the data model, scope the prompt and alternatives to that sense (e.g., *stor — physical size*). Any grammar the sentence happens to involve is incidental — pick simple, already-mastered structures so the only real challenge is recalling/producing the target word.
  - **Grammar-focused**: the English prompt must force the specific structure being tested (e.g. inversion after a fronted adverbial, subordinate-clause word order, negation placement) as an unavoidable, non-incidental part of a correct answer — the same standard `sentence_reorder`/`error_correction` already hold grammar exercises to. A learner must not be able to produce a correct Danish sentence while sidestepping the tested structure (e.g. by choosing a different word order that avoids it). Vocabulary used in the sentence should already be familiar/simple, so the difficulty is isolated to the grammar point, not split across two unknowns.

**JSON output spec**

Vocabulary-focused example:
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

Grammar-focused example (`vocabularyItemId`/`grammarConceptId` swap — everything else about the shape is identical):
```json
{
  "type": "translation_active",
  "prompt": "English sentence engineered so a correct answer requires the tested structure",
  "promptTranslation": null,
  "answer": "Canonical Danish translation exhibiting the tested structure",
  "distractors": [],
  "alternativeAnswers": ["valid paraphrase 1 (still exhibiting the structure)"],
  "vocabularyItemId": null,
  "grammarConceptId": "<id>",
  "timesShown": 0
}
```
