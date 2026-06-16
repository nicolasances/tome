# Change: Practice complete promoted to its own route   (2026-06-14)

## What changed
- **05-practice-session** — The flat `/practice` entry route is removed. The exercise loop moves to `/practice/[practiceId]` and the Practice complete recap becomes a standalone page at `/practice/[practiceId]/results`. Callers (module overview CTA, grammar completion) now start a session and navigate directly to `/practice/[sid]`; the intermediate redirect-only shell is gone.

## Why
The Practice complete recap was rendered inline as in-memory state of the exercise page. Promoting it to its own route makes both screens independently deep-linkable and refreshable, simplifies the exercise page (it no longer owns any recap state), and gives the results page a clean load path — it reads session data from the URL and the API, not from ephemeral parent state.

## Impact (add / modify / remove)

**05-practice-session**

- **Remove — flat `…/practice` entry route** (`practice/page.tsx`): deleted. All logic redistributed to the two new pages below.
- **Add — exercise route** `…/practice/[practiceId]/page.tsx`: the session exercise loop. Loads via `GET /practiceSessions/:id`. Guards: unknown session → module overview; already-completed session → `/results`. On round completion calls `POST .../complete` then `router.push(…/results?prevCovered=<count>)`.
- **Add — results route** `…/practice/[practiceId]/results/page.tsx`: reads session + module + progress, computes recap stats via `reconstructSessionState`, renders `PracticeComplete`. `?prevCovered` query param carries the before-round coverage count for the ring sweep.
- **Modify — module overview CTA**: now async; loads `userId` at page load; calls `startPracticeAndGetSessionId` and pushes to `/practice/[sid]`.
- **Modify — grammar `handleNext`**: uses the returned `sessionId` to push `/practice/[sid]` (previously discarded the id and pushed the flat `/practice` path).
- **Remove — `roundNumber` prop** from `PracticeComplete`: the label now shows just "Module XX" with no round counter.
- **Add — `firstTryMasteredCount` to `reconstructSessionState`**: counts correct answers in the primary pass only, used by the results page for accuracy stats.

**00-user-journeys**

- **Modify — screen inventory routes**: Practice session → `…/practice/[practiceId]`; Practice complete → `…/practice/[practiceId]/results`.

## Behavior to verify
- Module overview "Start practice" CTA shows "Starting…" while the session is being created, then lands on `…/practice/[sid]`.
- Grammar last-concept Next button lands on `…/practice/[sid]`.
- Completing a round navigates to `…/practice/[sid]/results` with the ring sweeping from the before-count to the after-count.
- Deep-linking to `…/practice/[sid]/results` renders the recap with the final coverage value (no sweep since `?prevCovered` is absent).
- Deep-linking to a completed `…/practice/[sid]` redirects to `…/results`.
- Deep-linking to an unknown `…/practice/[unknown]` redirects to the module overview.
- "Practice another round" / "Keep practising" starts a new session and pushes to `…/practice/[newSid]`.
- "Back to module" navigates to the module overview.

## Affected feature files
- `docs/features/05-practice-session.md`
- `docs/features/00-user-journeys.md`
