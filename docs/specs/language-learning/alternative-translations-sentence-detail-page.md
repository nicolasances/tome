# Spec: Alternative Translations — Sentence Detail Page

## Objective
Add a sentence detail page at `/language-learning/sentences/[sentenceId]` where learners can view and manage alternative translations for a sentence. Make sentence list rows navigable to this page.

## Core Logic

### New page: `app/language-learning/sentences/[sentenceId]/page.tsx`

#### Data fetching
- On mount: `new TomeLanguageAPI().getSentence('danish', sentenceId)` → `SentenceDetail`.
- Show loading skeleton while fetching.
- Show error state on failure with a retry button.

#### Content
- Header area: Danish sentence (large, bold), English translation (medium), knowledgeSource badge.
- `knowledgeSource` badge: use local `MaskedSvgIcon` from `@/app/components/MaskedSvgIcon` (NOT from toto-react). `tome-agent` → `agent.svg`; otherwise → `book.svg`. Tailwind `bg-*` and `w-/h-` classes for color/size.
- Alternatives list: each row shows `translation` text + a small remove icon button. On click: call `removeSentenceAlternative('danish', sentenceId, alt.id)` fire-and-forget, update local state optimistically; on error, re-add.
- Add-new form at the bottom: `<input>` for text + `RoundButton` (from `toto-react`) to confirm. On confirm: call `addSentenceAlternative('danish', sentenceId, inputValue.trim())` fire-and-forget, append to list optimistically; clear input. On error, remove temporary entry.
- Back button in header: `router.push('/language-learning/sentences')`.

### Sentences list navigation
In `app/language-learning/sentences/page.tsx`, make `SentenceRow` clickable:
```tsx
<div ... onClick={() => router.push(`/language-learning/sentences/${sentence.id}`)} className="... cursor-pointer">
```
Pass `router` from the parent page via props or use `useRouter()` inside `SentenceRow`.

## Out of Scope
- Practice stats on the detail page.
- Editing the canonical sentence or translation.
- Pagination of alternatives.
