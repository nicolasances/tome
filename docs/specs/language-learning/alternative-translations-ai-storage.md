# Spec: Alternative Translations — Store AI-Corrected Alternatives in Sentence Practice

## Objective
When the AI cascade accepts a sentence translation, automatically store the AI-corrected version as a community alternative. Extend the `/api/llm-verify` route and `LLMVerifyResult` type to return a `correctedTranslation` field containing the learner's answer with grammar/spelling corrections applied.

## Core Logic

### `app/api/llm-verify/route.ts`

#### `buildPrompt` update
Add the following instruction to the prompt:
> When acceptable is true, also return correctedTranslation: the learner's answer with any spelling or grammar mistakes fixed, without changing the meaning or phrasing. If no corrections are needed, return the learner's answer unchanged.

Updated JSON schema in prompt:
```
{"acceptable": true|false, "explanation": "<one sentence>", "correctedTranslation": "<string>"}
```
`correctedTranslation` is present only when `acceptable: true`.

#### `callGemini` update
- Extract `correctedTranslation` from the parsed response (optional string, absent when `acceptable: false`).
- Return type becomes `{ acceptable: boolean; explanation: string; correctedTranslation?: string }`.
- Validation: if `acceptable: true` but `correctedTranslation` is absent/null, treat as empty (fallback handled in caller).

### `api/TomeLLMVerifyAPI.ts`
Add `correctedTranslation?: string` to `LLMVerifyResult`.

### `app/language-learning/sentence-practice/page.tsx` — `handleAskAI`
After `verdict.acceptable === true` and the correct delta is computed:
```ts
new TomeLanguageAPI().addSentenceAlternative('danish', sentence.id, verdict.correctedTranslation ?? result.userAnswer)
    .catch((e) => console.error('addSentenceAlternative failed:', e));
```
Fire-and-forget. Does not affect practice flow.

## Out of Scope
- Showing the corrected translation in the UI (the LLM result card already shows the explanation).
- AI validation for vocabulary words.
- "Accept my translation" button for sentence practice (AI gate is the acceptance mechanism for sentences).
