# Module Map — the level's modules

![Status](https://img.shields.io/badge/status-implemented-brightgreen?style=flat-square)

## 1. Purpose & Scope

Delivers the **Module map** for the user's current CEFR level: an ordered list of
all modules in the level with their lock/progress state, so the user can see the
whole path and open the active module. Owns this one screen end-to-end.

Design: variant **A — Vertical list** (`module-screens.jsx` → `MapA`).

Participates in journey **J2** (browse the level & start a module).

**Out of scope**:
- The Module overview reached by tapping a module (owned by `03-module-overview`).
- Cross-level navigation / unlocking the next level via a Level Test — **skipped** (no wireframe).

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | See every module of my current level in order | I understand the full path through the level |
| 2 | See which module is in progress, which is next, and which are locked | I know where I am and what's ahead |
| 3 | See my progress inside the active module at a glance | I know how far I've got |
| 4 | Open the active module from the list | I can continue learning |

## 3. Interfaces

**Screen(s):** Module map for the current level (variant A — Vertical list), per
`module-screens.jsx`. `TomeScreen` titled e.g. "A1 · Foundation".

**Components:**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Module map | Level progress header | A progress `Bar` + "x / N" count of completed modules in the level. | Reflects completed-module count for the level. |
| Module map | Status legend | Inline legend: ● In progress · ○ Up next · Locked. | Static key for the row states. |
| Module map | Module row | One row per module: a numbered/locked node, the module title, and a trailing state element. **In-progress** row is highlighted with a mini step `Bar` + "Step n / 3" + a forward `RoundButton`. **Locked** rows show a "Locked" tag and a padlock node. **Completed** rows show a ✓ node, plus — when the module has a scoreable proficiency score — a four-level signal-strength icon in the row's own trailing slot / the card's bottom row beside "Completed" (`ProficiencySignal`, §4). | Tapping an **actionable** (in-progress / available) row → Module overview. Locked rows are not tappable. |
| Module map | Overflow indicator | "+ N more modules" footer when the list is truncated. | Communicates that more locked modules exist; may expand/scroll to reveal. |

**Additional Notes:**
- **Loading**: skeleton rows while module progress loads.
- **Ordering**: modules appear in curriculum order (A1·01 … A1·12 per `default-modules.md`).
- Only the current level's modules are shown; reaching this screen for a level above the user's current level is out of scope.

## 4. Business Logic

- Modules are listed in fixed curriculum order for the level.
- Each module's display state comes from **UserModuleProgress**: `locked`, `available` (up next), `in_progress`, or `completed` (§3.1).
- **Sequential unlock**: a module is unlocked only once the previous module is `completed`; exactly one module is the user's current focus.
- In-progress row's "Step n / 3" reflects the module execution step (Grammar → Practice → Test).
- Tapping is enabled only for unlocked modules; locked rows give no navigation.
- Read-only: this screen does not mutate progress or mastery.
- **Proficiency signal (completed modules only, #333):** each module's `proficiency.score` (User Proficiency Score, 0-100) maps to a 4-level signal-strength icon via `utils/proficiencyLevel.ts`'s `getProficiencyLevel`: `score >= 80` → level 4 (`signal.svg`), `65 <= score < 80` → level 3 (`signal-good.svg`), `50 <= score < 65` → level 2 (`signal-fair.svg`), `score < 50` → level 1 (`signal-weak.svg`). Rendered via the shared `ProficiencySignal` component (`app/components/ProficiencySignal.tsx`), monochrome (no colour-coding), on a ghost background of the full signal icon at ~20% opacity (same idiom as `TopicsList`/`DifficultySignal`). When `proficiency` is `null` — any non-completed module, or a completed module without a scoreable test attempt — **no icon is rendered**; a missing score is never treated as level 1. `basis: "test-only"` scores are rendered identically to any other basis, with no distinguishing treatment.

## 5. Technical Decisions & Integrations

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/level/[level]`. | Map is scoped to a CEFR level. |
| 2 | Spec variant **A (Vertical list)**; treat B/C as discarded alternatives. | User-selected primary design. |
| 3 | Module state is derived per-user from UserModuleProgress, never from the module document. | Per idea §3.1 (status is per-user). |
| 4 | Reuse `TomeLearningDashboardAPI` (owned by `01-home-dashboard`) rather than a map-specific API class; pass the routed `[level]` as the `cefrLevel` query param. | The same `GET /me/progress` shape (per-level module list + status) serves both the dashboard's current-level view and this screen's arbitrary-level view — no need for a second class or endpoint. |

### API Integrations

| Component or Screen | API Integration | Description |
| ------------------- | --------------- | ----------- |
| Module row, Level progress header | `GET /me/progress?cefrLevel={level}` (`tome-ms-language`, via `TomeLearningDashboardAPI.getMeProgress(level)`) | Returns the per-module status list (`locked` / `available` / `in_progress` / `completed`, current step, completion %) for the requested CEFR level, plus the level's completed/total counts. Drives every module row's state and the progress header. Each entry also carries `proficiency: ModuleProficiencyEntry \| null` (type owned by `01-home-dashboard`, #333) — the User Proficiency Score breakdown for completed modules, consumed only here to drive the signal icon. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | All modules of the level render in curriculum order with correct state styling. | — |
| 2 | Exactly one module shows as in-progress/actionable; the rest locked/completed accordingly. | Sequential unlock. |
| 3 | Tapping the active module opens its Module overview. | J2. |
| 4 | Locked modules are visibly non-interactive. | — |
| 5 | Level progress header matches completed-module count. | — |
| 6 | On desktop (`lg:` breakpoint), modules render as a 4-column grid of module cards instead of the mobile vertical list; page header shows level kicker, title, and completed/total count. | Responsive. |
| 7 | A completed module with a scoreable `proficiency.score` shows the correct one of the four signal-strength icons on both breakpoints; a completed module with `proficiency: null` shows no icon (never level 1). | #333. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 3 | How does the user reach maps for *other* levels (if at all in v2.0)? | Level switching is otherwise skipped. |

**Resolved:**
- **Overflow (Q1):** All modules are always rendered; the list scrolls naturally — no truncation.
- **Completed tappability (Q2):** Only `in_progress` and `available` rows are tappable. Completed rows are non-interactive (same as locked).
