# Language Learning Home Page

In the Tome app, the Language Learning home page is accessed from the side menu. It is served at the route `/language-learning`.

<img src="./drawings/language-learning-home.jpg" alt="Home Page Layout Drawing" width="400" height="auto">

The Home Page presents the following sections:
1. **Header** — the standard app header, with the title "Language Learning" and a back button.
2. **Practice Buttons** — a single action button to either start a new practice or resume an ongoing one. See below.
3. **Learning Stats** — displayed at the bottom of the home page; shows weekly learning stats as a bar graph. See below.

---

## Practice Buttons

This section contains a **single action button**. Its label and behaviour depend on whether there is an ongoing (unfinished) language-learning session for the current user:

| State | Button label | Action |
|-------|-------------|--------|
| No ongoing practice | **Start Practice** | Navigates to `/language-learning/select` (practice type selection screen) |
| Ongoing practice | **Resume Practice** | Navigates directly to the in-progress practice screen |

### Detecting an ongoing practice

On page load, the app must call the backend to check whether the current user has an active (unfinished) language-learning session.

> **⚠️ Spec gap — API endpoint needed.** The endpoint and response format for checking ongoing language-learning sessions must be defined and added here before this can be implemented.

---

## Learning Stats

The Learning Stats section is a **bar graph** (implemented with **d3.js**) showing how many practices were completed for each day of the current week (Monday to Sunday inclusive).

### Data

- One bar per day, covering **Monday through Sunday** of the current week.
- Bar height represents the **number of completed language-learning practices** for that day (both Vocabulary Practice and Inversions count).
- Days with no completed practices render a **zero-height bar**; the day label is still shown.

> **⚠️ Spec gap — API endpoint needed.** The app must call an API endpoint to fetch the count of completed practices per day for the current week. The endpoint and response format must be defined and added here before this can be implemented.

### Visual style

- **Bars**: filled with the app's primary dark-teal colour (`var(--primary)`, `#155e75`).
- **X-axis labels**: 3-letter day abbreviations (Mon, Tue, Wed, Thu, Fri, Sat, Sun), displayed below each bar.
- **Y-axis**: dynamic scale based on the maximum daily count; no axis line or tick labels — the graph is intentionally minimal.
- **Animation**: bars animate vertically from zero height to their final height when the component mounts.
- **No border, no grid lines**.

