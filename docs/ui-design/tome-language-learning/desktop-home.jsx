/* Tome Language Learning — DESKTOP page bodies: Home · Module map · Module flow.
   Requires tome-kit.jsx + desktop-screens.jsx. */

const MAXW = 1080;
const pageWrap = { maxWidth: MAXW, margin: '0 auto', padding: '40px 48px 56px' };

/* ════════════════════════ HOME DASHBOARD ════════════════════════════════ */
function HomeDashboard({ onOpenModule, onOpenMap }) {
  const cur = D_MODULES[0];
  const active = 0; // current level index
  const wordsSeen = cur.cov.seen;
  const weekTotal = D_WEEK.reduce((a, d) => a + d.count, 0);

  return (
    <div style={pageWrap}>
      <PageHead kicker="Language Learning" title="Goddag — let's keep going"
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>{weekTotal}</div>
            <Label style={{ marginTop: 4 }}>sessions this week</Label>
          </div>
          <RoundButton name="tome/magic" size={46} variant="primary" />
        </div>} />

      {/* level path */}
      <div style={{ padding: '2px 2px', marginBottom: 30 }}>
        {sectionLabel('Your path to fluency')}
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          {D_LEVELS.map((L, i) => {
            const done = i < active, isCur = i === active;
            return (
              <React.Fragment key={L.lv}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
                  <div style={{ height: 60, display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: isCur ? 60 : 46, height: isCur ? 60 : 46, borderRadius: '50%',
                      border: isCur ? `3px solid ${TC.lime}` : `2px solid ${done ? TC.limeBright : 'rgba(0,0,0,0.20)'}`,
                      background: isCur ? TC.lime : done ? TC.limeBright : 'transparent',
                      color: (isCur || done) ? TC.c800 : TC.fg3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isCur ? 22 : 16, fontWeight: 700,
                    }}>{L.lv}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: isCur ? 700 : 600, color: isCur ? TC.fg1 : TC.fg3 }}>{L.name}</div>
                </div>
                {i < D_LEVELS.length - 1 && <div style={{ flex: 1, height: 3, borderRadius: 3, margin: '28.5px 6px 0', background: i < active ? TC.limeBright : 'rgba(0,0,0,0.16)' }} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* two-column: continue (wide) + this week */}
      <div className="home-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22, marginBottom: 22 }}>
        {/* continue */}
        <div className="tpress" onClick={() => onOpenModule(cur.n)} style={{
          borderRadius: 20, background: TC.c800, color: TC.onDark, padding: '28px 30px', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: TC.c200 }}>Continue · A1·{cur.n}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginTop: 8, lineHeight: 1.05 }}>{cur.t}</div>
              <div style={{ fontSize: 14, color: TC.c100, marginTop: 8 }}>{cur.sub}</div>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: TC.lime, color: TC.c800, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <TIcon name="tome/point-right" size={28} />
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}><Bar pct={cur.step / 3} h={9} track="rgba(255,255,255,0.18)" /></div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>Step {cur.step} / 3</span>
            </div>
            <div style={{ fontSize: 12.5, color: TC.c100, marginTop: 10 }}>Practice · {cur.cov.seen} / {cur.cov.total} words seen this round</div>
          </div>
        </div>

        {/* this week */}
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column' }}>
          {sectionLabel('This week', 'rgba(255,255,255,0.85)')}
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
            <WeeklyStats days={D_WEEK} height={150} />
          </div>
        </div>
      </div>

      {/* stat tiles */}
      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, marginBottom: 26 }}>
        {[
          { v: '1', s: 'of 12 modules', n: 'A1 Foundation' },
          { v: wordsSeen, s: 'words seen', n: 'this round' },
          { v: weekTotal + 'd', s: 'active days', n: 'last 7 days' },
        ].map((t, i) => (
          <div key={i} style={{ ...panel({ padding: '20px 24px' }) }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 38, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>{t.v}</span>
              <span style={{ fontSize: 14, color: TC.fg2, fontWeight: 600 }}>{t.s}</span>
            </div>
            <Label style={{ marginTop: 8 }}>{t.n}</Label>
          </div>
        ))}
      </div>

      {/* up next strip → modules */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        {sectionLabel('Up next in Foundation')}
        <button className="tpress link-btn" onClick={onOpenMap} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: TC.fg1, display: 'flex', alignItems: 'center', gap: 6 }}>
          All modules <TIcon name="tome/point-right" size={15} />
        </button>
      </div>
      <div className="upnext-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {D_MODULES.slice(0, 4).map((m) => {
          const isCur = m.st === 'progress';
          return (
            <div key={m.n} className="tpress" onClick={() => isCur && onOpenModule(m.n)} style={{
              borderRadius: 14, padding: '16px 18px', minHeight: 96, cursor: isCur ? 'pointer' : 'default',
              background: isCur ? TC.lime : 'rgba(14,116,144,0.22)', border: isCur ? 'none' : `1px solid ${TC.border}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: isCur ? TC.c800 : 'rgba(0,0,0,0.30)' }}>{m.n}</span>
                {!isCur && <LockGlyph />}
              </div>
              <div style={{ fontSize: 13, fontWeight: isCur ? 700 : 600, color: isCur ? TC.c800 : TC.fg2, lineHeight: 1.25, marginTop: 10 }}>{m.t}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HomeDashboard, MAXW, pageWrap });
