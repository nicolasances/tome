# Weekly Activity Stats

![TO BE REVIEWED](https://img.shields.io/badge/TO%20BE%20REVIEWED-d73a4a)

## 1. Purpose & Scope

The Weekly Activity Stats is the **engagement / habit** zone of the Language Learning Home Dashboard, anchored near the bottom of the screen. It shows the user's learning activity over the last seven days as a small bar chart, reinforcing consistency and giving a sense of momentum.

In wireframe Option C this is the "This week" label above a row of seven daily bars (Mon–Sun), each bar's height reflecting that day's activity count, with the count labelled inside non-empty bars.

This feature owns: rendering the seven-day activity chart, binding it to the user's recent activity data, and handling its loading / empty states within the dashboard.

**Out of scope**:
- Longer time ranges, streaks, or detailed activity drill-downs.
- Defining what counts as "activity" at the data-source level (this feature consumes a per-day count; the counting rule is a backend concern, surfaced here as Open Questions).
- Any navigation — the chart is informational and non-interactive in v2.0.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | see how active I have been over the past week directly on the home screen | I am encouraged to maintain a consistent learning habit |
| 2 | see each day's bar reflect how much I did on that day | I can spot my activity pattern at a glance |
| 3 | see the chart render cleanly even when I have no activity yet | the home screen never looks broken during my first days |

## 3. Interfaces

Follows wireframe **Home Dashboard — Option C "Level track"** (`docs/ui-design/wireframe.html`, `HomeC` + the shared `WeeklyStats` kit component): a "This week" micro-label above seven vertical bars labelled M T W T F S S, each bar scaled to its count with the count shown inside non-zero bars.

**Screen:** Language Learning Home Dashboard (Option C — Level track)

**Components:**

| Component Name | Description | Expected Behavior |
|----------------|-------------|-------------------|
| Weekly stats section | Container with the "This week" micro-label and the chart | Anchored near the bottom of the dashboard stack; label above chart |
| Weekly bar chart | Seven vertical bars, one per day of the trailing week | Each bar height is proportional to that day's activity count relative to the week's max; days with activity show the count inside the bar; each bar has a weekday letter beneath |
| Empty/zero state | Treatment when all seven days have zero activity | Bars render at a minimal baseline height with no counts; the section still shows cleanly |
| Loading state | Placeholder while data resolves | Brief placeholder consistent with the screen-level loading; resolves into the chart |

**Additional Notes:**
- The chart shows a **trailing 7 days** (the most recent week). The existing section already has a rolling-stats notion (`getRollingStats(days)` on `TomeLanguageAPI` and a `LanguageLearningWeeklyStats` d3 component) that can inform implementation; the v2.0 dashboard should reconcile with whatever weekly endpoint the rewritten section exposes.
- Heights are scaled to the week's maximum count so the chart auto-scales; a day with zero shows a minimal baseline marker, not nothing.
- The chart is **non-interactive** — bars are not tappable in v2.0.
- This section may consume the weekly-activity slice of the dashboard summary (feature 01); if no consolidated summary exists, it falls back to its own weekly-activity fetch (see feature 01 Open Question #1).

## 4. Business Logic

- The chart represents the **last 7 days** ending today, one bar per day, ordered oldest → newest (left → right).
- Each bar's value is that day's **activity count** (a non-negative integer). Bar height = `(dayCount / maxCount) × chartHeight`, with a minimum baseline so zero/low days remain visible (matching the kit's `WeeklyStats` behaviour).
- The day with the highest count defines the scale; if all counts are zero, all bars render at the minimal baseline and no count labels are shown.
- A count of zero shows no in-bar number; a positive count shows the number inside the bar.
- Weekday letters are derived from the dates of the trailing window, not hardcoded, so the leftmost bar correctly reflects the oldest day in the window.
- The section reflects the **authenticated user's** activity only.

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Show a fixed **trailing 7-day** window, one bar per day | Matches HomeC "This week"; simplest meaningful habit signal for v2.0. |
| 2 | Auto-scale bar heights to the week's max with a minimum baseline for low/zero days | Matches the wireframe kit; keeps the chart readable regardless of magnitude. |
| 3 | The chart is non-interactive in v2.0 | No defined drill-down destination yet; keeps scope tight. |
| 4 | Reconcile with the rewritten section's weekly-activity data source rather than assuming the legacy `getRollingStats` endpoint | This is a v2.0 rewrite; the activity-counting semantics may change with the new module/exercise model. |
| 5 | Zero-activity is a valid rendered state, never an error or blank | First-run and quiet weeks must still look intentional. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | The section renders a "This week" label above seven daily bars with weekday letters | Matches HomeC |
| 2 | Bar heights scale proportionally to the week's maximum daily count | Auto-scaling |
| 3 | Days with activity show the count inside the bar; zero days show no number | Label rule |
| 4 | A user with zero activity across all seven days sees a clean flat/baseline chart, not an error or blank | Empty state |
| 5 | The seven bars correspond to the trailing 7 days ending today, oldest on the left | Correct window |
| 6 | The chart resolves from a loading placeholder into data without breaking the dashboard layout | Loading behaviour |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | In the v2.0 module/exercise model, what counts as one unit of daily "activity" — an exercise answered, a practice session completed, a module step, or something else? | Determines the count semantics; the legacy rolling-stats endpoint may not map cleanly. |
| 2 | Does the rewritten section expose a weekly-activity endpoint, or is this derived from the consolidated dashboard summary? | Ties to feature 01's consolidated-vs-fan-out decision. |
| 3 | Should the week be Monday-start (as the wireframe's M…S suggests) or locale-dependent / rolling-from-today? | Affects bar ordering and labels. |
| 4 | Is there a future intent to make bars tappable (e.g. open that day's sessions)? | Out of scope for v2.0 but worth noting for layout decisions. |
