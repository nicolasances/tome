# Language Learning Home Dashboard — Shell & Navigation Entry

## 1. Purpose & Scope

This feature establishes the **Home Dashboard of the Language Learning section** (the home of the language-learning area, not the home of the whole Tome app). It is the landing screen the user reaches when entering "Language Learning", and it acts as the motivational anchor and launchpad described in the idea document: CEFR level is always visible, the current module is one tap away, and the main areas of the section are reachable from here.

This feature delivers the **screen scaffold only**: the route, the screen shell (header, full-bleed cyan layout, vertical section stack), the navigation entry into it, the top-level data load orchestration (a single dashboard summary fetch), and the loading / empty / error states for the screen as a whole. The individual content zones (Level Track, Continue Module CTA, Quick Actions, Weekly Stats) are delivered as their own features (02–05) and slot into the stack defined here.

This is the **v2.0 rewrite** of the language-learning section. It is module/CEFR/exercise-centric and supersedes the previous vocabulary/sentence/source-centric home. It must not assume the legacy vocabulary/sentence home behaviour.

**Out of scope**:
- The internal rendering and data of the Level Track, Continue Module CTA, Quick Actions row, and Weekly Stats (features 02–05).
- The destination screens reached from the dashboard (Modules map, Analyze Content, Sources) — only navigation intent is in scope.
- The module execution flow (grammar intro, practice, test) and level tests.
- Onboarding / placement test (the user always starts at A1 per idea §3.5).
- Settings, account, and any non-language-learning navigation.

## 2. Key User Stories

- As a learner, I want to open the Language Learning section and land on a single home screen, so that I immediately see where I stand and what to do next.
- As a learner, I want the home screen to show me a clear, branded layout (the Tome cyan screen with a centered title), so that the section feels consistent with the rest of the app.
- As a learner, I want the screen to load my progress quickly and tell me if something went wrong, so that I am never staring at a blank or broken page.
- As a learner returning to the app, I want a reliable way to get back to this home screen from elsewhere in the section, so that it remains my hub.

## 3. Interfaces

The dashboard follows wireframe **Home Dashboard — Option C "Level track"** (`docs/ui-design/wireframe.html`, screen `home-c`, component `HomeC`). The screen is rendered inside the standard Tome screen shell on a full-bleed cyan background, with a centered title "Language Learning", and a vertical stack of content sections with consistent horizontal padding.

The vertical stack, top to bottom, is:
1. **CEFR Level Track** (feature 02)
2. **Continue Module CTA** (feature 03)
3. **Quick Actions row** — Modules / Analyze / Sources (feature 04)
4. a flexible spacer
5. **Weekly Activity Stats** anchored near the bottom (feature 05)

**Screen:** Language Learning Home Dashboard (Option C — Level track)

**Components:**

| Component Name | Description | Expected Behavior |
|----------------|-------------|-------------------|
| `LanguageLearningHome` (screen) | The dashboard route/page that composes the section stack | Mounts on entering the section; triggers the dashboard summary load; sets the section header; renders the section stack in the defined order; manages screen-level loading/error/empty states |
| Screen shell | Full-bleed cyan layout with header (back affordance + centered title + menu affordance) per the Tome design system | Title reads "Language Learning"; clears the device status bar; no drop shadows; uses brand font |
| Dashboard load orchestrator | Client-side coordinator that requests the consolidated dashboard summary once on mount | Exposes loading/loaded/error to the screen; provides the loaded data to child zones; supports a retry |
| Screen loading state | Placeholder shown while the summary is loading | Non-blocking, on-brand skeleton/placeholder occupying the section stack |
| Screen error state | Shown when the summary fetch fails | Communicates the failure and offers a retry action that re-runs the load |

**Additional Notes:**
- The dashboard fetches a single consolidated **dashboard summary** that provides the data the child zones need (current CEFR level + sub-label, level completion across modules, the active/next module, and weekly activity). Child features consume slices of this summary rather than each issuing their own fetch, to keep the screen to a single round-trip and a single coordinated state. If the consolidated endpoint is not available, the fallback is for each zone to load its own data (see Open Questions).
- The screen must degrade gracefully: if an individual zone's data slice is missing but the summary otherwise succeeded, the screen still renders and the affected zone shows its own empty/placeholder state (defined in its feature).
- Buttons used anywhere on this screen must use `RoundButton` from `toto-react` (per `AGENTS.md`); do not invent button styles.
- The screen header is set via the app's header mechanism (the existing `useHeader().setConfig` pattern) on mount.

## 4. Business Logic

- On mount, the screen requests the dashboard summary exactly once; subsequent re-renders must not re-fetch unless a retry is explicitly invoked.
- The screen has three top-level states: **loading**, **loaded**, **error**. There is no separate "empty" screen state — a brand-new A1 user with zero progress is a valid **loaded** state (the zones render their own first-time visuals).
- While **loading**, the section stack shows placeholders; the header is already set so the user has context.
- On **error** (summary fetch fails or returns an error), the screen shows the error state with a retry; retry returns the screen to **loading** and re-issues the request.
- The data is loaded for the **currently authenticated user**; the screen relies on the existing auth/session mechanism and does not render meaningful content for an unauthenticated user.
- The dashboard always reflects the user's **single active CEFR level** (idea §2, §3.5) — there is never more than one active level shown.
- Navigation into the dashboard sets it as the section hub; navigation away to a section sub-screen (e.g. Modules) and back must re-establish the screen cleanly (re-running the load is acceptable).

## 5. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | The dashboard is the **new v2.0 home** of the language-learning section and is treated as a rewrite, not an extension of the legacy `app/language-learning/page.tsx` | idea.md describes a full rewrite of the language-learning part; the new model is module/CEFR-centric, incompatible with the legacy vocabulary/sentence home. Keeping it as a clean rewrite avoids carrying legacy assumptions. |
| 2 | A **single consolidated dashboard-summary load** orchestrated at the screen level, with zones consuming slices | Minimizes round-trips, gives one coherent loading/error state, and avoids four independent spinners on one screen. |
| 3 | Place the screen under the language-learning route tree as the section landing screen, and point the existing "Language Learning" navigation entry at it | Keeps the section's hub at a single, predictable location and reuses the existing navigation entry. |
| 4 | All buttons via `toto-react` `RoundButton`; layout via the existing Tome screen shell conventions | Mandated by `AGENTS.md`; ensures visual consistency with the design system. |
| 5 | A brand-new user (A1, no completed modules) is a valid loaded state, not an empty/error state | The idea positions the dashboard as motivational from day one; the first module is "available" immediately. |

## 6. Success Criteria

| # | Criterion | Notes |
|---|-----------|-------|
| 1 | Entering "Language Learning" lands the user on the dashboard screen with the centered title "Language Learning" | Matches HomeC wireframe shell |
| 2 | The screen issues the dashboard summary load once on mount and shows a loading placeholder until it resolves | Single round-trip |
| 3 | On a successful load, the four content zones render in the defined vertical order | Composition correct even before zone internals exist |
| 4 | On a failed load, the user sees an error state with a working retry that re-runs the load | Resilience |
| 5 | A brand-new A1 user with no progress sees a fully rendered (non-error) dashboard | First-run is a valid state |
| 6 | The screen is reachable repeatedly from the section navigation entry and re-establishes cleanly each time | Hub behaviour |
| 7 | The screen visually adheres to the Tome design system (full-bleed cyan, no shadows, brand font, `RoundButton` for buttons) | Design-system adherence |

## 7. Open Questions

| # | Question | Notes |
|---|----------|-------|
| 1 | Does the backend expose a single consolidated dashboard-summary endpoint, or must the dashboard compose several existing calls (level/progress, active module, weekly stats)? | Affects decision #2; if no single endpoint, the orchestrator fans out to per-zone calls but still presents one coordinated screen state. |
| 2 | Should the dashboard replace the existing `/language-learning` route outright, or live at a new sub-route while the legacy screen is retired separately? | Either way the navigation entry must end up pointing at this dashboard. |
| 3 | What is the desired behaviour if the user has progressed beyond the pre-built module catalogue (e.g. levels above B2 with no default modules)? | idea §8 notes limited pre-built modules above B2; the loaded state must still be coherent. |
| 4 | Is offline / stale-cache handling expected, or is a network error always a hard error state? | idea §1.4 lists offline mode as out of scope, suggesting hard error is acceptable for v2.0. |
