/* Tome Language Learning — DESKTOP: Module map (A1 Foundation, 12 modules). */

function ModuleMap({ onOpenModule }) {
  const done = 0, total = D_MODULES.length;
  return (
    <div style={pageWrap}>
      <PageHead kicker="A1 · Foundation" title="Module map"
        right={<div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>{done}<span style={{ color: TC.fg3, fontSize: 18 }}> / {total}</span></div>
          <Label style={{ marginTop: 4 }}>modules complete</Label>
        </div>} />

      {/* progress + legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
        <div style={{ flex: 1, maxWidth: 520 }}><Bar pct={done / total} h={9} /></div>
        <div style={{ display: 'flex', gap: 18 }}>
          {[['In progress', TC.lime, false], ['Locked', 'transparent', true]].map(([t, c, lock], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 11, height: 11, borderRadius: 11, background: lock ? 'transparent' : c, border: lock ? `1.5px solid ${TC.fg3}` : 'none' }} />
              <span style={{ fontSize: 12, color: TC.fg3, fontWeight: 600 }}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="map-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {D_MODULES.map((m) => {
          const isCur = m.st === 'progress';
          return (
            <div key={m.n} className="tpress" onClick={() => isCur && onOpenModule(m.n)} style={{
              borderRadius: 18, padding: '20px 22px', minHeight: 158, cursor: isCur ? 'pointer' : 'default',
              background: isCur ? TC.lime : 'rgba(14,116,144,0.22)', border: isCur ? 'none' : `1.5px solid ${TC.border}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: isCur ? TC.c800 : 'rgba(0,0,0,0.28)', lineHeight: 1 }}>{m.n}</span>
                {isCur
                  ? <div style={{ width: 38, height: 38, borderRadius: '50%', background: TC.c800, color: TC.lime, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TIcon name="tome/point-right" size={18} /></div>
                  : <LockGlyph size={16} />}
              </div>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: isCur ? TC.c800 : TC.fg1, lineHeight: 1.25 }}>{m.t}</div>
                {isCur
                  ? <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 12 }}>
                      <div style={{ flex: 1 }}><Bar pct={m.step / 3} h={6} track="rgba(0,0,0,0.15)" fill={TC.c800} /></div>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: TC.c800, whiteSpace: 'nowrap' }}>Step {m.step}/3</span>
                    </div>
                  : <div style={{ fontSize: 12, color: TC.fg3, fontWeight: 600, marginTop: 8 }}>Finish module {String(+m.n - 1).padStart(2, '0')} to unlock</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { ModuleMap });
