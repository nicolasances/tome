/* Tome Language Learning — Level Test screens.
   The Level Test is the CEFR-level sibling of the Module Test (§6). It is gated on
   completing ALL 12 modules of a level, samples across the whole level (40 questions),
   and on passing PROMOTES you to the next CEFR level (A1 → A2). The in-test interface,
   submit, and review screens are identical to the Module Test and are reused as-is —
   only these three screens differ: how it surfaces on Home, the Ready intro, and the
   promotion result. Requires tome-kit.jsx + home-screens.jsx (WEEK, LEVELS, WeeklyStats). */

/* Small lock glyph */
function LTLock({ size = 16, color = TC.fg3, stroke = 1.5 }) {
  return (
    <svg width={size * 0.85} height={size} viewBox="0 0 11 13" fill="none">
      <rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={color} strokeWidth={stroke} />
      <path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={color} strokeWidth={stroke} />
    </svg>
  );
}

/* 80% threshold marker bar (local copy — TestShell's lives in test-screens) */
function LTThreshold({ score, pass }) {
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

/* ───────────────────── A · HOME — Level Test available ─────────────────────
   All 12 A1 modules complete; the level track shows A1 done, A2 as the gated
   next stop, and the big CTA flips from "Continue module" to the Level Test. */
function HomeLevelTest() {
  const active = 0; // A1 still the current level until the test promotes you
  return (
    <TomeScreen title="Language Learning">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 18px 0', gap: 22, overflow: 'hidden' }}>
        {/* level track — A1 complete, A2 is the gated next stop */}
        <div>
          <Label style={{ marginBottom: 14 }}>Your path to fluency</Label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {LEVELS.map((lv, i) => {
              const done = i < active, cur = i === active, next = i === active + 1;
              return (
                <React.Fragment key={lv}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 auto', position: 'relative' }}>
                    {/* A1 is complete: filled lime with a check; A2 is the gated next */}
                    <div style={{
                      width: cur ? 44 : 34, height: cur ? 44 : 34, borderRadius: '50%',
                      border: cur ? `2.5px solid ${TC.lime}` : next ? `2px dashed ${TC.lime}` : `2px solid ${done ? TC.limeBright : 'rgba(0,0,0,0.22)'}`,
                      background: cur ? TC.lime : done ? TC.limeBright : 'transparent',
                      color: cur ? TC.c800 : next ? TC.fg2 : done ? TC.c800 : TC.fg3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: cur ? 15 : 12, fontWeight: 700,
                    }}>{lv}</div>
                  </div>
                  {i < LEVELS.length - 1 && (
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '100%', height: 2.5, borderRadius: 2, background: i === active ? TC.lime : 'rgba(0,0,0,0.16)' }} />
                      {/* the test gate sits on the A1 → A2 link */}
                      {i === active && (
                        <div style={{ position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: TC.cyan, border: `2px solid ${TC.lime}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LTLock size={10} color={TC.c800} stroke={1.6} />
                        </div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: TC.fg1 }}>Foundation · complete</span>
            {/* all 12 module dots filled */}
            <div style={{ display: 'flex', gap: 5 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} style={{ width: 7, height: 7, borderRadius: 7, background: TC.limeBright }} />
              ))}
            </div>
          </div>
        </div>

        {/* the unlock moment: a lime-filled, celebratory CTA (vs the deep-teal continue card) */}
        <div style={{
          borderRadius: 18, background: TC.lime, color: TC.c800,
          padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 13,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: TC.c800, color: TC.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <TIcon name="tome/point-right" size={22} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.55)' }}>Level Test unlocked · A1 → A2</div>
              <div style={{ fontSize: 19, fontWeight: 700, color: TC.c800, marginTop: 3 }}>Prove your foundation</div>
            </div>
          </div>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 15.5, padding: 14, cursor: 'pointer', letterSpacing: '0.02em' }}>Take the Level Test</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-start', gap: 8 }}>
          <RoundButton name="tome/book" variant="primary" label="Modules" />
          <RoundButton name="tome/magic" variant="primary" label="Analyze" />
          <RoundButton name="tome/sources" variant="primary" label="Sources" />
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ marginBottom: 14 }}>
          <Label color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }}>This week</Label>
          <WeeklyStats days={WEEK} height={100} />
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────── B · LEVEL TEST — Ready intro ─────────────────────
   Mirrors the Module Test's Ready screen, but the scope is the whole level. */
function LevelTestReady() {
  const rows = [
    ['tome/sentences', '40 questions', 'sampled across all 12 modules'],
    ['tome/signal-good', '80% to pass', 'promotes you to A2'],
    ['tome/magic', 'Instant feedback', 'see mistakes as you go'],
    ['tome/language', 'Counts toward mastery', 'same as practice'],
  ];
  return (
    <TomeScreen title="Level Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px 22px 0', overflow: 'hidden' }}>
        <Label>A1 · Foundation → A2</Label>
        <div style={{ fontSize: 30, fontWeight: 700, color: TC.fg1, marginTop: 8, lineHeight: 1.08 }}>Ready to<br />level up?</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 11, lineHeight: 1.5 }}>One run across everything A1 taught — all twelve modules, vocabulary and grammar, mixed together.</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 22 }}>
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
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer', letterSpacing: '0.02em' }}>Start Level Test</button>
          <div style={{ fontSize: 12, color: TC.fg3, fontWeight: 600, marginTop: 12, textAlign: 'center' }}>The in-test questions work exactly like practice.</div>
        </div>
      </div>
    </TomeScreen>
  );
}

/* ───────────────────── C · LEVEL TEST — Promotion result ─────────────────────
   The pass result differs from a module pass: it promotes the learner a CEFR level. */
function LevelTestPass() {
  return (
    <TomeScreen title="Level Test">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 24px 0', textAlign: 'center' }}>
        <div style={{ marginTop: 22, position: 'relative' }}>
          {[14, 62, 118, 176, 244, 302].map((a, i) => (
            <span key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: 8, height: 8, borderRadius: '50%', background: i % 2 ? TC.limeBright : TC.spark, transform: `rotate(${a}deg) translateY(-120px)` }} />
          ))}
          <Ring size={186} stroke={15} pct={0.88} track="rgba(0,0,0,0.10)" fill={TC.limeBright}
            center={<div style={{ fontSize: 52, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>88<span style={{ fontSize: 24 }}>%</span></div>}
            sub={<div style={{ fontSize: 12, fontWeight: 700, color: TC.fg2, marginTop: 6 }}>35 / 40 correct</div>} />
        </div>

        {/* level promotion — A1 → A2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22 }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', border: `2px solid ${TC.limeBright}`, background: TC.limeBright, color: TC.c800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>A1</div>
          <TIcon name="tome/point-right" size={22} color={TC.fg2} />
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2.5px solid ${TC.lime}`, background: TC.lime, color: TC.c800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>A2</div>
        </div>

        <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, marginTop: 18 }}>You're now A2!</div>
        <div style={{ fontSize: 14, color: TC.fg2, marginTop: 7, lineHeight: 1.5 }}><b>Foundation</b> is complete. The <b>Elementary</b> modules are now open.</div>
        <div style={{ width: '100%', marginTop: 20 }}><LTThreshold score={88} pass /></div>
        <div style={{ flex: 1 }} />
        <div style={{ width: '100%', paddingBottom: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: TC.c800, color: TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 16, padding: 16, cursor: 'pointer' }}>Start A2</button>
          <button style={{ width: '100%', border: `2px solid ${TC.c700}`, borderRadius: 9999, background: 'transparent', color: TC.fg1, fontFamily: 'inherit', fontWeight: 700, fontSize: 14.5, padding: 13, cursor: 'pointer' }}>Review answers</button>
        </div>
      </div>
    </TomeScreen>
  );
}

Object.assign(window, { HomeLevelTest, LevelTestReady, LevelTestPass });
