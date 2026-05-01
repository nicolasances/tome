# Vocabulary Management — Feature Spec

## Overview

The Vocabulary Management page allows the user to view and search their full vocabulary for a given language. It provides a read-only browsable list of all words the user is learning, with client-side search functionality.

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
| **Execution** | Client-side filtering only; no API call on search |
| **Debounce** | Optional; if implemented, debounce should be ≤300ms |

As the user types, the word list filters in real-time to show only words where either the Danish translation or the English word contains the search string.

---

## Word List

### Data Source

The word list is fetched from the **Tome Language API** on page load. The API client class should be implemented in the `/api` folder following the existing pattern (e.g. `TomeLanguageAPI.ts`).

### Display

Each list item displays:

| Element | Description |
|---------|-------------|
| **Danish word** | The target-language translation, displayed prominently |
| **English word** | The source-language word, displayed as secondary text below or beside the Danish word |

The list should be sorted **alphabetically by Danish word** (ascending).

### Visual Style

- List items should follow the app's standard list styling
- Use the app's primary colour (`var(--primary)`, `#155e75`) for the Danish word text
- Use a muted colour (`var(--muted-foreground)`) for the English translation
- Items should have consistent padding and spacing
- No dividers between items; use vertical spacing instead

### Loading State

While the vocabulary is being fetched, the page displays **skeleton placeholder items**:

- Show 3–5 placeholder list items in the same layout as real vocabulary items
- Each placeholder contains rectangular shapes where the Danish word and English translation would appear
- The placeholder text displays "Loading"
- A **horizontal gradient animation** sweeps across the placeholders from left to right, giving a shimmer effect to indicate loading activity
- The search bar is visible but disabled during loading

### Empty States

| State | Display |
|-------|---------|
| **No words** | Display a message: "No vocabulary words yet" |
| **No search results** | Display a message: "No words match your search" |

---

## Interactions

| Interaction | Behaviour |
|-------------|-----------|
| **Tap on list item** | No action (future: may open word detail view) |
| **Scroll** | Standard vertical scrolling; search bar remains fixed |
| **Pull to refresh** | Not required for initial implementation |

---

## State Management

The page maintains the following local state:

| State | Description |
|-------|-------------|
| **words** | Full list of vocabulary words fetched from the API |
| **searchQuery** | Current value of the search input |
| **filteredWords** | Derived from `words` filtered by `searchQuery` |
| **isLoading** | Boolean indicating if the initial fetch is in progress |
| **error** | Error state if the API call fails |

---

## Error Handling

If the vocabulary API call fails:

- Display an error message to the user
- Provide a retry option (e.g. a "Retry" button or tap-to-retry)

---

## Out of Scope

- Adding, editing, or deleting words from this page
- Server-side search or pagination
- Filtering by knowledge source or date
- Word detail view
- Audio pronunciation
- Export functionality
