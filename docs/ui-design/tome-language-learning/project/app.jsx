/* Tome Language Learning — canvas assembly. Each screen sits in an iOS bezel
   on a design canvas, grouped by flow. Requires all screen files + starters. */

function Phone({ children }) {
  return <IOSDevice width={390} height={844}>{children}</IOSDevice>;
}

const BOARD = { background: 'transparent', boxShadow: '0 22px 48px rgba(0,0,0,0.22)', borderRadius: 48 };

// NOTE: returns the DCArtboard element directly (called as a function, not a
// component) so DCSection's `child.type === DCArtboard` filter matches it.
const board = (id, label, screen) => (
  <DCArtboard id={id} label={label} width={390} height={844} style={BOARD}>
    <Phone>{screen}</Phone>
  </DCArtboard>
);

function App() {
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
        subtitle="Inside a module: overview → grammar intro → practice → test. The test stays locked 4h after practice to force spaced repetition.">
        {board('overview', 'Module overview', <ModuleOverview />)}
        {board('grammar', 'Grammar intro · step 1', <GrammarIntro />)}
      </DCSection>

      <DCSection id="exercises" title="4 · Practice exercises"
        subtitle="All six exercise types, ordered recognition → production. Shared session bar (mastered · remaining · deferred) and footer. No answers scored during practice.">
        {board('ex1', '1 · Multiple choice', <ExMultipleChoice />)}
        {board('ex2', '2 · Sentence reorder', <ExReorder />)}
        {board('ex3', '3 · Fill in the blank', <ExFillBlank />)}
        {board('ex4', '4 · Conjugation drill', <ExConjugation />)}
        {board('ex5', '5 · Error correction', <ExErrorCorrection />)}
        {board('ex6', '6 · Translation', <ExTranslation />)}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
