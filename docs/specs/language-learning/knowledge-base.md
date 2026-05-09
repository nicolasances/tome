# Knowledge Base — Feature Spec

## Overview

The Knowledge Base (KB) is a section of the Language Learning module that gives users access to the accumulated knowledge stored in Tome: their **vocabulary** and their **sentences**.

It is accessed from the Language Learning home page and acts as a hub — routing the user to either the Vocabulary page or the new Sentences section.

---

## Entry Point: Home Page Button

The Language Learning home page must include a **"Knowledge Base" `RoundButton`** alongside the existing action buttons. Pressing it navigates to `/language-learning/knowledge-base`.

The button replaces the existing direct vocabulary shortcut on the home page. Access to vocabulary is now exclusively through the KB page.

See [Home Page spec](./home-page.md) for the updated button layout.

---

## Page Route

| Page            | Route                             |
|-----------------|-----------------------------------|
| Knowledge Base  | `/language-learning/knowledge-base` |

---

## Page Layout

- Standard app **Header** with the title "Knowledge Base" and a back button (returns to `/language-learning`).
- A list of two navigation rows (styled like `SourceRow` in the sources page), each with an icon and label:

| Row         | Icon                     | Label         | Navigation target             |
|-------------|--------------------------|---------------|-------------------------------|
| Vocabulary  | Book icon (`book.svg`)   | "Vocabulary"  | `/language-learning/vocabulary` |
| Sentences   | Sentences icon           | "Sentences"   | `/language-learning/sentences`  |

Each row is a tappable element. Tapping navigates to the corresponding page.

### Row Style

The rows follow the same visual style as `SourceRow` in the Sources page (`/language-learning/sources`):
- Icon on the left (using `MaskedSvgIcon` from `@/app/components/MaskedSvgIcon`)
- Label text to the right of the icon
- Consistent padding, tap highlight on press

---

## Out of Scope

- Count badges on each row (e.g. "42 words")
- Search or filtering from the KB page
- Additional knowledge types beyond Vocabulary and Sentences (may be added later)
