/* Tome Language Learning — Module Test (Step 3) screens.
   The test is the gated, scored sibling of practice (A1·01 "Who Are You?"):
   locked → ready → in-test (NO per-answer feedback) → submit → result (pass/fail) → review.
   Distinct chrome: header reads "Module Test", a single clean question-progress bar
   (not practice's mastered/remaining/deferred segments), and answers stay hidden
   until the end. Mastery still updates, exactly as in practice (spec §3.1.1 Step 3).
   Requires tome-kit.jsx + exercise-screens.jsx. */

/* Small lock glyph (matches module-screens lock) */
function Lock({ size = 16, color = TC.fg3, stroke = 1.5 }) {
  return (
    <svg width={size * 0.85} height={size} viewBox="0 0 11 13" fill="none">
      <rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={color} strokeWidth={stroke} />
      <path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={color} strokeWidth={stroke} />
    </svg>
  );
}

/* ── In-test shell: clean question-progress chrome, NO feedback segments ── */
function TestShell({ q, total, instruction, children, footer }) {
  return (
    <TomeScreen title="Module Test" footer={footer}>
      <div style={{ padding: '6px 18px 0', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <Label>A1·01 · Who Are You?</Label>
          <span style={{ fontSize: 12, fontWeight: 700, color: TC.fg1 }}>{q}<span style={{ color: TC.fg2, fontWeight: 600 }}> / {total}</span></span>
        </div>
        <Bar pct={q / total} h={8} />
        <div style={{ marginTop: 11 }}><Label>{instruction}</Label></div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0 18px' }}>{children}</div>
    </TomeScreen>
  );
}

/* Full-width "Next" — submits the answer and advances, no reveal */
function NextFooter({ label = 'Next', enabled = true }) {
  return (
    <div style={{ padding: '10px 16px 16px', flex: '0 0 auto' }}>
      <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: enabled ? TC.lime : 'rgba(0,0,0,0.08)', color: enabled ? TC.c800 : TC.fg3, fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: 15, cursor: 'pointer', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {label}<TIcon name="tome/point-right" size={17} color={enabled ? TC.c800 : TC.fg3} />
      </button>
    </div>
  );
}

/* ── 0 · LOCKED — spaced-repetition countdown ──────────────────────── */
function TestLocked() {
  return (
    <TomeScreen title="Module Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 26px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 30 }}>
          <Ring size={172} stroke={13} pct={0.7} track="rgba(0,0,0,0.10)" fill={TC.c700}
            center={<div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(14,116,144,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={30} color={TC.c800} stroke={1.4} /></div>}
            sub={<div style={{ fontSize: 12, fontWeight: 600, color: TC.fg2, marginTop: 8 }}>unlocks in</div>} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: TC.fg1, marginTop: 14, letterSpacing: '0.01em' }}>3h 12m</div>
        <div style={{ fontSize: 14.5, color: TC.fg2, marginTop: 14, lineHeight: 1.55, maxWidth: 290 }}>
          You've practised every word in this module. The test opens <b>4 hours later</b> — so it measures what stuck, not what's fresh.
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18 }}>
          <button style={{ width: '100%', border: `2px solid rgba(0,0,0,0.12)`, borderRadius: 9999, background: 'transparent', color: TC.fg3, fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Lock size={15} color={TC.fg3} /> Start test
          </button>
          <div style={{ fontSize: 12, color: TC.fg3, fontWeight: 600, marginTop: 12 }}>We'll notify you the moment it's ready.</div>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ── 1 · READY — what's coming + Start ─────────────────────────────── */
function TestReady() {
  const rows = [
    ['tome/sentences', '35 questions', 'sampled from this module'],
    ['tome/signal-good', '80% to pass', 'unlocks the next module'],
    ['tome/magic', 'Answers at the end', 'no feedback while you go'],
    ['tome/language', 'Counts toward mastery', 'just like practice'],
  ];
  return (
    <TomeScreen title="Module Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 22px 0', overflow: 'hidden' }}>
        <Label>A1·01 · Who Are You?</Label>
        <div style={{ fontSize: 30, fontWeight: 700, color: TC.fg1, marginTop: 8, lineHeight: 1.08 }}>Ready for<br />the test?</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 11, lineHeight: 1.5 }}>One run through everything this module taught — vocabulary and grammar, mixed.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 24 }}>
          {rows.map(([ic, t, s], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 0', borderBottom: i < rows.length - 1 ? '1px solid rgba(9,166,209,0.32)' : 'none' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,116,144,0.18)', border: `1.5px solid rgba(9,166,209,0.45)` }}>
                <TIcon name={ic} size={20} color={TC.c800} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: TC.fg1 }}>{t}</div>
                <div style={{ fontSize: 12, color: TC.fg2, marginTop: 1 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingBottom: 18 }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer', letterSpacing: '0.02em' }}>Start test</button>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ── 2a · IN-TEST · Multiple choice (no reveal) ────────────────────── */
function TestMC() {
  const opts = [['A', 'er'], ['B', 'hedder'], ['C', 'kommer'], ['D', 'bor']];
  const chosen = 'C'; // the user's pick — shown as selected, correctness hidden
  return (
    <TestShell q={12} total={35} instruction="Choose the correct word" footer={<NextFooter />}>
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <div style={{ fontSize: 27, fontWeight: 700, color: TC.fg1 }}>
          Hun <span style={{ display: 'inline-block', minWidth: 64, borderBottom: `3px solid ${TC.lime}`, margin: '0 4px' }}>&nbsp;</span> læge.
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, marginTop: 12 }}>She is a doctor.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
        {opts.map(([k, w]) => {
          const sel = k === chosen;
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, background: sel ? TC.lime : 'transparent', border: sel ? `2px solid ${TC.lime}` : '1.5px solid rgba(9,166,209,0.5)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, background: sel ? TC.c800 : 'transparent', color: sel ? TC.lime : TC.fg2, border: sel ? 'none' : '1.5px solid rgba(0,0,0,0.25)' }}>{k}</div>
              <span style={{ fontSize: 17, fontWeight: 600, color: TC.fg1, flex: 1 }}>{w}</span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
    </TestShell>
  );
}

/* ── 2b · IN-TEST · Sentence reorder (no reveal) ───────────────────── */
function TestTile({ children, ghost }) {
  return (
    <div style={{ padding: '10px 15px', borderRadius: 11, fontSize: 16, fontWeight: 600,
      background: ghost ? 'transparent' : 'rgba(255,255,255,0.5)', color: ghost ? 'transparent' : TC.fg1,
      border: ghost ? '1.5px dashed rgba(0,0,0,0.2)' : 'none' }}>{children}</div>
  );
}
function TestReorder() {
  return (
    <TestShell q={18} total={35} instruction="Arrange the words" footer={<NextFooter />}>
      <PromptBlock kicker="Say in Danish" big="My name is Anna." />
      <div style={{ marginTop: 22, minHeight: 58, borderBottom: `2px solid ${TC.spark}`, display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center', paddingBottom: 12 }}>
        <TestTile>Jeg</TestTile><TestTile>hedder</TestTile><TestTile>Anna</TestTile>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
        <TestTile ghost>Jeg</TestTile><TestTile ghost>hedder</TestTile><TestTile ghost>Anna</TestTile>
      </div>
    </TestShell>
  );
}

/* ── 2c · IN-TEST · Translation (no reveal) ────────────────────────── */
function TestTranslation() {
  return (
    <TestShell q={31} total={35} instruction="Translate to Danish"
      footer={<div style={{ padding: '10px 16px 16px', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 11 }}>
        <FauxInput value="Hvor kommer du fra?" placeholder="Type Danish translation…" />
        <RoundButton name="tome/send" size={48} variant="primary" />
      </div>}>
      <PromptBlock kicker="In Danish, say" big="Where are you from?" />
      <div style={{ flex: 1 }} />
    </TestShell>
  );
}

/* ── 3 · SUBMIT — confirm before scoring ───────────────────────────── */
function TestSubmit() {
  const dots = Array.from({ length: 35 });
  return (
    <TomeScreen title="Module Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 24px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 12 }}>
          <Label color={TC.fg2}>All answered</Label>
          <div style={{ fontSize: 30, fontWeight: 700, color: TC.fg1, marginTop: 8 }}>35 / 35</div>
          <div style={{ fontSize: 14, color: TC.fg2, marginTop: 11, lineHeight: 1.5 }}>You can't change answers once you submit. Ready to see how you did?</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 7, marginTop: 26 }}>
          {dots.map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', background: 'rgba(14,116,144,0.5)', border: `1.5px solid ${TC.c600}` }} />
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ paddingBottom: 18 }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer', letterSpacing: '0.02em' }}>Submit test</button>
          <button style={{ width: '100%', border: 'none', background: 'transparent', color: TC.fg2, fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, padding: '13px 0 0', cursor: 'pointer' }}>Back to questions</button>
        </div>
      </div>
    </TomeScreen>
  );
}

/* Score ring + 80% threshold bar */
function ThresholdBar({ score, pass }) {
  return (
    <div style={{ width: '100%', position: 'relative', paddingTop: 4 }}>
      <Bar pct={score / 100} h={10} track="rgba(0,0,0,0.12)" fill={pass ? TC.limeBright : TC.c300} />
      <div style={{ position: 'absolute', top: 0, left: '80%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 2, height: 18, background: TC.c800, borderRadius: 2 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: TC.fg2, marginTop: 3, whiteSpace: 'nowrap' }}>pass 80%</span>
      </div>
    </div>
  );
}

/* ── 4a · RESULT · PASS ────────────────────────────────────────────── */
function TestResultPass() {
  return (
    <TomeScreen title="Module Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 24, position: 'relative' }}>
          {/* restrained celebration: lime spark ticks around the ring */}
          {[18, 70, 128, 250, 312].map((a, i) => (
            <span key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: 7, height: 7, borderRadius: '50%', background: i % 2 ? TC.limeBright : TC.spark, transform: `rotate(${a}deg) translateY(-118px)` }} />
          ))}
          <Ring size={184} stroke={15} pct={0.86} track="rgba(0,0,0,0.10)" fill={TC.limeBright}
            center={<div style={{ fontSize: 52, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>86<span style={{ fontSize: 24 }}>%</span></div>}
            sub={<div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: TC.fg2, marginTop: 6 }}><Verdict ok size={16} /> 30 / 35 correct</div>} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, marginTop: 20 }}>Module passed!</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 7, lineHeight: 1.5 }}><b>Who Are You?</b> is complete. Module 02 is now unlocked.</div>
        <div style={{ width: '100%', marginTop: 22 }}><ThresholdBar score={86} pass /></div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer' }}>Next module</button>
          <button style={{ width: '100%', border: `2px solid ${TC.c700}`, borderRadius: 9999, background: 'transparent', color: TC.fg1, fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, padding: 13, cursor: 'pointer' }}>Review answers</button>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ── 4b · RESULT · FAIL ────────────────────────────────────────────── */
function TestResultFail() {
  return (
    <TomeScreen title="Module Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 26 }}>
          <Ring size={184} stroke={15} pct={0.71} track="rgba(0,0,0,0.10)" fill={TC.c300}
            center={<div style={{ fontSize: 52, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>71<span style={{ fontSize: 24 }}>%</span></div>}
            sub={<div style={{ fontSize: 12, fontWeight: 700, color: TC.fg2, marginTop: 6 }}>25 / 35 correct</div>} />
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, marginTop: 20 }}>So close</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 7, lineHeight: 1.5 }}>You need <b>80%</b> to pass — that's just 3 more answers. Review what slipped, then try again.</div>
        <div style={{ width: '100%', marginTop: 22 }}><ThresholdBar score={71} pass={false} /></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, padding: '10px 16px', borderRadius: 9999, border: `1.5px solid rgba(9,166,209,0.5)`, color: TC.fg2 }}>
          <Lock size={14} color={TC.fg2} /><span style={{ fontSize: 13, fontWeight: 700 }}>Retry in 18:42</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18 }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer' }}>Review answers</button>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ── 5 · REVIEW — every question, your answer vs correct ───────────── */
function ReviewCorrect({ prompt, answer }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 13, border: `1px solid rgba(9,166,209,0.32)` }}>
      <Verdict ok size={26} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: TC.fg2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prompt}</div>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: TC.fg1, marginTop: 2 }}>{answer}</div>
      </div>
    </div>
  );
}
function ReviewWrong({ prompt, yours, correct, ai }) {
  return (
    <div style={{ padding: '13px 15px', borderRadius: 13, background: 'rgba(14,116,144,0.16)', border: `1px solid ${TC.red}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
        <Verdict ok={false} size={26} />
        <div style={{ fontSize: 13.5, color: TC.fg1, fontWeight: 600, flex: 1 }}>{prompt}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TC.fg3, width: 52, flex: '0 0 auto' }}>You</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: TC.red, textDecoration: 'line-through' }}>{yours}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TC.fg3, width: 52, flex: '0 0 auto' }}>Answer</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: TC.fg1 }}>{correct}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <SheetBtn icon="tome/magic" label="Explain my mistake" />
        {ai && <SheetBtn icon="tome/teacher" label="Check with AI" />}
      </div>
    </div>
  );
}
function TestReview() {
  return (
    <TomeScreen title="Review">
      <div style={{ padding: '6px 18px 0', flex: '0 0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Label>A1·01 · Who Are You?</Label>
            <div style={{ fontSize: 18, fontWeight: 700, color: TC.fg1, marginTop: 3 }}>30 / 35 correct</div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '7px 15px', borderRadius: 9999, background: TC.lime, color: TC.c800, fontSize: 15, fontWeight: 700 }}>86%</div>
        </div>
        <div style={{ marginTop: 11 }}><Bar pct={0.86} h={6} /></div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ReviewWrong prompt="Translate: Where are you from?" yours="Hvor er du fra?" correct="Hvor kommer du fra?" ai />
        <ReviewWrong prompt="Jeg ___ fra Norge." yours="kommor" correct="kommer" />
        <ReviewCorrect prompt="Hun ___ læge. — She is a doctor." answer="er" />
        <ReviewCorrect prompt="Arrange: My name is Anna." answer="Jeg hedder Anna" />
        <ReviewCorrect prompt="at hedde → jeg ___" answer="hedder" />
      </div>
    </TomeScreen>
  );
}

Object.assign(window, {
  TestLocked, TestReady, TestMC, TestReorder, TestTranslation,
  TestSubmit, TestResultPass, TestResultFail, TestReview,
});
