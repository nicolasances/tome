/* Tome Language Learning — DESKTOP: Module flow (two-pane).
   Left rail = module meta + the 3 steps (Grammar · Practice · Module Test).
   Right pane = the selected step's content. Default lands on the active step (Practice). */

const FLOW_STEPS = [
  { id: 'grammar', icon: 'tome/teacher', t: 'Grammar', sub: '3 concepts · learned', st: 'done' },
  { id: 'practice', icon: 'tome/language', t: 'Practice', sub: '20 a round · no pressure', st: 'active' },
  { id: 'test', icon: 'tome/tick', t: 'Module Test', sub: '30–40 questions · 80% to pass', st: 'locked' },
];

function StepRailItem({ step, idx, active, onClick }) {
  const done = step.st === 'done', isActive = step.st === 'active', locked = step.st === 'locked';
  const selected = active === step.id;
  return (
    <button className="tpress" onClick={onClick} disabled={locked} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', fontFamily: 'inherit',
      padding: '14px 16px', borderRadius: 14, cursor: locked ? 'default' : 'pointer', opacity: locked ? 0.7 : 1,
      border: selected ? `1.5px solid ${TC.lime}` : `1.5px solid ${TC.border}`,
      background: selected ? 'rgba(217,249,157,0.16)' : 'transparent',
    }}>
      <div style={{ width: 42, height: 42, borderRadius: '50%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: done ? TC.limeBright : isActive ? TC.lime : 'transparent',
        border: (done || isActive) ? 'none' : `2px solid ${locked ? 'rgba(0,0,0,0.18)' : TC.c600}`,
        color: (done || isActive) ? TC.c800 : TC.fg3 }}>
        {done ? <span style={{ fontSize: 17, fontWeight: 700 }}>✓</span> : locked ? <LockGlyph size={15} /> : <span style={{ fontSize: 15, fontWeight: 700 }}>{idx + 1}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: TC.fg1 }}>{step.t}</div>
        <div style={{ fontSize: 12, color: TC.fg2, marginTop: 2 }}>{step.sub}</div>
      </div>
      {locked && <LockGlyph size={15} />}
    </button>
  );
}

/* ── right-pane: Grammar lesson ──────────────────────────────────────────── */
function GrammarPane() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: TC.lime, color: TC.c800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <TIcon name="tome/teacher" size={22} />
        </div>
        <div>
          <Label>Concept 1 of 3 · learned</Label>
          <div style={{ fontSize: 22, fontWeight: 700, color: TC.fg1, marginTop: 3 }}>Present tense — at være</div>
        </div>
      </div>
      <p style={{ fontSize: 16, color: TC.fg1, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
        Danish verbs don't change with the subject. <b>At være</b> (to be) is simply <b>er</b> — for I, you, he, she, everyone.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
        {[['Jeg er fra Danmark.', 'I am from Denmark.'], ['Hun er læge.', 'She is a doctor.'], ['Vi er studerende.', 'We are students.']].map(([da, en], i) => (
          <div key={i} style={{ borderLeft: `4px solid ${TC.lime}`, paddingLeft: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: TC.fg1 }}>{da}</div>
            <div style={{ fontSize: 13.5, color: TC.fg2, marginTop: 2 }}>{en}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── right-pane: Practice (interactive multiple choice) ──────────────────── */
/* Mirrors the tuned ExMultipleChoice: lime-200 highlight on the chosen correct
   answer, red on a wrong pick. (state semantics from exercise-screens.jsx) */
function PracticePane() {
  const OPTIONS = [['A', 'er'], ['B', 'hedder'], ['C', 'kommer'], ['D', 'bor']];
  const CORRECT = 'A';
  const [picked, setPicked] = React.useState(null);
  const solved = picked === CORRECT;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
        <div style={{ flex: 1 }}><SessionBar total={20} mastered={6} deferred={2} /></div>
        <span style={{ fontSize: 13, fontWeight: 700, color: TC.fg1, whiteSpace: 'nowrap' }}>9 / 20</span>
      </div>
      <Label style={{ marginBottom: 16 }}>Choose the correct word</Label>
      <div style={{ fontSize: 28, fontWeight: 700, color: TC.fg1, lineHeight: 1.3 }}>
        Hun <span style={{ display: 'inline-block', minWidth: 70, borderBottom: `3px solid ${solved ? TC.limeBright : TC.lime}`, margin: '0 6px', textAlign: 'center' }}>{solved ? 'er' : '\u00a0'}</span> læge.
      </div>
      <div style={{ fontSize: 14, color: TC.fg2, marginTop: 12 }}>She is a doctor.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 26, maxWidth: 640 }}>
        {OPTIONS.map(([k, w]) => {
          const chosen = picked === k;
          const isCorrect = chosen && k === CORRECT;
          const isWrong = chosen && k !== CORRECT;
          let border = 'rgba(93,222,244,0.45)', bg = 'rgba(0,68,80,0.18)', fill = false, badge = null;
          if (isCorrect) { bg = 'rgba(190,242,100,0.30)'; border = TC.limeBright; fill = true; badge = <span style={{ color: TC.c800, fontWeight: 800, fontSize: 16 }}>✓</span>; }
          else if (isWrong) { bg = 'rgba(185,28,28,0.14)'; border = TC.red; badge = <span style={{ color: TC.red, fontWeight: 800, fontSize: 16 }}>✕</span>; }
          return (
            <button key={k} className="tpress" onClick={() => setPicked(k)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderRadius: 14, textAlign: 'left',
              fontFamily: 'inherit', cursor: 'pointer', border: `${isCorrect || isWrong ? 2 : 1.5}px solid ${border}`, background: bg, color: TC.fg1,
            }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: fill ? TC.c800 : 'transparent', color: fill ? TC.lime : TC.fg2, border: fill ? 'none' : '1.5px solid rgba(0,0,0,0.25)' }}>{k}</span>
              <span style={{ fontSize: 17, fontWeight: 600, flex: 1 }}>{w}</span>
              {badge}
            </button>
          );
        })}
      </div>

      <div style={{ minHeight: 64, marginTop: 22, maxWidth: 640 }}>
        {solved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: TC.c800, fontWeight: 700, fontSize: 15 }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: TC.limeBright, color: TC.c800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✓</span>
            Correct — “er” is the present of <i>at være</i>, the same for every subject.
          </div>
        )}
        {picked && !solved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', background: TC.red, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>✕</span>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: TC.red }}>Not quite — try again.</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── right-pane: Test (locked) ───────────────────────────────────────────── */
function TestPane() {
  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', border: `2px solid ${TC.c600}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TC.fg3, marginBottom: 20 }}>
        <LockGlyph size={26} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: TC.fg1 }}>Module Test is locked</div>
      <p style={{ fontSize: 15, color: TC.fg2, lineHeight: 1.6, marginTop: 10 }}>
        Finish practice so every word has been seen at least once. The test unlocks <b>4 hours</b> after full coverage — a short spaced-repetition gap so it tests memory, not recall.
      </p>
      <div style={{ ...panel({ padding: '18px 20px', marginTop: 20 }), display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1 }}>
          <Label style={{ marginBottom: 8 }}>Coverage this round</Label>
          <Bar pct={18 / 30} h={8} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: TC.fg1, whiteSpace: 'nowrap' }}>18 / 30 words</span>
      </div>
    </div>
  );
}

const FLOW_CTA = {
  grammar: 'Review next concept',
  practice: 'Continue practice',
  test: 'Keep practicing',
};

function ModuleFlow({ onBack }) {
  const [step, setStep] = React.useState('practice');
  const pane = step === 'grammar' ? <GrammarPane /> : step === 'test' ? <TestPane /> : <PracticePane />;
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 48px 56px' }}>
      <button className="tpress link-btn" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: TC.fg2, marginBottom: 18, padding: 0 }}>
        <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><TIcon name="tome/point-right" size={15} /></span>
        All modules
      </button>

      <div className="flow-grid" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 28, alignItems: 'start' }}>
        {/* LEFT RAIL */}
        <div>
          <Label>A1·01 · Identity & introductions</Label>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: TC.fg1, margin: '8px 0 0', lineHeight: 1.08 }}>Who Are You?</h1>
          <p style={{ fontSize: 14, color: TC.fg2, lineHeight: 1.55, marginTop: 10 }}>Introduce yourself — say your name, where you're from, your age and what you do.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
            {FLOW_STEPS.map((s, i) => <StepRailItem key={s.id} step={s} idx={i} active={step} onClick={() => s.st !== 'locked' && setStep(s.id)} />)}
          </div>
        </div>

        {/* RIGHT PANE */}
        <div style={{ ...panel({ padding: '34px 38px', minHeight: 460 }), display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>{pane}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
            <button className="tpress" disabled={step === 'test'} style={{
              border: 'none', borderRadius: 9999, background: step === 'test' ? 'rgba(0,68,80,0.4)' : TC.c800, color: step === 'test' ? TC.c200 : TC.lime,
              fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: '14px 30px', cursor: step === 'test' ? 'default' : 'pointer', letterSpacing: '0.02em',
            }}>{FLOW_CTA[step]}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ModuleFlow });
