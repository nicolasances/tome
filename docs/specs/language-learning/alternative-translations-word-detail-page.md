# Spec: Alternative Translations — Word Detail Page

## Objective
Add a word detail page at `/language-learning/vocabulary/[wordId]` where learners can view and manage alternative translations for a vocabulary word. Make vocabulary list items navigable to this page.

## Core Logic

### New page: `app/language-learning/vocabulary/[wordId]/page.tsx`

#### Data fetching
- On mount: `new TomeLanguageAPI().getWord('danish', wordId)` → `WordDetail`.
- Show loading skeleton while fetching.
- Show error state on failure with a retry button.

#### Content
- Header area: English word (large, bold), canonical translation (medium), knowledgeSource badge.
- `knowledgeSource` badge: use local `MaskedSvgIcon` from `@/app/components/MaskedSvgIcon` (NOT from toto-react). `tome-agent` → `agent.svg`; otherwise → `book.svg`. Use Tailwind `bg-*` and `w-/h-` classes for color/size.
- Alternatives list: each row shows `translation` text + a small remove icon button. On click: call `removeWordAlternative('danish', wordId, alt.id)` fire-and-forget, update local state optimistically (remove immediately); on error, re-add to list.
- Add-new form at the bottom: `<input>` for text + `RoundButton` (from `toto-react`) to confirm. On confirm: call `addWordAlternative('danish', wordId, inputValue.trim())` fire-and-forget, append returned object to list optimistically (generate a temporary id if needed); clear input. On error, remove temporary entry.
- Back button in header: `router.push('/language-learning/vocabulary')`.

### Vocabulary list navigation
In `app/language-learning/vocabulary/page.tsx`, make `WordItem` clickable:
```tsx
<div ... onClick={() => router.push(`/language-learning/vocabulary/${word.id}`)} className="... cursor-pointer">
```
Pass `router` from the parent page via props or use `useRouter()` inside `WordItem`.

## Out of Scope
- Practice stats on the detail page.
- Editing the canonical translation.
- Pagination of alternatives (expected to be a short list).
