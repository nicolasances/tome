# Spec: Alternative Translations — Frontend Core Logic

## Objective

Update the frontend session models, matching logic, and API client to support alternative translations. This is the foundational frontend change that all other frontend alternative-translations tasks build on.

Covers: `tome#254`

## Core Logic

### 1. Model updates

Add `alternativeTranslations` to both practice models:

**`model/VocabularyPractice.ts`**
```
VocabPracticeWord.alternativeTranslations: Array<{ id: string; translation: string }>
```

**`model/SentencePractice.ts`**
```
SentencePracticeSentence.alternativeTranslations: Array<{ id: string; translation: string }>
```

Default to `[]` when absent — backward compatible with any cached state.

### 2. API client updates

**`api/TomeVocabularyPracticeAPI.ts`**
- Extend `BackendWord` interface: add `alternativeTranslations?: Array<{ id: string; translation: string }>`
- Update `mapBackendWords`: map `alternativeTranslations: w.alternativeTranslations ?? []` into each `VocabPracticeWord`

**`api/TomeSentencePracticeAPI.ts`**
- Extend `BackendSentence` interface: add `alternativeTranslations?: Array<{ id: string; translation: string }>`
- Update `mapBackendSentences`: map `alternativeTranslations: s.alternativeTranslations ?? []` into each `SentencePracticeSentence`

### 3. Matching logic updates

**Vocabulary practice (`app/language-learning/vocabulary-practice/page.tsx`)**

Current matching:
```ts
const isCorrect = normalize(userAnswer) === normalize(word.translation);
```

Updated matching:
```ts
const isCorrect =
    normalize(userAnswer) === normalize(word.translation) ||
    word.alternativeTranslations.some(a => normalize(userAnswer) === normalize(a.translation));
```

**Sentence practice (`app/language-learning/sentence-practice/page.tsx`)**

Current Tier 1 + Tier 2:
```ts
const tier1 = normalize(userAnswer) === normalize(sentence.translation);
const tier2 = levenshteinDistance(...) / maxLen <= THRESHOLD;
const isCorrect = tier1 || tier2;
```

Updated to also check each alternative with both tiers:
```ts
const tier1 = matchesTier1(userAnswer, sentence.translation) ||
    sentence.alternativeTranslations.some(a => matchesTier1(userAnswer, a.translation));
const tier2 = !tier1 && (matchesTier2(userAnswer, sentence.translation) ||
    sentence.alternativeTranslations.some(a => matchesTier2(userAnswer, a.translation)));
const isCorrect = tier1 || tier2;
```

Extract `matchesTier1` and `matchesTier2` helper functions (or inline — same result as long as Tier 2 is only applied when Tier 1 fails, matching current behaviour).

### 4. New TomeLanguageAPI methods

Add to `api/TomeLanguageAPI.ts`:

```ts
addWordAlternative(language, wordId, translation): Promise<{ id: string; translation: string }>
  → POST /vocabulary/:language/words/:wordId/alternatives

removeWordAlternative(language, wordId, id): Promise<void>
  → DELETE /vocabulary/:language/words/:wordId/alternatives/:id

addSentenceAlternative(language, sentenceId, translation): Promise<{ id: string; translation: string }>
  → POST /sentences/:language/:sentenceId/alternatives

removeSentenceAlternative(language, sentenceId, id): Promise<void>
  → DELETE /sentences/:language/:sentenceId/alternatives/:id

getWord(language, wordId): Promise<WordDetail>
  → GET /vocabulary/:language/words/:wordId

getSentence(language, sentenceId): Promise<SentenceDetail>
  → GET /sentences/:language/:sentenceId
```

Add `WordDetail` and `SentenceDetail` interfaces:

```ts
export interface WordDetail {
    id: string;
    language: string;
    english: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
    alternativeTranslations: Array<{ id: string; translation: string }>;
}

export interface SentenceDetail {
    id: string;
    language: string;
    sentence: string;
    translation: string;
    createdAt: string;
    knowledgeSource: string;
    alternativeTranslations: Array<{ id: string; translation: string }>;
}
```

Also add `alternativeTranslations` to existing `WordWithStats` and `SentenceWithStats` interfaces (they are returned by the backend with-stats endpoints which now include the field).

### Architectural Decisions

- **`alternativeTranslations` defaults to `[]`** everywhere: in `mapBackendWords`, `mapBackendSentences`, and model constructors. This ensures backward compatibility with existing sessions in localStorage.
- **Matching logic is purely additive**: alternative matching is checked *in addition to* canonical translation. The result is the same boolean `isCorrect` — no other downstream logic changes.
- **Tier ordering preserved in sentence practice**: Tier 2 (fuzzy) is only attempted if Tier 1 (exact) fails across *all* candidates (canonical + alternatives). This preserves the existing behaviour that a close-enough answer gets accepted at Tier 2.

## Out of Scope

- The "Accept my translation" button UI (covered in `tome#255`)
- AI-corrected alternative storage (covered in `tome#256`)
- Detail pages (covered in `tome#257`, `tome#258`)
