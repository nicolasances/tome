# CEFR Level Track

![TO BE REVIEWED](https://img.shields.io/badge/TO%20BE%20REVIEWED-d73a4a)

## 1. Purpose & Scope

The CEFR Level Track is the **motivational anchor** of the Language Learning Home Dashboard. It renders the user's full path to fluency as a horizontal rail of the six CEFR levels (A1 → A2 → B1 → B2 → C1 → C2), highlighting the user's single active level, marking completed levels, and showing module progress within the active level.

Per idea §3.5, the user's current CEFR level must **always be visible and prominent** on the Home Dashboard, and the user's **module progress within the current level** must also always be visible. This feature satisfies both requirements in the single Level-track visual of wireframe Option C.

This feature owns the rendering and data binding of the level rail, the active-level sub-label (the level's name, e.g. "Foundation"), and the module-progress indicator (the dot row) for the active level.

**Out of scope**:
- Navigating into the module map or starting a module (Quick Actions feature 04 / Continue CTA feature 03).
- Taking or unlocking a Level Test (separate level-progression feature, not part of the dashboard).
- The "Continue module" CTA card (feature 03).
- Editing or selecting a level manually — level is system-determined, not user-chosen.

## 2. Key User Stories

| # | As a User I want to .. | so that .. |
|---|------------------------|------------|
| 1 | always see my current CEFR level prominently on the home screen | I always know where I stand (idea US-01) |
| 2 | see all six CEFR levels laid out as a connected path | I understand the full journey to fluency and where I am on it |
| 3 | see which levels I have already completed and which I have yet to reach | I feel a clear sense of progression |
| 4 | see how many modules I have completed within my current level | I know how close I am to unlocking the next CEFR level (idea §3.5) |

## 3. Interfaces

Follows wireframe **Home Dashboard — Option C "Level track"** (`docs/ui-design/wireframe.html`, `HomeC`), specifically the top block: a section micro-label ("Your path to fluency"), the six-node level rail with connector segments, and below it a row pairing the active level's name with a row of module-progress dots.

**Screen:** Language Learning Home Dashboard (Option C — Level track)

**Components:**

| Component Name | Description | Expected Behavior |
|----------------|-------------|-------------------|
| Level track section | Container holding the section label and the level rail | Renders the micro-label "Your path to fluency"; lays out the rail and the progress row beneath it |
| Level rail | Horizontal sequence of the six CEFR level nodes connected by segments | Renders A1–C2 in order; the active node is enlarged and emphasized (lime fill + ring); completed nodes are filled (bright lime); future nodes are outlined/muted; connectors before the active level are filled, others muted |
| Level node | A single circular CEFR-level badge | Shows the level code (e.g. "A1"); state = completed / active / future drives size, border, fill, and text color |
| Active level name | The descriptive name of the active level (e.g. "Foundation") | Displayed beneath the rail, paired with the module dots |
| Module progress dots | A row of dots representing the modules in the active level | One dot per module in the active level; completed modules filled, remaining modules outlined/empty; reflects the user's progress within the level |

**Additional Notes:**
- The active level node is visually larger than the others and carries the strongest emphasis — it is the single most prominent element of this section.
- The number of module dots equals the number of modules in the active level; this is data-driven, not hardcoded to 12 (the wireframe's A1 happens to have 12). At least one module always exists per default level.
- If the active level has no module data yet (catalogue gap, e.g. above B2 per idea §8), the dots row shows an appropriate empty/placeholder treatment rather than breaking.
- This section consumes its data from the dashboard summary slice provided by feature 01; it does not issue its own fetch in the default design.

## 4. Business Logic

- The user has exactly **one active CEFR level** at any time (idea §2). The rail derives node states from this single value:
  - levels **before** the active level → completed
  - the active level → active
  - levels **after** the active level → future (not yet reached)
- A new account starts at **A1** by default (idea §3.5); for such a user A1 is active and A2–C2 are future, with zero completed levels.
- The active level's **name** (e.g. A1 → "Foundation") is shown beneath the rail. The name is part of the level's definition.
- **Module progress within the active level** is expressed as completed-vs-total modules at that level. A module counts as completed only when its status is `completed` (idea §3.1.1; data-model `UserModuleProgress.status`). Modules `in_progress` are not counted as completed dots.
- The module-dots count equals the total number of modules defined at the active level; the filled count equals completed modules at that level.
- A level is considered completed only when all its modules are completed **and** its Level Test has been passed (idea §3.5). The rail uses this completed-level state for node styling; the dashboard itself does not perform the unlocking.
- The track is **read-only / non-interactive** in this feature — tapping nodes or dots does not navigate anywhere (navigation is handled by other dashboard features).

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | The level rail is **data-driven** from the active level and per-level completion, not a static decoration | Required for correctness as the user progresses; the wireframe's fixed A1 state is just demo data. |
| 2 | Module dots count is derived from the **number of modules in the active level**, not a fixed 12 | Different levels have different module counts; idea §8 notes some levels have few/no pre-built modules. |
| 3 | The track is non-interactive in this feature | Keeps responsibilities clean; navigation lives in the Continue CTA and Quick Actions features. |
| 4 | Node/dot styling maps to the three states (completed / active / future) using the design-system lime accents and muted outlines | Matches HomeC; uses the single-spark accent discipline of the Toto design system. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | All six CEFR levels render in order A1 → C2 as a connected rail | Path metaphor intact |
| 2 | The active level node is the most prominent (largest, emphasized) element of the section | idea §3.5 prominence requirement |
| 3 | Completed levels appear filled; future levels appear muted/outlined; connectors before the active level are filled | Correct state mapping |
| 4 | A fresh A1 user shows A1 active, A2–C2 future, and zero completed-module dots filled | First-run correctness |
| 5 | The module-dots row shows one dot per module in the active level, with completed modules filled | idea §3.5 module-progress visibility |
| 6 | The dots count adapts to the actual module count of the active level (verified with a non-12 level) | Data-driven, not hardcoded |
| 7 | The active level's descriptive name (e.g. "Foundation") is displayed beneath the rail | Matches HomeC |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Are the human-readable level names (A1 "Foundation", etc.) defined for all six levels, and where do they come from? | Needed for the active-level name; may live in the curriculum / default-modules definition. |
| 2 | How should the dots row behave when a level has many modules (e.g. 15–20) on a narrow phone — wrap, shrink, or summarize as "x / y"? | Responsiveness consideration for higher levels. |
| 3 | Should a partially-started module (`in_progress`) be visually distinguished from not-started in the dots, or only completed vs not? | Wireframe shows only the active module's dot accented; needs confirmation. |
| 4 | When the active level has no modules yet (catalogue gap above B2), what is the intended placeholder for the dots row? | idea §8 acknowledges sparse high-level catalogues. |
