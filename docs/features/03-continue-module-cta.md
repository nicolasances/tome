# Continue Module CTA

## 1. Purpose & Scope

The Continue Module CTA is the **primary call-to-action** of the Language Learning Home Dashboard. It surfaces the single most relevant module for the user to work on next — the one they have in progress, or the next available one if none is in progress — and lets them jump straight into it with one tap. It is the "what do I do next" answer the dashboard gives the user.

In wireframe Option C this is the prominent deep-teal banner card showing the module's level/number tag, its title, and a launch button.

This feature owns: determining which module is the "continue" target, rendering the CTA card with that module's identity, and navigating the user into that module when tapped.

**Out of scope**:
- The module execution flow itself (grammar intro, contextual exercises, module test) — this feature only navigates to it.
- The full module map / module list (feature 04 routes there via "Modules").
- Per-step progress within a module beyond what is needed to label the CTA (e.g. detailed step breakdown lives in the module flow).
- Generating a new module (Analyze Content feature).
- The level track and module dots (feature 02).

## 2. Key User Stories

- As a learner, I want one obvious button on my home screen that continues my current module, so that I can resume learning without searching (idea US-03).
- As a learner who just started, I want the CTA to point me at my first available module, so that I have an obvious place to begin.
- As a learner, I want to see which module the CTA will open (its level tag and title) before I tap, so that I know what I'm getting into.

## 3. Interfaces

Follows wireframe **Home Dashboard — Option C "Level track"** (`docs/ui-design/wireframe.html`, `HomeC`), specifically the deep-teal "big continue CTA" banner: a circular launch glyph, a small uppercase tag ("Continue · A1·01"), and the module title ("Who Are You?").

**Screen:** Language Learning Home Dashboard (Option C — Level track)

**Components:**

| Component Name | Description | Expected Behavior |
|----------------|-------------|-------------------|
| Continue CTA card | The prominent banner that resumes/starts the target module | Renders the module tag + title; the whole card (or its launch button) is tappable and navigates into the target module |
| Module tag | Small uppercase label combining the action verb and the module identifier (e.g. "Continue · A1·01" or "Start · A1·01") | Shows "Continue" when the module is in progress, "Start" when it is merely available and not yet begun; includes the module's level + ordinal |
| Module title | The module's human title (e.g. "Who Are You?") | Displays the target module's title prominently |
| Launch affordance | A round launch button within the card | Tapping it navigates into the target module's execution flow; uses `RoundButton` from `toto-react` |
| Empty / no-module state | Fallback when no continue target can be determined | Shows an appropriate message (e.g. all modules at the level completed, awaiting Level Test) instead of a broken card |

**Additional Notes:**
- The verb in the tag is dynamic: **"Continue"** for an `in_progress` module, **"Start"** for an `available` (not yet started) module.
- The CTA targets exactly one module. The whole card may be tappable for a large hit target; at minimum the round launch button must navigate.
- If the user has completed all modules at the current level but not yet passed the Level Test, there is no "continue module" target — the card shows a state guiding the user toward the Level Test (or simply a completed/awaiting-test message). It must not point at a locked or non-existent module.
- This feature consumes the active-module slice of the dashboard summary (feature 01); it does not issue its own fetch in the default design.

## 4. Business Logic

- **Continue-target selection** (single module), in priority order:
  1. The module with status `in_progress` at the user's active level (if more than one, the most recently started — `UserModuleProgress.startedAt`). Verb = "Continue".
  2. Otherwise, the **next** `available` module at the active level (the lowest-ordinal module not yet completed and not locked). Verb = "Start".
  3. Otherwise (all modules at the level completed), **no continue target** → show the empty/awaiting-Level-Test state.
- The module tag combines the verb, the level code, and the module ordinal (e.g. "Continue · A1·01"), using the module's level and its position/number in the level.
- Tapping the launch affordance navigates into the **target module's execution flow** entry point (idea §3.1.1 Step 1 onward). This feature is responsible only for issuing that navigation, not for what the flow does.
- A locked module is never a continue target (idea §3.1: status `locked`).
- The CTA reflects the same active level shown by the Level Track (feature 02); the two must be consistent (the continue target's level equals the active level).

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | The CTA targets **exactly one** module chosen by a deterministic priority (in-progress → next available → none) | Gives the user a single unambiguous next action; matches the "one big CTA" intent of HomeC. |
| 2 | The action verb ("Continue" vs "Start") is derived from module status rather than fixed text | Accurately reflects whether the user is resuming or beginning; avoids saying "Continue" for an untouched module. |
| 3 | Navigation goes to the module execution flow entry, treated as an external destination owned by another feature | Keeps this feature focused on selection + launch; the flow is a separate slice. |
| 4 | A "no target" state is a first-class outcome, not an error | Completing all modules before passing the Level Test is a normal, expected situation. |
| 5 | Launch control uses `toto-react` `RoundButton` | Mandated by `AGENTS.md`. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | When the user has an in-progress module, the CTA shows it with the verb "Continue" and its tag + title | Resume path |
| 2 | When the user has no in-progress module but an available one, the CTA shows it with the verb "Start" | Begin path |
| 3 | Tapping the launch affordance navigates into the target module's execution flow | Core action |
| 4 | A locked module is never shown as the continue target | Respects module gating |
| 5 | When all modules at the level are completed, the CTA shows the no-target / awaiting-Level-Test state rather than a broken or locked card | Edge case handled |
| 6 | The CTA's module level matches the active level shown in the Level Track | Cross-feature consistency |
| 7 | The launch control is a `toto-react` `RoundButton` and the card matches the HomeC deep-teal styling | Design-system adherence |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | When multiple modules are `in_progress`, is "most recently started" the right tie-breaker, or should it be "most recently active"? | Data model has `startedAt`; "last active" may need additional data. |
| 2 | Where exactly does the launch navigate — the module's first step (grammar intro) every time, or the user's last incomplete step? | idea §3.1.1 defines ordered steps; resuming mid-flow may be desirable. |
| 3 | For the "all completed, awaiting Level Test" state, should the CTA itself become a "Take Level Test" action, or just inform and let the user navigate via Modules? | Affects whether this card ever launches the Level Test. |
| 4 | Should the card display lightweight progress (e.g. "Step 1 / 3") like the shared ContinueCard variant, or stay minimal like the HomeC banner? | HomeC banner omits step progress; other wireframe variants include it. |
