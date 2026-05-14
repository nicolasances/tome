# Source Management — Feature Spec

## Overview

The Source Management feature gives users a dedicated UI to maintain their **Language Knowledge Sources** — the data sources (e.g. Google Docs) that are ingested by `tome-ms-sources` and automatically generate vocabulary in Tome.

This feature is part of the **Language Learning** section of the app and is scoped to the current language context (currently `danish`).

The user journey mirrors the two-step model described in the [Data Sources in Language Learning](../../capabilities/language/data-sources.md) capability doc:

1. **Register** a data source (give it a name, type, and resource ID).
2. **Ingest** it on demand — extraction reads the document, identifies vocabulary, and inserts it into the vocabulary store.

For the backend API specification that powers this feature, see [`tome-ms-sources/docs/specs/language/source-knowledge-extraction.md`](https://github.com/nicolasances/tome-ms-sources/blob/main/docs/specs/language/source-knowledge-extraction.md).

---

## Language Scoping

The Sources Management feature is **scoped to the current Language Learning context** (currently `danish`). The `language` field is **never shown to the user** — it is always inferred from the Language Learning context and passed silently in every API call.

---

## API Client

### Registering `tome-ms-sources` in Config.ts

`tome-ms-sources` is not yet registered in `Config.ts`. The implementation must:
1. Add `'tome-ms-sources'` to the `ApiName` union type.
2. Add an entry in `ApiEndpoints` pointing to `process.env.NEXT_PUBLIC_TOME_SOURCES_API_ENDPOINT`.
3. Add `NEXT_PUBLIC_TOME_SOURCES_API_ENDPOINT` to `.env.local` (and deployment environment configuration).

### `api/TomeSourcesAPI.ts` (new file)

Create a dedicated API client class `TomeSourcesAPI` in `api/TomeSourcesAPI.ts`:

```ts
async getSources(language: string): Promise<GetSourcesResponse>
async createSource(req: CreateSourceRequest): Promise<{ id: string }>
async extractSource(sourceId: string): Promise<ExtractionResult>
```

**Types:**

```ts
interface Source {
  id: string;
  type: string;
  language: string;
  name: string;
  resourceId: string;
  createdAt: string;
  lastExtractedAt: string | null;
}

interface GetSourcesResponse {
  sources: Source[];
}

interface CreateSourceRequest {
  type: string;
  language: string;
  name: string;
  resourceId: string;
}

interface ExtractionResult {
  sourceId: string;
  wordsExtracted: number;
  wordsCreated: number;
  wordsErrored: number;
}
```

All methods call `tome-ms-sources` via `TotoAPI`. The base path for all `tome-ms-sources` endpoints is `/tomesources`.

---

## Page Routes

| Page | Route |
|---|---|
| Sources Management (list) | `/language-learning/sources` |
| Add Source | `/language-learning/sources/new` |
| Source Detail | `/language-learning/sources/[sourceId]` |

---

## Entry Point: Home Page Button

The Language Learning home page (`/language-learning`) must include an additional `RoundButton` labelled **"Manage Sources"** alongside the existing action buttons. Pressing it navigates to `/language-learning/sources`.

See the [Home Page spec](./home-page.md) for the updated button layout.

---

## Page 1 — Sources Management (List)

**Route:** `/language-learning/sources`

### Layout

- Standard app **Header** with the title "Sources" and a back button (returns to `/language-learning`).
- A **list of registered sources** for `language=danish`, fetched from `GET /tomesources/sources?language=danish`.
- A **"Add Source" `RoundButton`** at the bottom of the page that navigates to `/language-learning/sources/new`.

### Source List Row

Each source is displayed as a row containing:

| Element | Content |
|---|---|
| Type icon | SVG icon from `public/images/` mapped from the source `type` field (see [Type Icon Mapping](#type-icon-mapping)) |
| Name | The source `name` field |
| Last ingested | Formatted date from `lastExtractedAt`, or the text "Never ingested" if `lastExtractedAt` is `null` |

Tapping a row navigates to the Source Detail page for that source (`/language-learning/sources/[sourceId]`).

### States

| State | Display |
|---|---|
| Loading | Loading indicator while `GET /tomesources/sources` is in flight |
| Empty list | Friendly empty state message (e.g. "No sources yet — add one!") with the Add Source button still visible |
| Error | Error message if the API call fails |

### Type Icon Mapping

Each `type` value maps to an SVG icon file in `public/images/`:

| Type | Icon file | Label |
|---|---|---|
| `google_doc` | To be determined — use an appropriate existing icon or add a new `google-doc.svg` to `public/images/` | "Google Doc" |

When new source types are added to `tome-ms-sources`, this table must be extended accordingly.

---

## Page 2 — Add Source

**Route:** `/language-learning/sources/new`

### Layout

- Standard app **Header** with the title "Add Source" and a back button (returns to `/language-learning/sources`).
- A form with three fields (see below).
- A **"Save" `RoundButton`** at the bottom that submits the form.

### Fields

#### Type (required)

- Displayed as a **circular icon selector** showing the currently selected type's icon (or an empty circle if no type is selected yet).
- Tapping the circle opens a **bottom sheet** listing all supported source types, each with its icon and human-readable label (e.g. "Google Doc").
- Currently, only `google_doc` is supported.
- The sheet dismisses after the user selects a type, updating the circular selector.

#### Name (required)

- Free-text input.
- Purpose: a user-friendly, human-readable label for the source (e.g. "Week 3 Homework").

#### Resource ID (required)

- Free-text input.
- Content is type-specific. For `google_doc`, this is the **document ID** extracted from the Google Doc URL:
  ```
  https://docs.google.com/document/d/{documentId}/edit
  ```
- An inline helper text should clarify: *"Enter the document ID only, not the full URL."*
- The backend rejects values containing `/` with a `400`.

#### Language

Not shown to the user — always set to `danish` (inferred from the Language Learning context).

### Submission

On "Save", call `POST /tomesources/sources` with:

```json
{
  "type": "<selected type>",
  "language": "danish",
  "name": "<entered name>",
  "resourceId": "<entered resource ID>"
}
```

| Outcome | Behaviour |
|---|---|
| `201 Created` | Navigate back to `/language-learning/sources`; the new source appears in the list |
| `400` validation error | Show an inline error message below the relevant field (or at the bottom of the form if the error is non-field-specific) |
| Other error | Show a generic error message |

---

## Page 3 — Source Detail

**Route:** `/language-learning/sources/[sourceId]`

### Layout

- Standard app **Header** with the title set to the source name and a back button (returns to `/language-learning/sources`).
- Source detail fields (see below).
- An **"Ingest" `RoundButton`** at the bottom that triggers extraction.

### Source Detail Fields

| Field | Content |
|---|---|
| Name | Source `name` |
| Type | Type icon + human-readable label (e.g. "Google Doc") |
| Resource ID | The stored `resourceId` value |
| Created | Formatted date from `createdAt` |
| Last Ingested | Formatted date from `lastExtractedAt`, or "Never ingested" if `null` |

The source data is fetched from `GET /tomesources/sources?language=danish` on page load (filtering client-side by `sourceId`), or alternatively passed via router state from the list.

### Ingestion Flow

Tapping "Ingest" calls `POST /tomesources/sources/{sourceId}/extract`.

The extraction is **synchronous** — the HTTP request blocks until the backend completes. This can take a significant amount of time for large documents.

| Step | UI behaviour |
|---|---|
| Request in flight | Show an **indeterminate loading indicator** (spinner or indeterminate progress bar — not a determinate percentage bar, as no progress streaming is available); disable the "Ingest" button |
| Success (`200 OK`) | Hide the loading indicator; display an extraction summary (see below); update the "Last Ingested" field to the current time; re-enable the "Ingest" button |
| Error (`4xx`/`5xx`) | Hide the loading indicator; show an error message (e.g. *"Ingestion failed — make sure the document is shared with the service account"*); re-enable the "Ingest" button |

#### Extraction Summary (on success)

Display the following values below the source detail fields:

| Label | Value |
|---|---|
| Words extracted | `wordsExtracted` from the response |
| Words created | `wordsCreated` from the response |
| Words with errors | `wordsErrored` from the response |

The summary replaces any previous ingestion result and persists until the user navigates away or triggers a new ingestion.

---

## Sources List Component — TotoList Migration

The sources list page uses the `TotoList` component from `toto-react` instead of an inline `SourceRow` implementation.

### Mapping `Source` → `TotoListItem`

```ts
{
  id: source.id,
  icon: {
    src: sourceTypeIcon(source.type),
    alt: source.type,
    color: 'bg-cyan-800',
  },
  title: source.name,
  subtitle: `Last ingested: ${lastIngested}`,
  onClick: () => router.push(`/language-learning/sources/${source.id}`),
}
```

Where `lastIngested` is derived from `source.lastExtractedAt`:
- If non-null: `new Date(source.lastExtractedAt).toLocaleDateString()`
- If null: `'Never'`

### Loading State

`loading` prop is `true` when `sources === null && !error`.  
The `SourcesListSkeleton` component is no longer used on this page.

---

## Out of Scope

- Source **deletion** (not supported by the backend API)
- Editing an existing source's fields
- Sources for languages other than the current context
- Pagination of the source list
- Scheduling automatic extraction
- Migrating other list pages (sentences, vocabulary) to `TotoList`
