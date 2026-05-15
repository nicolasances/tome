# Vocabulary Management — Feature Spec

## Overview

The Vocabulary Management page allows the user to view and search their full vocabulary for a given language. It provides a read-only browsable list of words the user is learning, loaded progressively via **infinite scroll pagination**, with client-side search functionality over loaded words.

The target language currently supported is **Danish**.

---

## Entry Point

The page is accessible from the Language Learning home page. The route is `/language-learning/vocabulary`.

A navigation link or button on the Language Learning home page directs the user to this screen.

---

## Page Structure

The page consists of two main sections:

1. **Header** — the standard app header with the title "Vocabulary" and a back button that returns to the Language Learning home page.
2. **Search Bar** — a fixed search input at the top of the content area.
3. **Word List** — a scrollable list displaying all vocabulary words.

---

## Search Bar

| Property | Description |
|----------|-------------|
| **Position** | Fixed at the top of the content area; does not scroll with the list |
| **Placeholder text** | "Search words..." |
| **Search scope** | Searches both the Danish word and the English translation |
| **Search method** | Case-insensitive substring match |
| **Execution** | Client-side filtering over currently-loaded words; no API call on search |
| **Debounce** | Optional; if implemented, debounce should be ≤300ms |

As the user types, the word list filters in real-time to show only loaded words where either the Danish translation or the English word contains the search string.

---

## Word List

### Data Source

Words are loaded from the **Tome Language API** using the paginated `with-stats` endpoint:

```
GET /vocabulary/:language/with-stats?page=<n>&pageSize=100
```

The API client method `getVocabularyWithStats(language, page, pageSize)` is defined in `TomeLanguageAPI.ts`.

- **Page 1** is fetched on mount.
- **Subsequent pages** are fetched via infinite scroll (see [Pagination / Infinite Scroll](#pagination--infinite-scroll)).
- Response shape: `{ language, page, pageSize, totalCount, words: WordWithStats[] }`
- Words include a `stats` field (practice statistics) which is **not displayed** in the current implementation.

### Sort Order

The server returns words sorted by **failure ratio descending** (hardest words first). Words with no practice history appear at the end. The client does **not** re-sort the list.

### Display

Each list item displays:

| Element | Description |
|---------|-------------|
| **Danish word** | The target-language translation, displayed prominently |
| **English word** | The source-language word, displayed as secondary text below or beside the Danish word |

### Visual Style

- List items should follow the app's standard list styling
- Use the app's primary colour (`var(--primary)`, `#155e75`) for the Danish word text
- Use a muted colour (`var(--muted-foreground)`) for the English translation
- Items should have consistent padding and spacing
- No dividers between items; use vertical spacing instead

### Loading State

**Initial load (page 1):**
- The full `VocabularyListSkeleton` (10 rows) is shown while page 1 is fetching.
- The search bar is visible but disabled.

**Subsequent pages (infinite scroll):**
- A smaller `VocabularyListSkeleton` (5 rows) is rendered **below** the already-loaded words while the next page loads.
- The search bar remains enabled.

### Empty States

| State | Display |
|-------|---------|
| **No words** | Display a message: "No vocabulary words yet" |
| **No search results** | Display a message: "No words match your search" |

---

## Pagination / Infinite Scroll

The list uses **infinite scroll** to progressively load vocabulary pages.

### Mechanism

An `IntersectionObserver` watches a sentinel `<div>` placed at the bottom of the word list. When the sentinel enters the viewport:

1. If `hasMore` is `true` and `isLoadingMore` is `false`, fetch `currentPage + 1`.
2. Append the returned words to the existing list.
3. Update `currentPage` and compare `words.length` to `totalCount` to determine `hasMore`.

When `hasMore` becomes `false`, the observer is disconnected.

The observer is cleaned up in the `useEffect` return function.

### Page Size

100 words per page (matches backend default).

---

## Interactions

| Interaction | Behaviour |
|-------------|-----------|
| **Tap on list item** | No action (future: may open word detail view) |
| **Scroll** | Standard vertical scrolling; search bar remains fixed; triggers next page load at bottom |
| **Pull to refresh** | Not required |

---

## State Management

The page maintains the following local state:

| State | Type | Description |
|-------|------|-------------|
| **words** | `WordWithStats[]` | Accumulated list of all loaded words |
| **currentPage** | `number` | Last page number successfully fetched |
| **totalCount** | `number` | Total number of words server-side |
| **searchQuery** | `string` | Current value of the search input |
| **isLoading** | `boolean` | True while fetching page 1 |
| **isLoadingMore** | `boolean` | True while fetching any page > 1 |
| **error** | `string \| null` | Error state if the API call fails |

`hasMore` is derived: `words.length < totalCount`.

`filteredWords` is derived: `words` filtered by `searchQuery`.

---

## Error Handling

If the vocabulary API call fails:

- Display an error message to the user
- Provide a retry option (e.g. a "Retry" button or tap-to-retry)

---

## Out of Scope

- Adding, editing, or deleting words from this page
- Server-side search
- Displaying word practice statistics (`failureRatio`, `totalAttempts`, etc.)
- Filtering by knowledge source or date
- Word detail view
- Audio pronunciation
- Export functionality
