/* Tome Language Learning — Module map (3 variations) + module flow screens.
   A1 "Foundation" curriculum, fresh beginner: module 1 in progress, rest locked.
   Requires tome-kit.jsx. */

const A1_MODULES = [
  { n: '01', t: 'Who Are You?', st: 'progress' },
  { n: '02', t: 'Numbers, Dates & Time', st: 'locked' },
  { n: '03', t: 'Colors & Describing Things', st: 'locked' },
  { n: '04', t: 'Family & Relationships', st: 'locked' },
  { n: '05', t: 'Where You Live', st: 'locked' },
  { n: '06', t: 'Daily Routine', st: 'locked' },
  { n: '07', t: 'Food & Eating Habits', st: 'locked' },
  { n: '08', t: 'Getting Around Town', st: 'locked' },
  { n: '09', t: 'Feelings & States', st: 'locked' },
  { n: '10', t: 'Seasons & Weather', st: 'locked' },
  { n: '11', t: 'Shopping Basics', st: 'locked' },
  { n: '12', t: 'Asking for Help', st: 'locked' },
];

function NodeNum({ n, st, size = 38 }) {
  const cur = st === 'progress', done = st === 'done';
  const bg = done ? TC.limeBright : cur ? TC.lime : 'rgba(0,0,0,0.04)';
  const bd = done ? TC.limeBright : cur ? TC.lime : 'rgba(0,0,0,0.20)';
  const col = (cur || done) ? TC.c800 : TC.fg3;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: `2px solid ${bd}`, background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.34, fontWeight: 700, flex: '0 0 auto' }}>
      {st === 'locked' ? <svg width={size * 0.34} height={size * 0.4} viewBox="0 0 11 13" fill="none"><rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={TC.fg3} strokeWidth="1.4" /><path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={TC.fg3} strokeWidth="1.4" /></svg> : done ? '✓' : n}
    </div>
  );
}

/* ───────────────────── MAP A — Vertical list ───────────────────── */
function MapA() {
  return (
    <TomeScreen title="A1 · Foundation">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 18px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}><Bar pct={0.04} h={7} /></div>
          <span style={{ fontSize: 12, fontWeight: 700, color: TC.fg1, whiteSpace: 'nowrap' }}>0 / 12</span>
        </div>
        <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
          {[['In progress', TC.lime], ['Up next', 'rgba(0,0,0,0.20)'], ['Locked', 'transparent']].map(([t, c], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: c === 'transparent' ? 'transparent' : c, border: c === 'transparent' ? `1.5px solid ${TC.fg3}` : 'none' }} />
              <span style={{ fontSize: 10.5, color: TC.fg3, fontWeight: 600 }}>{t}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {A1_MODULES.slice(0, 8).map((m, i) => {
            const cur = m.st === 'progress';
            return (
              <div key={m.n} style={{
                display: 'flex', alignItems: 'center', gap: 13, padding: '11px 12px', marginLeft: -4,
                borderRadius: 12, background: cur ? 'rgba(14,116,144,0.32)' : 'transparent',
                borderBottom: (!cur && i < 7) ? '1px solid rgba(9,166,209,0.35)' : 'none',
              }}>
                <NodeNum n={m.n} st={m.st} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: cur ? 700 : 500, color: cur ? TC.fg1 : TC.fg2 }}>{m.t}</div>
                  {cur
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}><div style={{ width: 96 }}><Bar pct={0.34} h={5} /></div><span style={{ fontSize: 10.5, fontWeight: 600, color: TC.fg2 }}>Step 1 / 3</span></div>
                    : <div style={{ marginTop: 3 }}><LockTag>Locked</LockTag></div>}
                </div>
                {cur && <RoundButton name="tome/point-right" size={38} variant="filled" glyph={17} />}
              </div>
            );
          })}
          <div style={{ textAlign: 'center', fontSize: 12, color: TC.fg3, fontWeight: 600, marginTop: 12 }}>+ 4 more modules</div>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────── MAP B — Journey path ───────────────────── */
function MapB() {
  const cx = 162;
  const pts = [
    { x: cx - 60, y: 60, ...A1_MODULES[0] },
    { x: cx + 60, y: 168, ...A1_MODULES[1] },
    { x: cx - 60, y: 276, ...A1_MODULES[2] },
    { x: cx + 60, y: 384, ...A1_MODULES[3] },
    { x: cx - 60, y: 486, ...A1_MODULES[4] },
  ];
  const seg = (a, b) => `M${a.x},${a.y} C${a.x},${(a.y + b.y) / 2} ${b.x},${(a.y + b.y) / 2} ${b.x},${b.y}`;
  return (
    <TomeScreen title="A1 · Foundation">
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <svg width="100%" height="100%" viewBox="0 0 324 560" preserveAspectRatio="xMidYMin meet" style={{ position: 'absolute', top: 8, left: 0 }}>
            {pts.slice(0, -1).map((p, i) => (
              <path key={i} d={seg(p, pts[i + 1])} fill="none" stroke={i === 0 ? TC.lime : 'rgba(0,0,0,0.16)'} strokeWidth="5" strokeLinecap="round" strokeDasharray={i === 0 ? 'none' : '2 12'} />
            ))}
          </svg>
          {pts.map((p, i) => {
            const cur = p.st === 'progress';
            return (
              <div key={i}>
                <div style={{ position: 'absolute', left: p.x, top: p.y + 8, transform: 'translate(-50%,-50%)' }}>
                  {cur && <div style={{ position: 'absolute', inset: -7, borderRadius: '50%', border: `2px solid ${TC.lime}`, opacity: 0.5 }} />}
                  <div style={{ width: 58, height: 58, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: cur ? TC.lime : 'rgba(0,0,0,0.05)', border: cur ? 'none' : '2px solid rgba(0,0,0,0.18)', color: cur ? TC.c800 : TC.fg3 }}>
                    {cur ? <TIcon name="tome/point-right" size={24} /> : <svg width="14" height="16" viewBox="0 0 11 13" fill="none"><rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={TC.fg3} strokeWidth="1.4" /><path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={TC.fg3} strokeWidth="1.4" /></svg>}
                  </div>
                </div>
                {/* label */}
                <div style={{ position: 'absolute', top: p.y - 8, left: p.x < cx ? p.x + 40 : 8, width: p.x < cx ? 150 : p.x - 40 - 8, textAlign: p.x < cx ? 'left' : 'right' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: cur ? TC.fg2 : TC.fg3 }}>A1·{p.n}</div>
                  <div style={{ fontSize: 13.5, fontWeight: cur ? 700 : 500, color: cur ? TC.fg1 : TC.fg2, lineHeight: 1.2, marginTop: 2 }}>{p.t}</div>
                  {cur && <div style={{ fontSize: 11, color: TC.fg2, marginTop: 3, fontWeight: 600 }}>Step 1 / 3 · continue →</div>}
                </div>
              </div>
            );
          })}
          <div style={{ position: 'absolute', top: 524, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: TC.fg3, fontWeight: 600 }}>↓ 7 more on the path to A2</div>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────── MAP C — Grid of tiles ───────────────────── */
function MapC() {
  return (
    <TomeScreen title="A1 · Foundation">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 16px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TC.fg1 }}>Foundation</span>
          <div style={{ flex: 1 }}><Bar pct={0.04} h={6} /></div>
          <span style={{ fontSize: 12, fontWeight: 700, color: TC.fg1 }}>0/12</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {A1_MODULES.map((m) => {
            const cur = m.st === 'progress';
            return (
              <div key={m.n} style={{
                borderRadius: 14, padding: '11px 12px', minHeight: 78,
                background: cur ? TC.lime : 'rgba(14,116,144,0.22)',
                border: cur ? 'none' : '1px solid rgba(9,166,209,0.4)',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: cur ? TC.c800 : 'rgba(0,0,0,0.30)' }}>{m.n}</span>
                  {!cur && <svg width="11" height="13" viewBox="0 0 11 13" fill="none" style={{ marginTop: 3 }}><rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={TC.fg3} strokeWidth="1.4" /><path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={TC.fg3} strokeWidth="1.4" /></svg>}
                </div>
                <div style={{ fontSize: 12, fontWeight: cur ? 700 : 600, color: cur ? TC.c800 : TC.fg2, lineHeight: 1.22 }}>{m.t}</div>
                {cur && <div style={{ marginTop: 7 }}><Bar pct={0.34} h={5} track="rgba(0,0,0,0.15)" fill={TC.c800} /></div>}
              </div>
            );
          })}
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────── MODULE OVERVIEW ───────────────────── */
function ModuleOverview() {
  const steps = [
    { icon: 'tome/teacher', t: 'Grammar', sub: '3 concepts · learned', st: 'done' },
    { icon: 'tome/language', t: 'Practice', sub: '20 a round · no pressure', st: 'active', coverage: { seen: 18, total: 30 } },
    { icon: 'tome/tick', t: 'Module Test', sub: '30–40 questions · 80% to pass', st: 'locked' },
  ];
  return (
    <TomeScreen title="Module">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '6px 18px 0', overflow: 'hidden' }}>
        <Label>A1·01 · Identity & introductions</Label>
        <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, marginTop: 6, lineHeight: 1.1 }}>Who Are You?</div>
        <div style={{ fontSize: 13.5, color: TC.fg2, marginTop: 9, lineHeight: 1.5 }}>Introduce yourself — say your name, where you're from, your age and what you do.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {steps.map((s, i) => {
            const locked = s.st === 'locked', active = s.st === 'active', done = s.st === 'done';
            return (
              <div key={i} style={{ display: 'flex', alignItems: active ? 'flex-start' : 'center', gap: 13, padding: '13px 14px', borderRadius: 14,
                background: active ? 'rgba(14,116,144,0.32)' : 'transparent', border: active ? 'none' : '1px solid rgba(9,166,209,0.4)', opacity: locked ? 0.85 : 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
                  background: done ? TC.limeBright : active ? TC.lime : 'transparent', border: (done || active) ? 'none' : `2px solid ${locked ? 'rgba(0,0,0,0.18)' : TC.c600}`, color: (done || active) ? TC.c800 : TC.fg3 }}>
                  <span style={{ fontSize: done ? 16 : 13, fontWeight: 700 }}>{done ? '✓' : i + 1}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: TC.fg1 }}>{s.t}</div>
                  <div style={{ fontSize: 11.5, color: TC.fg2, marginTop: 2 }}>{s.sub}</div>
                  {s.coverage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
                      <div style={{ flex: 1 }}><Bar pct={s.coverage.seen / s.coverage.total} h={6} /></div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: TC.fg1, whiteSpace: 'nowrap' }}>{s.coverage.seen} / {s.coverage.total}<span style={{ color: TC.fg2, fontWeight: 600 }}> words</span></span>
                    </div>
                  )}
                </div>
                {locked && <div style={{ alignSelf: 'center' }}><LockTag>4h after practice</LockTag></div>}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 0 16px' }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: '15px', cursor: 'pointer', letterSpacing: '0.02em' }}>Continue practice</button>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────── GRAMMAR INTRO (Step 1) ───────────────────── */
function GrammarIntro() {
  return (
    <TomeScreen title="Who Are You?">
      <div style={{ padding: '6px 18px 0' }}>
        <SessionBar total={3} mastered={1} deferred={0} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Label>Grammar</Label>
          <span style={{ fontSize: 11, fontWeight: 700, color: TC.fg2 }}>1 / 3</span>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 18px 0', overflow: 'hidden' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: TC.lime, color: TC.c800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <TIcon name="tome/teacher" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: TC.fg1 }}>Present tense — at være</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: TC.fg1, lineHeight: 1.55 }}>
            Danish verbs don't change with the subject. <b>At være</b> (to be) is simply <b>er</b> — for I, you, he, she, everyone.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {[['Jeg er fra Danmark.', 'I am from Denmark.'], ['Hun er læge.', 'She is a doctor.']].map(([da, en], i) => (
              <div key={i} style={{ borderLeft: `4px solid ${TC.lime}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: TC.fg1 }}>{da}</div>
                <div style={{ fontSize: 12.5, color: TC.fg2, marginTop: 1 }}>{en}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 16 }}>
          <RoundButton name="tome/point-right" size={52} variant="primary" />
        </div>
      </div>
    </TomeScreen>
  );
}

Object.assign(window, { MapA, MapB, MapC, ModuleOverview, GrammarIntro, A1_MODULES });
