# Dashboard Quick Actions Row

![TO BE REVIEWED](https://img.shields.io/badge/TO%20BE%20REVIEWED-d73a4a)

## 1. Purpose & Scope

The Quick Actions row is the **navigation launchpad** of the Language Learning Home Dashboard. It presents three labelled round buttons that route the user to the main areas of the language-learning section: **Modules**, **Analyze**, and **Sources**. It complements the Continue Module CTA (which handles the single "next" action) by giving access to the broader section surfaces.

This feature owns: rendering the three labelled round buttons in a row, and issuing navigation to each destination when tapped.

**Out of scope**:
- The destination screens themselves (the Modules map, the Analyze Content screen, the Sources screen) — this feature only navigates to them.
- The Continue Module CTA (feature 03).
- Any data fetching — the row is purely navigational and has no data dependency.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | quickly reach the full module list from the home screen | I can browse or jump to any specific module, not only the one the CTA suggests |
| 2 | reach the Analyze Content tool from the home screen | I can paste a Danish text and see what I would need to learn to understand it (idea US-09) |
| 3 | reach my Sources from the home screen | I can manage the content I am learning from without navigating deep into the section |

## 3. Interfaces

Follows wireframe **Home Dashboard — Option C "Level track"** (`docs/ui-design/wireframe.html`, `HomeC`), specifically the `HomeRow` of three labelled `RoundButton`s: **Modules** (book glyph), **Analyze** (magic glyph), **Sources** (sources glyph).

**Screen:** Language Learning Home Dashboard (Option C — Level track)

**Components:**

| Component Name | Description | Expected Behavior |
|----------------|-------------|-------------------|
| Quick actions row | Horizontal row evenly distributing the three action buttons | Renders the three buttons with their labels beneath; consistent spacing per HomeRow |
| "Modules" action | Labelled round button (book glyph) | Navigates to the Modules map / list for the section |
| "Analyze" action | Labelled round button (magic glyph) | Navigates to the Analyze Content screen |
| "Sources" action | Labelled round button (sources glyph) | Navigates to the Sources screen |

**Additional Notes:**
- All three are `RoundButton` from `toto-react` (per `AGENTS.md`) in the "primary" (lime ring) variant, each with an uppercase label beneath.
- The row uses the shared HomeRow layout (evenly spaced, top-aligned) from the wireframe kit.
- This feature has **no loading/error states** of its own — it renders immediately and unconditionally as part of the loaded dashboard.
- If a destination screen does not yet exist in the section, that button's navigation target is still defined here (and may land on a placeholder owned by that destination's own feature); see Open Questions.

## 4. Business Logic

- The row always renders the same three actions, in the order **Modules, Analyze, Sources** (matching HomeC).
- Each button issues a navigation to its respective section destination on tap; there is no enabled/disabled logic in v2.0 (all three are always available from the dashboard).
- The buttons are stateless and data-independent; they do not reflect any progress or counts.
- Navigation uses the app's standard client-side navigation; tapping must not reload the whole app.

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Exactly three actions — Modules, Analyze, Sources — matching HomeC, rather than the Modules/Analyze/Knowledge set shown in HomeA/HomeB | The user selected Option C; its action set is the source of truth. |
| 2 | The row is purely navigational with no data dependency or async state | Keeps it trivially reliable and decoupled from the dashboard summary load. |
| 3 | Buttons are `toto-react` `RoundButton` (primary variant) with labels | Mandated by `AGENTS.md`; matches HomeC. |
| 4 | Destination routes are referenced here but owned by their own features/screens | This feature is a launchpad, not the owner of the destinations. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | The row renders three labelled round buttons: Modules, Analyze, Sources, in that order | Matches HomeC |
| 2 | Tapping "Modules" navigates to the Modules map/list | Navigation intent |
| 3 | Tapping "Analyze" navigates to the Analyze Content screen | Navigation intent |
| 4 | Tapping "Sources" navigates to the Sources screen | Navigation intent |
| 5 | All three are `toto-react` `RoundButton`s in the primary variant with uppercase labels | Design-system adherence |
| 6 | The row renders unconditionally on the loaded dashboard with no spinner of its own | Stateless behaviour |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Do the destination screens (Modules map, Analyze Content, Sources) already exist in the v2.0 rewrite, or must each button point to a yet-to-be-built route? | If not built, navigation targets may temporarily land on placeholders owned by those features. |
| 2 | Is "Sources" the same concept as the legacy `/language-learning/sources`, or a new v2.0 concept tied to Analyze Content corpora? | The legacy section has a Sources area; the v2.0 idea ties sources to Analyze Content (idea §3.6). Need to confirm the destination. |
| 3 | Should any action be hidden/disabled at certain levels or states (e.g. Analyze gated until the user has some baseline)? | Currently assumed always available; confirm. |
