# Spec: Sentences Page — Always-On Difficulty Signal

**GitHub Issue:** [#251 — Sentences Page: Always-On Difficulty Signal](https://github.com/nicolasances/tome/issues/251)
**Parent Feature:** [#249 — Vocabulary & Sentences — Always-On Difficulty Signal](https://github.com/nicolasances/tome/issues/249)
**Depends on:** [#250 — Vocabulary Page: Always-On Difficulty Signal](https://github.com/nicolasances/tome/issues/250) (for `DifficultySignal` component)

---

## Objective

Apply the same always-on difficulty signal pattern from the Vocabulary page to the Sentences page. Sentences always load hardest first and each row shows a difficulty signal icon.

This requires migrating the Sentences page away from the basic `getSentences` endpoint (which returns no stats) to the `getSentencesWithStats` endpoint (which returns `failureRatio` per sentence and supports difficulty sorting). The page also gains infinite scroll pagination as a side effect of using the paginated endpoint.

---

## Core Logic

### 1. API Layer — `getSentencesWithStats`

A new method `getSentencesWithStats()` is added to `TomeLanguageAPI`, and a new `SentenceWithStats` interface is exported.

```ts
async getSentencesWithStats(
  language: string,
  page: number,
  pageSize: number
): Promise<GetSentencesWithStatsResponse>
```

The method always appends `&sortBy=difficulty&sortDir=desc` to the query string. It calls the existing backend endpoint: `GET /sentences/:language/with-stats`.

**New types:**

```ts
export interface SentenceWithStats {
  id: string;
  sentence: string;
  translation: string;
  createdAt: string;
  knowledgeSource: string;
  stats: {
    failureRatio: number;
    totalAttempts: number;
    totalFailures: number;
    lastPracticed: string;
  } | null;
}

export interface GetSentencesWithStatsResponse {
  language: string;
  page: number;
  pageSize: number;
  totalCount: number;
  sentences: SentenceWithStats[];
}
```

### 2. Sentences Page Migration

The Sentences page is rewritten to match the Vocabulary page pattern:

- State: `sentences: SentenceWithStats[]`, `currentPage`, `totalCount`, `isLoading`, `isLoadingMore`, `error`
- `loadPage(page)` calls `getSentencesWithStats('danish', page, PAGE_SIZE)` and appends results
- Infinite scroll via `IntersectionObserver` on a sentinel `<div>` at the bottom of the list
- `PAGE_SIZE = 100` (consistent with Vocabulary)

The old `getSentences` call is removed from the page.

### 3. SentenceRow Update

The `SentenceRow` component is updated to include the `DifficultySignal` component (from issue #250) on the far right of the row.

The `sentence` prop type changes from `Sentence` to `SentenceWithStats`. The `failureRatio` is read from `sentence.stats?.failureRatio ?? null`.

---

## Out of Scope

- Search bar on the Sentences page
- Sort toggle / user-controlled sort direction
- Filter by difficulty tier
- Any backend changes
- Removing the existing `getSentences` method from `TomeLanguageAPI` (it may still be used elsewhere)
