# Spec: Responsive Language Learning Practice Pages

**Related issues:** [#261](https://github.com/nicolasances/tome/issues/261), [#260](https://github.com/nicolasances/tome/issues/260)

## Objective

Make the Vocabulary Practice and Sentence Practice pages responsive so they look and work correctly on screens larger than a mobile phone (laptops, tablets, desktop).

Currently both practice pages have a bottom input bar that uses `fixed bottom-0 left-0 right-0`, causing it to span the full viewport width — including the side panels introduced by the root layout at `xl`/`2xl` breakpoints. On a laptop, this is visually broken.

The goal is two-size responsiveness:
1. **Mobile (< 768px / `md` breakpoint):** keep the existing layout exactly as-is.
2. **Larger-than-mobile (≥ 768px):** content and input bar are centered within the content column, with a max-width cap.

---

## Core Logic

### Breakpoint Strategy

Use Tailwind's `md` breakpoint (768px) as the single threshold between mobile and non-mobile layouts. No intermediate or larger breakpoints are needed.

### Bottom Input Bar — Replace `fixed` with flex-child

The current `fixed bottom-0 left-0 right-0` positions the bar relative to the viewport, bypassing all layout containers. This is the root cause of the desktop breakage.

**Fix:** Remove `fixed` entirely. The practice page root div already uses `h-full` with `flex flex-col`, so the bottom bar naturally sticks to the bottom when placed as the last flex child. No layout changes are needed to the parent — just remove the `fixed` positioning.

On mobile, the behavior is identical: the bar stays at the bottom of the full-height page. On desktop, it stays within the content column.

### Max-Width Centering

On `md+` screens, constrain the practice content and input bar to `max-w-2xl` centered horizontally (`mx-auto`), so the content doesn't stretch awkwardly across a wide column.

Both the scrollable content area and the bottom bar should share the same max-width wrapper to stay visually aligned.

### Changes Required

#### `app/language-learning/vocabulary-practice/page.tsx`

1. **Bottom bar:** change from:
   ```tsx
   <div className="fixed bottom-0 left-0 right-0 p-4 bg-background">
   ```
   to a non-fixed flex child:
   ```tsx
   <div className="p-4 bg-background">
   ```

2. **Content area:** add `md:max-w-2xl md:mx-auto w-full` to the main content wrapper and the bottom bar wrapper.

3. **Outer container:** add a wrapper div with `md:max-w-2xl md:mx-auto md:w-full` that groups both the content area and the bottom bar, so they share the same horizontal centering.

#### `app/language-learning/sentence-practice/page.tsx`

Identical changes to vocabulary-practice.

---

## Out of Scope

- Knowledge base, vocabulary list, sentences list, sources pages
- Summary pages (covered by a separate spec)
- Any change to the root `layout.tsx`
- Screen sizes between `md` and `xl` are not special-cased; the same rules apply to all non-mobile sizes
- No typography size changes — font sizes remain as-is
