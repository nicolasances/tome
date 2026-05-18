# Spec: Responsive Language Learning Hub, Knowledge Base & Summary Pages

**Related issues:** [#262](https://github.com/nicolasances/tome/issues/262), [#260](https://github.com/nicolasances/tome/issues/260)

## Objective

Make the Language Learning hub, knowledge base and session summary pages look good on screens larger than mobile. These pages don't have the fixed-positioning bug of the practice pages, but their content stretches across the full content column on wide screens.

The goal is two-size responsiveness:
1. **Mobile (< 768px / `md` breakpoint):** keep the existing layout exactly as-is.
2. **Larger-than-mobile (≥ 768px):** content is centered with a max-width cap.

---

## Core Logic

### Breakpoint Strategy

Use Tailwind's `md` breakpoint (768px) as the single threshold. No other breakpoints needed.

### Max-Width Centering

For each page, wrap the page body content in a `max-w-2xl mx-auto w-full` container that activates at `md+`. This ensures content is centered in the middle of the column rather than stretching edge-to-edge.

### Changes Required

#### `app/language-learning/page.tsx` (Hub)

- Wrap the inner content `div` with `md:max-w-2xl md:mx-auto md:w-full`.

#### `app/language-learning/knowledge-base/page.tsx`

- Wrap the row list container with `md:max-w-2xl md:mx-auto md:w-full`.

#### `app/language-learning/summary/page.tsx` (Vocab Session Summary)

- Wrap the content with `md:max-w-2xl md:mx-auto md:w-full`.

#### `app/language-learning/sentence-summary/page.tsx` (Sentence Session Summary)

- Wrap the content with `md:max-w-2xl md:mx-auto md:w-full`.

---

## Out of Scope

- Practice pages (vocabulary-practice, sentence-practice) — covered by a separate spec
- Vocabulary list, sentences list, sources pages
- Any change to the root `layout.tsx`
