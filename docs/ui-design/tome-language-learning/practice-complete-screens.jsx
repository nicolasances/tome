/* Tome Language Learning — "practice session complete" screen.
   Replaces the blocking "Saving progress…" overlay shown when the LAST exercise
   of a module practice round is answered. The save becomes a quiet, in-context
   acknowledgement ("Progress saved") and the foreground turns into a rewarding
   session recap. Four directions, same Toto language (cyan flood, lime spark,
   rings sweep, bars fill, no shadows). Requires tome-kit.jsx + exercise-screens.jsx. */

/* ── shared bits ───────────────────────────────────────────────────── */

/* Animated mastery / coverage ring — sweeps from `from` to `to` on mount */
function AnimRing({ size = 184, stroke = 15, from = 0, to = 0.7, track = TC.c600, fill = TC.limeBright, dur = 720, delay = 90, center, sub }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const [p, setP] = React.useState(from);
  React.useEffect(() => { const t = setTimeout(() => setP(to), delay); return () => clearTimeout(t); }, [to, delay]);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round"
          style={{ transition: `stroke-dashoffset ${dur}ms cubic-bezier(0.22,1,0.36,1)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {center}{sub}
      </div>
    </div>
  );
}

/* Animated fill bar — width grows on mount; optional old→new "delta" ghost */
function AnimBar({ from = 0, to = 0.7, h = 12, track = 'rgba(0,0,0,0.14)', fill = TC.limeBright, ghost, dur = 650, delay = 160 }) {
  const [p, setP] = React.useState(from);
  React.useEffect(() => { const t = setTimeout(() => setP(to), delay); return () => clearTimeout(t); }, [to, delay]);
  return (
    <div style={{ position: 'relative', width: '100%', height: h, borderRadius: 9999, background: track, overflow: 'hidden' }}>
      {ghost != null && <div style={{ position: 'absolute', inset: 0, width: ghost * 100 + '%', background: 'rgba(255,255,255,0.30)' }} />}
      <div style={{ position: 'relative', width: p * 100 + '%', height: '100%', borderRadius: 9999, background: fill, transition: `width ${dur}ms cubic-bezier(0.22,1,0.36,1)` }} />
    </div>
  );
}

/* Restrained celebration — lime spark ticks popping around a center point */
function SparkBurst({ radius = 120, dots = [12, 64, 122, 196, 248, 312], color2 = TC.spark }) {
  return dots.map((a, i) => (
    <span key={i} style={{
      position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
      transform: `rotate(${a}deg) translateY(-${radius}px)`,
    }}>
      <span style={{
        position: 'absolute', left: -3.5, top: -3.5, width: 7, height: 7, borderRadius: '50%',
        background: i % 2 ? color2 : TC.limeBright,
        animation: `pc-pop 380ms cubic-bezier(0.38,0.1,0.36,0.9) ${200 + i * 45}ms both`,
      }} />
    </span>
  ));
}

/* The quiet save acknowledgement that replaces the blocking overlay */
function SavedChip({ light }) {
  const fg = light ? TC.c100 : TC.fg2;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 9999,
      border: `1.5px solid ${light ? 'rgba(190,242,100,0.45)' : 'rgba(9,166,209,0.45)'}`,
      animation: 'pc-rise 440ms ease-out 440ms both' }}>
      <span style={{ width: 17, height: 17, borderRadius: '50%', background: TC.limeBright, color: TC.c900, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>✓</span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: fg, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>Progress saved</span>
    </div>
  );
}

/* Compact stat — big number over wide-tracked label */
function MiniStat({ value, label, color = TC.fg1, delay = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, animation: `pc-rise 520ms ease-out ${delay}ms both` }}>
      <span style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase', color: TC.fg3 }}>{label}</span>
    </div>
  );
}

function PrimaryBtn({ children, lime, onClick }) {
  return (
    <button onClick={onClick} style={{ width: '100%', border: 'none', borderRadius: 9999, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer', letterSpacing: '0.01em',
      background: lime ? TC.limeBright : TC.c800, color: lime ? TC.c900 : TC.lime }}>{children}</button>
  );
}
function GhostBtn({ children }) {
  return (
    <button style={{ width: '100%', border: `2px solid ${TC.c700}`, borderRadius: 9999, background: 'transparent', color: TC.fg1, fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, padding: 13, cursor: 'pointer' }}>{children}</button>
  );
}

/* ════════════════════════════════════════════════════════════════════
   A · ROUND COMPLETE — momentum ring. Coverage sweeps old→new; the round
   pushed the module closer to its test. Save is a quiet chip, not a modal.
   ════════════════════════════════════════════════════════════════════ */
function PCRoundComplete() {
  return (
    <TomeScreen title="Who Are You?">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 24px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 18 }}><Label>Module 01 · Round 2</Label></div>
        <div data-anno="ring" style={{ marginTop: 18, position: 'relative' }}>
          <SparkBurst radius={118} />
          <AnimRing size={188} stroke={15} from={0.55} to={0.7} fill={TC.limeBright}
            center={<div style={{ fontSize: 50, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>70<span style={{ fontSize: 22 }}>%</span></div>}
            sub={<div style={{ fontSize: 12, fontWeight: 700, color: TC.fg2, marginTop: 5 }}>module covered</div>} />
        </div>
        <div data-anno="headline" style={{ fontSize: 27, fontWeight: 700, color: TC.fg1, marginTop: 20, whiteSpace: 'nowrap', animation: 'pc-rise 420ms ease-out 120ms both' }}>Round complete</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 7, lineHeight: 1.5, animation: 'pc-rise 420ms ease-out 180ms both' }}>Strong momentum — a little more practice and the test unlocks.</div>
        <div data-anno="stats" style={{ display: 'flex', gap: 30, marginTop: 24 }}>
          <MiniStat value="20" label="answered" delay={240} />
          <MiniStat value="6" label="mastered" color={TC.green} delay={300} />
          <MiniStat value="92%" label="accuracy" delay={360} />
        </div>
        <div data-anno="saved" style={{ marginTop: 22 }}><SavedChip /></div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryBtn lime>Practice another round</PrimaryBtn>
          <GhostBtn>Back to module</GhostBtn>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ════════════════════════════════════════════════════════════════════
   B · SESSION RECAP — stats-forward. Big accuracy figure, the round's
   numbers, and the words that still need another look.
   ════════════════════════════════════════════════════════════════════ */
function PCRecap() {
  const review = [['morning', 'morgen'], ['to be called', 'at hedde']];
  return (
    <TomeScreen title="Who Are You?">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 24px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'pc-rise 440ms ease-out 60ms both' }}>
          <Label>Round complete · you scored</Label>
          <div style={{ fontSize: 60, fontWeight: 700, color: TC.c800, lineHeight: 1.05, marginTop: 6 }}>92%</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 22 }}>
          {[['8', 'words seen', TC.fg1, 140], ['7', 'first try', TC.green, 200], ['6', 'mastered', TC.fg1, 260]].map(([v, l, c, d]) => (
            <div key={l} style={{ flex: 1, padding: '14px 6px', borderRadius: 14, border: `1.5px solid rgba(9,166,209,0.4)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: `pc-rise 520ms ease-out ${d}ms both` }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</span>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: TC.fg3 }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26, animation: 'pc-rise 440ms ease-out 320ms both' }}>
          <Label style={{ marginBottom: 11 }}>Words to revisit next round</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {review.map(([en, da]) => (
              <div key={en} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 12, background: 'rgba(0,0,0,0.06)' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', background: TC.limeBright, color: TC.c900, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}><TIcon name="tome/leaf" size={13} color={TC.c900} /></span>
                <span style={{ fontSize: 15, color: TC.fg1, fontWeight: 600 }}>{en}</span>
                <TIcon name="tome/point-right" size={15} color={TC.fg3} />
                <span style={{ fontSize: 15, color: TC.c800, fontWeight: 700 }}>{da}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}><SavedChip /></div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryBtn lime>Practice another round</PrimaryBtn>
          <GhostBtn>Home</GhostBtn>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ════════════════════════════════════════════════════════════════════
   C · COVERAGE MILESTONE — the bigger moment: every word in the module has
   now been seen. Coverage bar fills to 100% and the test begins its cool-down.
   ════════════════════════════════════════════════════════════════════ */
function PCMilestone() {
  return (
    <TomeScreen title="Who Are You?">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 26, position: 'relative', width: 96, height: 96 }}>
          <SparkBurst radius={62} dots={[20, 90, 160, 230, 300]} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: TC.limeBright, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pc-pop 420ms cubic-bezier(0.38,0.1,0.36,0.9) 0ms forwards' }}>
            <TIcon name="tome/tick" size={46} color={TC.c900} />
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: TC.fg1, marginTop: 24, whiteSpace: 'nowrap', animation: 'pc-rise 420ms ease-out 160ms both' }}>All words covered</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 7, lineHeight: 1.5, animation: 'pc-rise 420ms ease-out 220ms both' }}>You've now practised every word in <b style={{ color: TC.fg1 }}>Who Are You?</b></div>

        <div data-anno="coverage" style={{ width: '100%', marginTop: 26, animation: 'pc-rise 440ms ease-out 280ms both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <Label>Module coverage</Label>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: TC.fg1 }}>8 / 8 words</span>
          </div>
          <AnimBar from={0.75} to={1} h={14} ghost={0.75} />
        </div>

        <div data-anno="unlock" style={{ width: '100%', marginTop: 22, padding: '16px 18px', borderRadius: 16, background: TC.c900, color: TC.onDark, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', animation: 'pc-rise 440ms ease-out 360ms both' }}>
          <span style={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${TC.c700}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <LockTag color={TC.c200}></LockTag>
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Module test unlocks in 4h</div>
            <div style={{ fontSize: 12.5, color: TC.c200, marginTop: 3, lineHeight: 1.45 }}>We space it out so the words stick. Keep practising meanwhile.</div>
          </div>
        </div>

        <div data-anno="saved" style={{ marginTop: 18 }}><SavedChip /></div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryBtn>Back to module</PrimaryBtn>
          <GhostBtn>Keep practising</GhostBtn>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ════════════════════════════════════════════════════════════════════
   D · QUIET SHEET — the literal anti-overlay. Instead of a blocking modal,
   a calm anvil bottom-sheet settles over the finished exercise. Saving is a
   single line, not a takeover.
   ════════════════════════════════════════════════════════════════════ */
function PCSheet() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* the last exercise, just answered, sits behind */}
      <div style={{ position: 'absolute', inset: 0, filter: 'saturate(0.92)' }}><ExTranslation state="correct" /></div>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,40,48,0.5)', animation: 'pc-scrim 320ms ease-out both' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: TC.c900, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: '10px 22px 24px', color: TC.onDark, animation: 'pc-sheet 360ms cubic-bezier(0.38,0.1,0.36,0.9) both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 0 12px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(236,254,255,0.35)' }} />
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SparkBurst radius={46} dots={[30, 150, 270]} />
          <span style={{ width: 58, height: 58, borderRadius: '50%', background: TC.limeBright, color: TC.c900, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pc-pop 400ms cubic-bezier(0.38,0.1,0.36,0.9) 140ms both' }}>
            <TIcon name="tome/tick" size={30} color={TC.c900} />
          </span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', textAlign: 'center', marginTop: 14 }}>Round complete</div>
        <div style={{ fontSize: 13, color: TC.c200, textAlign: 'center', marginTop: 5, display: 'inline-flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(190,242,100,0.25)', color: TC.limeBright, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>✓</span>
          Progress saved automatically
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: TC.c200 }}>Module coverage</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: TC.limeBright }}>+15%</span>
          </div>
          <AnimBar from={0.55} to={0.7} h={12} track="rgba(255,255,255,0.16)" ghost={0.55} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 18 }}>
          <MiniStat value="6" label="mastered" color={TC.limeBright} delay={220} />
          <div style={{ width: 1, background: 'rgba(255,255,255,0.16)' }} />
          <MiniStat value="92%" label="accuracy" color="#fff" delay={280} />
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.limeBright, color: TC.c900, fontFamily: 'inherit', fontWeight: 700, fontSize: 15.5, padding: 15, cursor: 'pointer' }}>Practice another round</button>
          <button style={{ width: '100%', border: 'none', background: 'transparent', color: TC.c100, fontFamily: 'inherit', fontWeight: 700, fontSize: 13.5, padding: '4px 0 0', cursor: 'pointer' }}>Back to module</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AnimRing, AnimBar, SparkBurst, SavedChip, MiniStat, PrimaryBtn, GhostBtn,
  PCRoundComplete, PCRecap, PCMilestone, PCSheet,
});
