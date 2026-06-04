/* Tome Language Learning — Home dashboard treatments (3).
   Demo state: fresh A1 beginner, first module "Who Are You?" available.
   Requires tome-kit.jsx. */

const WEEK = [
  { label: 'M', count: 1 }, { label: 'T', count: 0 }, { label: 'W', count: 2 },
  { label: 'T', count: 1 }, { label: 'F', count: 3 }, { label: 'S', count: 0 }, { label: 'S', count: 1 },
];

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/* Current-module continue card (shared) */
function ContinueCard({ accent = TC.limeBright, deep }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderRadius: 16, border: `1.5px solid ${TC.spark}`,
      background: deep ? 'rgba(0,68,80,0.28)' : 'rgba(14,116,144,0.30)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Label style={{ marginBottom: 6 }}>Continue · A1·01</Label>
        <div style={{ fontSize: 18, fontWeight: 700, color: TC.fg1, marginBottom: 10 }}>Who Are You?</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ flex: 1 }}><Bar pct={0.34} h={7} fill={accent} /></div>
          <span style={{ fontSize: 11, fontWeight: 600, color: TC.fg2, whiteSpace: 'nowrap' }}>Step 1 / 3</span>
        </div>
      </div>
      <RoundButton name="tome/point-right" size={46} variant="filled" />
    </div>
  );
}

function HomeRow({ children }) {
  return <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', gap: 8 }}>{children}</div>;
}

/* ───────────────────────── HOME A — Hero badge ───────────────────────── */
function HomeA() {
  return (
    <TomeScreen title="Language Learning">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 18px 0', gap: 26, overflow: 'hidden' }}>
        {/* hero badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <div style={{
            width: 112, height: 112, borderRadius: '50%', border: `3px solid ${TC.lime}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(217,249,157,0.12)',
          }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>A1</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: TC.fg1 }}>Foundation</div>
            <Label style={{ marginTop: 3 }}>Level 1 of 6 · 0 / 12 modules</Label>
          </div>
        </div>

        <ContinueCard />

        <HomeRow>
          <RoundButton name="tome/book" variant="primary" label="Modules" />
          <RoundButton name="tome/magic" variant="primary" label="Analyze" />
          <RoundButton name="tome/knowledge-base" variant="primary" label="Knowledge" />
        </HomeRow>

        <div style={{ flex: 1 }} />
        <div style={{ marginBottom: 14 }}>
          <Label color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }}>This week</Label>
          <WeeklyStats days={WEEK} height={120} />
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────────── HOME B — Progress ring ───────────────────────── */
function HomeB() {
  return (
    <TomeScreen title="Language Learning">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 18px 0', gap: 24, overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <Ring size={168} stroke={13} pct={0.08}
            center={<span style={{ fontSize: 46, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>A1</span>}
            sub={<span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TC.fg3, marginTop: 4 }}>Foundation</span>}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: TC.fg1 }}>1 / 12 modules</span>
            <span style={{ width: 4, height: 4, borderRadius: 4, background: TC.fg3 }} />
            <span style={{ fontSize: 13, color: TC.fg2 }}>11 to reach A2</span>
          </div>
        </div>

        <ContinueCard />

        <HomeRow>
          <RoundButton name="tome/book" variant="primary" label="Modules" />
          <RoundButton name="tome/magic" variant="primary" label="Analyze" />
          <RoundButton name="tome/knowledge-base" variant="primary" label="Knowledge" />
        </HomeRow>

        <div style={{ flex: 1 }} />
        <div style={{ marginBottom: 14 }}>
          <Label color="rgba(255,255,255,0.8)" style={{ marginBottom: 10 }}>This week</Label>
          <WeeklyStats days={WEEK} height={96} />
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────────── HOME C — Level track ───────────────────────── */
function HomeC() {
  const active = 0;
  return (
    <TomeScreen title="Language Learning">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 18px 0', gap: 26, overflow: 'hidden' }}>
        {/* level track */}
        <div>
          <Label style={{ marginBottom: 14 }}>Your path to fluency</Label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {LEVELS.map((lv, i) => {
              const done = i < active, cur = i === active;
              return (
                <React.Fragment key={lv}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
                    <div style={{
                      width: cur ? 44 : 34, height: cur ? 44 : 34, borderRadius: '50%',
                      border: cur ? `2.5px solid ${TC.lime}` : `2px solid ${done ? TC.limeBright : 'rgba(0,0,0,0.22)'}`,
                      background: cur ? TC.lime : done ? TC.limeBright : 'transparent',
                      color: (cur || done) ? TC.c800 : TC.fg3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: cur ? 15 : 12, fontWeight: 700,
                    }}>{lv}</div>
                  </div>
                  {i < LEVELS.length - 1 && <div style={{ flex: 1, height: 2.5, borderRadius: 2, background: i < active ? TC.limeBright : 'rgba(0,0,0,0.16)' }} />}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TC.fg1 }}>Foundation</span>
            {/* module dots */}
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: 7, background: i === 0 ? TC.lime : 'transparent', border: i === 0 ? 'none' : '1.5px solid rgba(0,0,0,0.22)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* big continue CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
          borderRadius: 18, background: TC.c800, color: TC.onDark,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: TC.lime, color: TC.c800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <TIcon name="tome/point-right" size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TC.c200 }}>Continue · A1·01</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 3 }}>Who Are You?</div>
          </div>
        </div>

        <HomeRow>
          <RoundButton name="tome/book" variant="primary" label="Modules" />
          <RoundButton name="tome/magic" variant="primary" label="Analyze" />
          <RoundButton name="tome/sources" variant="primary" label="Sources" />
        </HomeRow>

        <div style={{ flex: 1 }} />
        <div style={{ marginBottom: 14 }}>
          <Label color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }}>This week</Label>
          <WeeklyStats days={WEEK} height={110} />
        </div>
      </div>
    </TomeScreen>
  );
}

Object.assign(window, { HomeA, HomeB, HomeC, WEEK, LEVELS, ContinueCard });
