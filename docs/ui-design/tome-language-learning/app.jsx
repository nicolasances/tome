/* Tome Language Learning — canvas assembly + Tweaks.
   Tweaks reshape the whole system by mutating the shared TC token object and
   re-rendering: accent spark, atmosphere (the cyan flood), and type personality.
   DesignCanvas keeps its own pan/zoom across re-renders. Requires all screen files + starters. */

function Phone({ children }) {
  return <IOSDevice width={390} height={844}>{children}</IOSDevice>;
}

const BOARD = { background: 'transparent', boxShadow: '0 22px 48px rgba(0,0,0,0.22)', borderRadius: 48 };

const board = (id, label, screen) => (
  <DCArtboard id={id} label={label} width={390} height={844} style={BOARD}>
    <Phone>{screen}</Phone>
  </DCArtboard>
);

function Canvas() {
  return (
    <DesignCanvas>
      <DCSection id="intro" title="Tome — Language Learning"
        subtitle="A1 Danish, fresh beginner · Toto design system (cyan flood · Comfortaa · lime accent · round buttons · no shadows) · iPhone frames">
      </DCSection>

      <DCSection id="home" title="1 · Home dashboard"
        subtitle="CEFR level is the motivational anchor — three ways to surface level + module progress. Continue-module CTA, Knowledge / Analyze, weekly stats.">
        {board('home-a', 'A · Hero badge', <HomeA />)}
        {board('home-b', 'B · Progress ring', <HomeB />)}
        {board('home-c', 'C · Level track', <HomeC />)}
      </DCSection>

      <DCSection id="map" title="2 · Module map"
        subtitle="The 12 A1 modules — module 1 in progress, the rest locked until you finish the one before. Three metaphors for the same progression.">
        {board('map-a', 'A · List', <MapA />)}
        {board('map-b', 'B · Journey path', <MapB />)}
        {board('map-c', 'C · Grid', <MapC />)}
      </DCSection>

      <DCSection id="flow" title="3 · Module flow"
        subtitle="Inside a module: overview → grammar intro → practice → test. Practice repeats in rounds until every vocabulary word has been seen; the overview's coverage bar tracks that, and the test unlocks 4h after full coverage.">
        {board('overview', 'Module overview · practice in progress', <ModuleOverview />)}
        {board('grammar', 'Grammar intro · step 1', <GrammarIntro />)}
      </DCSection>

      <DCSection id="exercises" title="4 · Practice exercises"
        subtitle="All six exercise types, ordered recognition → production. Shared session bar (mastered · remaining · deferred) and footer. Every answer nudges mastery — in practice and the test alike.">
        {board('ex1', '1 · Multiple choice', <ExMultipleChoice />)}
        {board('ex2', '2 · Sentence reorder', <ExReorder />)}
        {board('ex3', '3 · Fill in the blank', <ExFillBlank />)}
        {board('ex4', '4 · Conjugation drill', <ExConjugation />)}
        {board('ex5', '5 · Error correction', <ExErrorCorrection />)}
        {board('ex6', '6 · Translation', <ExTranslation />)}
      </DCSection>

      <DCSection id="feedback" title="5 · Answer feedback"
        subtitle="Correct vs incorrect per type. Every incorrect answer drops the deep feedback tray: a wrong attempt reveals the answer with “Explain my mistake” (translation also offers “Check with AI”). Correct shows only the verdict — no sentence. Long answers truncate and expand on tap or drag.">
        {board('fb1-ok', '1 · MC — correct', <ExMultipleChoice state="correct" />)}
        {board('fb1-no', '1 · MC — incorrect', <ExMultipleChoice state="retry" />)}
        {board('fb2-ok', '2 · Reorder — correct', <ExReorder state="correct" />)}
        {board('fb2-no', '2 · Reorder — incorrect', <ExReorder state="retry" />)}
        {board('fb3-ok', '3 · Fill blank — correct', <ExFillBlank state="correct" />)}
        {board('fb3-no', '3 · Fill blank — incorrect', <ExFillBlank state="wrong" />)}
        {board('fb4-ok', '4 · Conjugation — correct', <ExConjugation state="correct" />)}
        {board('fb4-no', '4 · Conjugation — incorrect', <ExConjugation state="wrong" />)}
        {board('fb5-ok', '5 · Error fix — correct', <ExErrorCorrection state="correct" />)}
        {board('fb5-no', '5 · Error fix — incorrect', <ExErrorCorrection state="wrong" />)}
        {board('fb6-ok', '6 · Translation — correct', <ExTranslation state="correct" />)}
        {board('fb6-no', '6 · Translation — incorrect', <ExTranslation state="wrong" />)}
        {board('fb6-long', '6 · Translation — long answer (tap / drag to expand)', <ExTranslation state="wrong" long={true} />)}
      </DCSection>

      <DCSection id="test" title="6 · Module test"
        subtitle="Step 3 — the gated, scored sibling of practice. Locked 4h after full coverage, then 35 questions reusing the same six types with NO per-answer feedback; answers are revealed only at the end. 80% to pass; mastery still updates exactly as in practice.">
        {board('test-lock', 'Locked · spaced-repetition countdown', <TestLocked />)}
        {board('test-ready', 'Ready · what\u2019s coming', <TestReady />)}
        {board('test-mc', 'In-test · multiple choice (no reveal)', <TestMC />)}
        {board('test-reorder', 'In-test · sentence reorder (no reveal)', <TestReorder />)}
        {board('test-trans', 'In-test · translation (no reveal)', <TestTranslation />)}
        {board('test-submit', 'Submit · confirm before scoring', <TestSubmit />)}
        {board('test-pass', 'Result · passed (\u226580%)', <TestResultPass />)}
        {board('test-fail', 'Result · not passed (retry in 20m)', <TestResultFail />)}
        {board('test-review', 'Answer review · your answer vs correct', <TestReview />)}
      </DCSection>
    </DesignCanvas>
  );
}

/* ── Tweak option sets ───────────────────────────────────────────── */
// Accent pairs are light pastels so the dark-teal text on lime buttons stays legible.
const ACCENTS = {
  Lime:   ['#d9f99d', '#bef264'],
  Sky:    ['#bae6fd', '#7dd3fc'],
  Coral:  ['#fed7aa', '#fdba74'],
  Rose:   ['#fecdd3', '#fda4af'],
  Violet: ['#ddd6fe', '#c4b5fd'],
};
const ACCENT_OPTS = Object.values(ACCENTS);

// Atmosphere = the signature flood. Kept in the cyan family so dark text + teal cards hold.
const FLOODS = {
  Lagoon: '#00acc1',  // signature
  Spring: '#1fc8de',  // brighter / airy
  Ocean:  '#0891b2',  // deeper / focused
  Deep:   '#0e7490',  // serious
};
const FLOOD_OPTS = Object.values(FLOODS);

const FONTS = {
  Rounded: "'Comfortaa', system-ui, sans-serif",
  Modern:  "'Poppins', system-ui, sans-serif",
  System:  "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

function applyTheme(t) {
  const acc = t.accent || ACCENTS.Lime;
  TC.lime = acc[0];
  TC.limeBright = acc[1];
  TC.lime300 = acc[1];
  TC.cyan = t.flood || FLOODS.Lagoon;
  TC.font = FONTS[t.fontPersona] || FONTS.Rounded;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#d9f99d", "#bef264"],
  "flood": "#00acc1",
  "fontPersona": "Rounded"
}/*EDITMODE-END*/;

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  applyTheme(t); // mutate shared tokens before children render this pass

  return (
    <React.Fragment>
      <Canvas />
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent spark" />
        <TweakColor label="Accent" value={t.accent} options={ACCENT_OPTS}
          onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Atmosphere" />
        <TweakColor label="Flood" value={t.flood} options={FLOOD_OPTS}
          onChange={(v) => setTweak('flood', v)} />

        <TweakSection label="Type personality" />
        <TweakRadio label="Typeface" value={t.fontPersona}
          options={['Rounded', 'Modern', 'System']}
          onChange={(v) => setTweak('fontPersona', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
