# Module Map — the level's modules

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
| Module map | Module row | One row per module: a numbered/locked node, the module title, and a trailing state element. **In-progress** row is highlighted with a mini step `Bar` + "Step n / 3" + a forward `RoundButton`. **Locked** rows show a "Locked" tag and a padlock node. **Completed** rows show a ✓ node. | Tapping an **actionable** (in-progress / available) row → Module overview. Locked rows are not tappable. |
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

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Route `/language-learning/level/[level]`. | Map is scoped to a CEFR level. |
| 2 | Spec variant **A (Vertical list)**; treat B/C as discarded alternatives. | User-selected primary design. |
| 3 | Module state is derived per-user from UserModuleProgress, never from the module document. | Per idea §3.1 (status is per-user). |
| 4 | Wrap backend calls in an `/api` class (per AGENTS.md). | Project convention. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | All modules of the level render in curriculum order with correct state styling. | — |
| 2 | Exactly one module shows as in-progress/actionable; the rest locked/completed accordingly. | Sequential unlock. |
| 3 | Tapping the active module opens its Module overview. | J2. |
| 4 | Locked modules are visibly non-interactive. | — |
| 5 | Level progress header matches completed-module count. | — |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Does "+ N more" expand inline, scroll, or page? | Wireframe truncates at 8 rows. |
| 2 | Can the user open a `completed` module to review it, or only the active one? | Affects which rows are tappable. |
| 3 | How does the user reach maps for *other* levels (if at all in v2.0)? | Level switching is otherwise skipped. |
