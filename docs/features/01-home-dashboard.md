# Home Dashboard — the motivational hub

## 1. Purpose & Scope

Delivers the **Home dashboard**, the landing screen of Tome Language Learning. It
is the motivational anchor of the app: it makes the user's **current CEFR level**
and **module progress within that level** always visible, lets the user **resume
their current module in one tap**, and routes to the other top-level
destinations. Owns this one screen end-to-end (UI, presentation logic, data load).

Design: variant **C — Level track** (`home-screens.jsx` → `HomeC`).

Participates in journeys **J1** (check standing & continue) and **J2** (entry to
browse the level).

**Out of scope**:
- The Module map screen (owned by `02-module-map`).
- The Module overview / step screens reached by "Continue" (owned by `03`/`04`/`05`).
- The "Analyze" and "Knowledge/Sources" destinations — **skipped** (no wireframe; see `00-user-journeys.md`).

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | See my current CEFR level prominently on the home screen | I always know where I stand (US-01) |
| 2 | See my position on the A1→C2 path and how many modules remain at my level | I understand my progression |
| 3 | Resume my current module in one tap | I can get straight back to learning |
| 4 | Reach Modules, Analyze and the knowledge area from the home screen | I can navigate the app |
| 5 | See my activity for the current week | I feel a sense of momentum |

## 3. Interfaces

**Screen(s):** Home dashboard (variant C — Level track), per `home-screens.jsx`.

**Components:**

| Screen | Component Name | Description | Expected Behavior |
|--------|----------------|-------------|-------------------|
| Home dashboard | Level track | Horizontal A1→A2→B1→B2→C1→C2 row of nodes with connectors; current level enlarged + lime-filled, completed levels filled, future levels outlined. Below: level name ("Foundation") + a row of module dots for the current level. | Highlights the user's current level; module dots fill as modules complete. Static (not a navigation control in v2.0). |
| Home dashboard | Continue CTA | Dark rounded card with a lime circular arrow, kicker "Continue · A1·01", and the current module title. | Tapping navigates to the current module (Module overview, or its current step). Hidden/replaced with an empty state when no module is in progress. |
| Home dashboard | Primary nav row | Two `RoundButton`s (primary variant) with labels: **Modules**, **Analyze**. The third button (Sources/Knowledge) is **not rendered** in v2.0. | Modules → Module map (`02`). Analyze → Analyze Content (**skipped**). |
| Home dashboard | Weekly stats | "This week" label + a 7-day bar chart (M–S) of modules completed per day. | Renders one bar per weekday; height = modules completed that day; today emphasised. |
| Home dashboard | Screen chrome | `TomeScreen` titled "Language Learning". | Standard app header; layout shell, not a separate feature. |

**Additional Notes:**
- **Loading**: show a skeleton/placeholder for level track, continue CTA and weekly stats while data loads.
- **Empty / first-run**: a brand-new A1 user with no module started shows level A1 at 0/12; the Continue CTA points at the first **available** module ("Who Are You?").
- The nav row renders only **Modules** and **Analyze** in v2.0; the third button (Sources/Knowledge) is hidden.

## 4. Business Logic

- The user has exactly **one active CEFR level** at a time; it defaults to **A1** at account creation (§3.5).
- The level track marks levels < current as completed, the current level as active, and levels > current as future.
- Module-dots / "x / N modules" reflect **UserModuleProgress** for the current level: count of `completed` modules out of the level's total.
- The **current module** for the Continue CTA = the user's `in_progress` module; if none is in progress, the first `available` (not-yet-completed, unlocked) module at the current level.
- Weekly stats show **modules completed per day** for the current calendar week (Mon–Sun); each bar height = count of modules with status `completed` on that day.
- The dashboard is **read-only** with respect to progress — it never mutates mastery or module state.

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Implement as the index route of `/language-learning`. | It is the app's home/landing screen. |
| 2 | Spec variant **C (Level track)** as the design; treat A/B as discarded alternatives. | User-selected primary design. |
| 3 | Wrap all backend calls in an API class under `/api` (per AGENTS.md), path without microservice basepath. | Project convention. |
| 4 | Use `RoundButton` from `toto-react` for the nav row (no custom button). | Project style guide. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | Current CEFR level is visible and visually prominent on load. | US-01. |
| 2 | Module progress within the level (x / N) is visible. | §3.5 "Module Progress". |
| 3 | Continue CTA opens the correct current module. | J1. |
| 4 | Modules button navigates to the Module map. | J2. |
| 5 | Weekly stats render real activity counts with a sensible empty state. | — |
| 6 | Layout matches variant C on a phone-width viewport. | Mobile-first. |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | ~~Are the nav destinations **Modules / Analyze / Sources** (wireframe C) or **Modules / Analyze / Knowledge** (idea)?~~ | **Resolved**: the third button is not rendered in v2.0. |
| 2 | ~~What exactly does "weekly activity count" measure — exercises answered, sessions, or modules touched?~~ | **Resolved**: modules completed per day. |
| 3 | ~~Is the level track purely decorative, or tappable to inspect past/future levels?~~ | **Resolved**: purely decorative — no tap interaction. |
