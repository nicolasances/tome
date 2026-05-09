# Sentences — Feature Spec

## Overview

The Sentences section gives users access to the sentences stored in `tome-ms-language`. Sentences may have been extracted from source material or generated on demand by an LLM agent.

This section is accessed from the **Knowledge Base** page and consists of two pages:
1. **Sentences List** — shows all stored sentences.
2. **Sentence Generation** — allows the user to trigger on-demand sentence generation.

---

## Page Routes

| Page                | Route                                      |
|---------------------|--------------------------------------------|
| Sentences List      | `/language-learning/sentences`             |
| Sentence Generation | `/language-learning/sentences/generate`    |

---

## API Client

Add a `TomeSentencesSection` to `api/TomeLanguageAPI.ts` (or as methods on the existing `TomeLanguageAPI`):

```ts
async getSentences(language: string): Promise<{ sentences: Sentence[] }>
```

And add a method to `TomeSourcesAPI.ts` for triggering generation:

```ts
async generateSentences(language: string, count: number): Promise<GenerateSentencesResult>
```

**Types:**

```ts
interface Sentence {
  id: string;
  sentence: string;        // The Danish sentence
  translation: string;     // English translation
  createdAt: string;       // ISO 8601
  knowledgeSource: string; // Source ID or "tome-agent"
}

interface GenerateSentencesResult {
  language: string;
  sentencesGenerated: number;
  sentencesCreated: number;
  sentencesErrored: number;
}
```

---

## Page 1 — Sentences List

**Route:** `/language-learning/sentences`

### Layout

- Standard app **Header** with the title "Sentences" and a back button (returns to `/language-learning/knowledge-base`).
- A **"Generate" `RoundButton`** displayed at the top of the content area, above the list. Tapping it navigates to `/language-learning/sentences/generate`.
- A **scrollable list** of all sentences for `language=danish`, fetched from `GET /tomelang/sentences/danish` on page load.

### Sentence List Row

Each sentence is displayed as a row containing:

| Element     | Content                                      |
|-------------|----------------------------------------------|
| Danish text | The `sentence` field, displayed prominently  |
| Translation | The `translation` field, displayed below as secondary text |

The list is sorted by `createdAt` descending (newest first).

### States

| State        | Display                                                                         |
|--------------|---------------------------------------------------------------------------------|
| Loading      | Skeleton placeholder rows (same pattern as the Vocabulary loading state)        |
| Empty list   | Friendly message: "No sentences yet — generate some!" with the Generate button still visible |
| Error        | Error message if the API call fails                                              |

### Visual Style

Follows the same style as the Vocabulary page (`/language-learning/vocabulary`):
- `sentence` (Danish) text in the app's primary colour (`var(--primary)`, `#155e75`)
- `translation` (English) in muted colour (`var(--muted-foreground)`)
- Consistent padding and vertical spacing; no dividers

---

## Page 2 — Sentence Generation

**Route:** `/language-learning/sentences/generate`

### Layout

- Standard app **Header** with the title "Generate Sentences" and a back button (returns to `/language-learning/sentences`).
- A **numeric input** labelled "Number of sentences to generate" (maps to the `count` field in the API request). Default value: `10`. Minimum: `1`. Maximum: `50`.
- A **"Generate" action button** (styled consistently with the "Ingest" button in the Source Detail page) that triggers generation.

### Generation Flow

Tapping "Generate" calls `POST /tomesources/sentences/generate` with:

```json
{
  "language": "danish",
  "count": <entered count>
}
```

The generation is **synchronous** — the HTTP request blocks until the backend completes. Generation may take significant time (multiple LLM calls, verification pass).

| Step | UI behaviour |
|------|--------------|
| Request in flight | Show an indeterminate loading indicator; disable the "Generate" button and the count input |
| Success (`200 OK`) | Hide the loading indicator; display a generation summary (see below); re-enable the button and input |
| Error (`4xx` / `5xx`) | Hide the loading indicator; show an error message; re-enable the button and input |

#### Generation Summary (on success)

Display the following values below the input:

| Label                  | Value                   |
|------------------------|-------------------------|
| Sentences generated    | `sentencesGenerated`    |
| Sentences stored       | `sentencesCreated`      |
| Errors                 | `sentencesErrored`      |

The summary replaces any previous result and persists until the user navigates away or triggers a new generation.

After a successful generation, a **"Back to Sentences" link or button** may be shown to direct the user back to the list where the new sentences will appear.

---

## Out of Scope

- Filtering sentences by source type (extracted vs. generated)
- Deleting individual sentences
- Server-side search
- Sentence detail page
