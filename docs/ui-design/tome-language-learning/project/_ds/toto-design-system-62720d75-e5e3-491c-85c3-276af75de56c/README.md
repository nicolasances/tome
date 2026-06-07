# Toto Design System

**Toto** is a personal "system of apps" that manage everyday life — from **expenses** and **grocery shopping** to **learning & memory**. The apps are independent products that share one unmistakable identity: a screen flooded with a single signature cyan, rounded **Comfortaa** type, circular icon-buttons with bright accent borders, animated graphs and progress rings, and **no shadows at all**. Everything is flat, friendly, and a little playful.

This repository is a design system: brand foundations, color & type tokens, real assets pulled from the product codebases, and high-fidelity UI kits you can assemble into new screens, mocks, or production work.

---

## Source material

This system was reconstructed from two live repositories (read them for deeper fidelity):

| Product | Repo | What it is |
|---|---|---|
| **Toto Expenses** | https://github.com/nicolasances/toto-reactjs-expenses | A React (CRA) mobile-PWA expense tracker — months, categories, insight graphs, and little "games" for reconciling data. |
| **Tome** | https://github.com/nicolasances/tome | A Next.js + Tailwind language-learning & memory app built around active recall — vocabulary/sentence practice, topics, flashcards, progress rings. |

The broader Toto ecosystem (supermarket app "Suppie", diet, training, many microservices) lives across the `nicolasances/*` org — explore it to build even richer designs. The two repos above are the canonical front-ends and the basis for every token and component here.

> The reader is **not** assumed to have access to these repos — all needed values and assets have been copied into this project. Links are kept for those who do.

---

## How the apps look (one-paragraph gestalt)

Open any Toto app and you see a **full-bleed cyan screen** (`#00acc1`). A centered, lowercase-friendly **Comfortaa** title sits at the top with small round back/menu buttons either side. Primary actions are **circular icon-buttons** — a thin 2px ring (lime in Tome, yellow in Expenses) around a masked monochrome glyph; tapping shrinks them to 95%. Data is the hero: **d3 bar charts grow up from the baseline**, **progress rings sweep** in lime over a cyan-600 track, **bars fill** left-to-right. There are no cards-with-shadows — surfaces are either a brighter cyan fill or just a hairline cyan border. The mood is calm, rounded, and toy-like.

---

## Content fundamentals

How Toto writes. (Drawn from in-product copy across both apps.)

- **Voice:** terse, functional, first-name-basis with the user. It's a personal tool, not a marketed product — copy reads like labels the owner wrote for himself.
- **Person:** mostly **imperative / label-style** ("Practice", "New Topic", "Manage Sources", "Settings"). Rarely full sentences. When status is shown it's plain ("Loading stats…", "No data yet").
- **Casing:** **Title Case** for screen titles and menu items ("Language Learning", "Car Mode", "New Topic"). **ALL-CAPS with wide letter-spacing** for micro-labels above groups and on icon buttons ("PRACTICE", category names). Sentence case for transient status text.
- **Tone:** quietly playful. Feature and game names are punning/invented — "Kupload", "Rekoncile", "Inkome", "Cattie", "Suppie", "Monkey loader". The mascot is a **chimp/monkey** (loaders, games).
- **Length:** extremely short. One or two words per control. No marketing paragraphs, no onboarding prose, no helper text unless it states a fact.
- **Numbers:** money and counts are shown big and bare — "current/max" with the max in a smaller weight (e.g. `12/20`), amounts as plain figures with a tiny currency caption.
- **Emoji:** **none.** Personality comes from the custom SVG icon set and the monkey mascot, never from emoji.
- **Examples:** `Payments` (screen title) · `PRACTICE` (group label) · `New Topic` · `Car Mode` `active` · `Loading stats…` · `No data yet` · `12/20`.

---

## Visual foundations

Answers to "what does Toto actually look like", at the pixel level.

### Color
- **One brand color owns the screen:** cyan `#00acc1`. It is the background of literally every app. Designs are not "white pages with cyan accents" — they are **cyan pages**.
- **Surfaces** are expressed by shifting cyan, not by elevation: a brighter card cyan (`#00dffa`), a translucent darker fill (`bg-cyan-700/60`), or a hairline border (`#09a6d1`). 
- **Text is dark, not black:** `rgba(0,0,0,0.7)` for body, `0.8` for emphasis, `0.5` for muted — soft charcoal on cyan. On deep-teal surfaces, text flips to pale cyan (`#ecfeff`).
- **Two accent sparks, used one-at-a-time:** **lime** (`#d9f99d`) for progress/active state in Tome, **yellow** (`#ffeb3b`) for icon-button rings & glyphs in Expenses. A muted-yellow (`#c8b900`) underlines the selected month.
- **Deep teal** (`#004450` / cyan-800 `#155e75`) is the high-contrast anchor — login orb, chart bars, primary buttons.
- **Imagery/icons** are monochrome and recolored to fit — there is no photography. The palette is **cool, saturated, flat** — no gradients, no grain, no warmth.

### Type
- **Comfortaa** is the brand face — a rounded geometric sans, used at weights 300/400/700. Its soft terminals are core to the friendly feel. Tome sets it globally; Expenses (older CRA app) falls back to Arial/Helvetica but the brand direction is Comfortaa everywhere.
- The in-product scale is **unusually small and dense** (Tailwind base = 12px; titles 16px) because these are compact mobile PWAs. Inputs are pinned to 16px to stop iOS zoom. For web/marketing use a larger comfortable scale (see `colors_and_type.css`).
- Titles are **centered** in-app and **lowercase-tolerant**; ALL-CAPS wide-tracked labels mark groups.

### Spacing & layout
- **4px grid**; the workhorse gutter is **12px**. Screens are a vertical flex column: fixed header (56px) → scrolling content → fixed footer (82px) on a `100vh` shell.
- **Centered, narrow column.** On large screens Tome letterboxes the app to a center column (`xl:w-[80vw] 2xl:w-[60vw]`) flanked by `black/30` gutters — the app always feels phone-shaped.
- Fixed header & footer; content scrolls between them with hidden scrollbars (`no-scrollbar`).

### Shape, border, elevation
- **Pills & circles everywhere.** Buttons, icon-buttons, chips, the login orb, spending bubbles — all `border-radius: 50%` or `9999px`. Cards use an 8px radius.
- **Borders do the work of elevation:** 2px accent rings on buttons, 3px `#5ddef4` ring on spending bubbles, 1px cyan hairlines between rows.
- **No shadows.** (The only legacy `shadow` in code is on the old login orb / one card; the house direction — and the owner's stated preference — is flat. Don't add drop shadows.)

### Motion (a signature, not decoration)
- **Press:** every tappable element scales to **0.95** for 100ms on press (mouse + touch). This is the universal feedback.
- **Graphs reveal:** d3 bar charts **grow from the baseline** (`easeCubicOut`, 600ms); count labels rise with them.
- **Progress:** rings **sweep** via `stroke-dashoffset`; bars **fill** width left-to-right. Loading spinners animate a dash around a circle.
- **Popups:** enter with the "anvil" keyframe — a quick settle from scale .96 + 10px down to rest (`cubic-bezier(0.38,0.1,0.36,0.9)`, 300ms).
- **Skeletons** shimmer with a teal gradient sweep. **Celebrations** use fireworks.
- Transitions are short and snappy (5–300ms in the Tailwind config). Easing is `ease-out` / cubic — **no bounce**, no long durations.

### States
- **Hover** (where pointer exists): subtle `opacity: 0.7` on secondary controls, or the icon color flips to current.
- **Press:** scale 0.95 (see above). 
- **Disabled / loading:** drop to `cyan-600` color and `opacity: 0.5`; controls become non-interactive and may show the circular dash spinner.
- **Selected:** an accent underline (month nav) or a filled (vs outlined) icon-button.

### Transparency & blur
- Used lightly: translucent black overlays behind slide-out menus (`bg-black/50`), translucent cyan group backgrounds (`bg-cyan-700/60`), `black/30` letterbox gutters. **No backdrop-blur, no glassmorphism.**

---

## Iconography

See the dedicated **ICONOGRAPHY** section below.

---

## Index / manifest

Root files:
- **`README.md`** — this file: context, content & visual foundations, iconography.
- **`colors_and_type.css`** — all color, type, spacing, radius and motion tokens (CSS custom properties + semantic type classes). Import this first.
- **`SKILL.md`** — Agent-Skill front-matter so this system can be used directly in Claude Code.
- **`fonts/`** — `Poppins-Regular.ttf`, self-hosted UI / system fallback (user-supplied). The brand face **Comfortaa** loads from Google Fonts (as the Tome codebase does).
- **`assets/`** — real product assets:
  - `assets/logos/` — Tome crest + bookshelf mark + app icons; Toto Expenses money mark + app icon.
  - `assets/icons/tome/` and `assets/icons/expenses/` — the monochrome SVG icon sets.
  - `assets/icons.js` — every icon inlined as `currentColor` SVG markup; exposes `window.TOTO_ICONS` and `window.totoIcon(key, color, size)`. **Use this** to render recolorable icons (it works in every renderer, unlike external CSS masks).
- **`preview/`** — the Design System tab cards (color, type, spacing, component specimens) + shared `_card.css` and `icons.js`.
- **`ui_kits/`** — high-fidelity, interactive recreations (React + `components.jsx` + `app.jsx`):
  - `ui_kits/expenses/` — Toto Expenses (Payments home, list, new-payment keypad, insights).
  - `ui_kits/tome/` — Tome (language-learning home, vocabulary practice, summary, knowledge base).

---

## ICONOGRAPHY

Toto's icons are a **custom, hand-collected monochrome SVG set** — this is central to the brand and replaces any use of emoji.

- **Format:** flat single-color **SVGs**, no built-in icon font. Each glyph is authored as a black/`currentColor` path on a square viewBox.
- **Recoloring (Tome):** icons are rendered through a **CSS-mask technique** (`MaskedSvgIcon`) — the SVG becomes a mask over a solid color `<div>`, so any glyph can be tinted to any Tailwind color (default `cyan-800`, lime-200 inside buttons, red for car-mode). This means **all icons must be solid silhouettes** to mask cleanly.
- **Recoloring (Expenses):** SVGs are imported as React components and filled via CSS `fill` — almost always the yellow `#ffeb3b` accent inside icon-buttons.
- **Style:** friendly, slightly illustrative, medium weight. A mix of UI glyphs (home, menu, settings, plus, send, microphone, edit, close, tick, signal bars) and **characterful illustrations** for topics, games and categories (axe, castle, branch, monkey/chimp, binoculars, bank, category emblems like FOOD / SUPERMERCATO / AUTO / VIAGGI).
- **Mascot:** a **chimp / monkey** recurs as loader and game art.
- **Emoji:** never used. **Unicode symbols:** not used as icons. All iconography is the SVG set.
- **Sizing:** square, set in `w-4/5/6` (16/20/24px) inside round buttons; category/topic art is larger and more illustrative.

### Iconography in THIS system
- The product SVG sets are copied into `assets/icons/tome/` and `assets/icons/expenses/` — use them directly (mask them to recolor, per the Tome technique).
- A handful of the original SVGs failed import (encoding); for any missing UI glyph, substitute the closest **Lucide** icon (`lucide.dev`, 24px, ~2px stroke) — it is the nearest match to Toto's medium-weight line glyphs — and **flag the substitution**. The bulk of the set (home, menu, settings, plus, send, microphone, language, book, sources, sentences, signal bars, category emblems, monkey mascot, topic art) imported successfully and should be used as-is.
