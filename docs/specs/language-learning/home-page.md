# Language Learning Home Page

In the Tome app, the Language Learning home page is accessed from the side menu. It is served at the route `/language-learning`.

<img src="./drawings/language-learning-home.jpg" alt="Home Page Layout Drawing" width="400" height="auto">

The Home Page presents the following sections:
1. **Header** — the standard app header, with the title "Language Learning" and a back button.
2. **Practice Buttons** — a single action button to either start a new practice or resume an ongoing one. See below.
3. **Knowledge Base Button** — a `RoundButton` that navigates to the Knowledge Base page (`/language-learning/knowledge-base`). This replaces the former direct vocabulary shortcut. See below.
4. **Manage Sources Button** — a `RoundButton` that navigates to the Source Management page. See below.
5. **Learning Stats** — displayed at the bottom of the home page; shows weekly learning stats as a bar graph. See below.

---

## Practice Buttons

This section contains a **single action button**. Its label and behaviour depend on whether there is an ongoing (unfinished) language-learning session for the current user:

| State | Button label | Action |
|-------|-------------|--------|
| No ongoing practice | **Start Practice** | Navigates to `/language-learning/select` (practice type selection screen) |
| Ongoing practice | **Resume Practice** | Navigates directly to the in-progress practice screen |

### Detecting an ongoing practice

On page load, the app calls `GET /tomelang/sessions/active` (via `IVocabularyPracticeAPI.getActiveSession()`) to check whether the current user has an active session.

| Response | Meaning | Button shown |
|----------|---------|--------------|
| `200 OK` (session object) | User has an active session | **Resume Practice** |
| `404 Not Found` | No active session | **Start Practice** |

While the check is in progress, a loading indicator is shown in place of the button.

---

## Knowledge Base Button

A `RoundButton` labelled **"Knowledge Base"** is shown alongside the Practice button. Pressing it navigates to `/language-learning/knowledge-base`.

This button replaces the former direct vocabulary shortcut. Vocabulary (and the new Sentences section) are now accessed exclusively through the Knowledge Base hub.

This button is always visible and enabled — it does not depend on the active session state.

For the full Knowledge Base feature specification, see [Knowledge Base](./knowledge-base.md).

---

## Manage Sources Button

A `RoundButton` labelled **"Manage Sources"** is shown alongside the Practice button. Pressing it navigates to `/language-learning/sources`.

This button is always visible and enabled — it does not depend on the active session state.

For the full Source Management feature specification, see [Source Management](./source-management.md).

---

## Learning Stats

The Learning Stats section is a **bar graph** (implemented with **d3.js**) showing how many practices were completed per day over the displayed period.

### Data

- Bar height represents the **number of completed language-learning practice sessions** for that day. All practice types (Vocabulary, Inversions, …) count equally.
- Days with no completed practices render a **zero-height bar**; the day label is still shown.

### API

The data comes from `tome-ms-language`. Two endpoint variants are available — the frontend may use either one depending on the desired display mode (see below):

#### Variant A — ISO Week (Monday–Sunday)

```
GET /tomelang/sessions/stats/weekly?from=YYYYMMDD
```

- `from`: the **Monday** of the week to display, in `YYYYMMDD` format.
- Always returns **exactly 7 entries**, one per day Mon–Sun.

**Frontend week calculation:**

```ts
const today = new Date();
const day = today.getDay(); // 0 = Sunday
const monday = new Date(today);
monday.setDate(today.getDate() - ((day + 6) % 7));
const from = `${monday.getFullYear()}${String(monday.getMonth()+1).padStart(2,'0')}${String(monday.getDate()).padStart(2,'0')}`;
```

#### Variant B — Rolling Window (last N days, inclusive today)

```
GET /tomelang/sessions/stats/rolling?days=7
```

- `days` (optional, default `7`): number of calendar days to include, ending today (UTC).
- Always returns **exactly `days` entries**, ordered oldest → newest, with the last entry always being today.

---

Both variants share the same response shape:

```json
{
  "days": [
    { "date": "20260428", "count": 2 },
    { "date": "20260429", "count": 0 },
    { "date": "20260430", "count": 1 },
    { "date": "20260501", "count": 0 },
    { "date": "20260502", "count": 3 },
    { "date": "20260503", "count": 0 },
    { "date": "20260504", "count": 0 }
  ]
}
```

- `date`: `YYYYMMDD` string.
- `count`: integer ≥ 0; `0` for days with no completed sessions.

### Frontend API client

Add to `api/TomeLanguageAPI.ts`:

```ts
async getWeeklyStats(from: string): Promise<{ days: Array<{ date: string; count: number }> }> {
  return (await new TotoAPI().fetch('tome-ms-language', `/tomelang/sessions/stats/weekly?from=${from}`)).json();
}

async getRollingStats(days = 7): Promise<{ days: Array<{ date: string; count: number }> }> {
  return (await new TotoAPI().fetch('tome-ms-language', `/tomelang/sessions/stats/rolling?days=${days}`)).json();
}
```

### Component

A dedicated `LanguageLearningWeeklyStats` component (e.g. `components/LanguageLearningWeeklyStats.tsx`) should:
- Accept the weekly data as props (`days: Array<{ date: string; count: number }>`) so it is testable in isolation.
- Wrap all d3 logic inside a `useEffect` with an SVG ref.
- Show a loading state while the API call is in flight.
- Show a graceful empty/error state if the API call fails — **no crash**.

### Visual style

- **Bars**: filled with the app's primary dark-teal colour (`var(--primary)`, `#155e75`).
- **X-axis labels**: 3-letter day abbreviations (Mon, Tue, Wed, Thu, Fri, Sat, Sun), displayed below each bar.
- **Y-axis**: dynamic scale based on the maximum daily count; no axis line or tick labels — the graph is intentionally minimal.
- **Animation**: bars animate vertically from zero height to their final height when the component mounts, using a d3 transition:

  ```ts
  bars.transition().duration(600).ease(d3.easeCubicOut)
    .attr('y', d => yScale(d.count))
    .attr('height', d => height - yScale(d.count));
  ```

- **No border, no grid lines**.

