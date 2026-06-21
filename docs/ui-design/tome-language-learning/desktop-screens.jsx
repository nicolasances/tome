/* Tome Language Learning — DESKTOP (browser) screens.
   Same Toto/Tome visual language as the phone build (cyan flood · Comfortaa ·
   lime accent · round buttons · hairline borders · NO shadows) re-laid-out for a
   wide browser window: persistent left sidebar + a roomy content area.
   Requires tome-kit.jsx (TC, RoundButton, Ring, Bar, WeeklyStats, Label, TIcon, LockTag). */

/* ── Demo data (A1 "Foundation", fresh beginner) ─────────────────────────── */
const D_WEEK = [
  { label: 'Mon', count: 1 }, { label: 'Tue', count: 0 }, { label: 'Wed', count: 2 },
  { label: 'Thu', count: 1 }, { label: 'Fri', count: 3 }, { label: 'Sat', count: 0 }, { label: 'Sun', count: 1 },
];
const D_LEVELS = [
  { lv: 'A1', name: 'Foundation' }, { lv: 'A2', name: 'Elementary' }, { lv: 'B1', name: 'Threshold' },
  { lv: 'B2', name: 'Vantage' }, { lv: 'C1', name: 'Advanced' }, { lv: 'C2', name: 'Mastery' },
];
const D_MODULES = [
  { n: '01', t: 'Who Are You?', sub: 'Identity & introductions', st: 'progress', step: 1, cov: { seen: 18, total: 30 } },
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

/* ── Shared surface helpers ──────────────────────────────────────────────── */
const panel = (extra = {}) => ({
  borderRadius: 18, border: `1.5px solid ${TC.spark}`, background: 'rgba(14,116,144,0.30)', ...extra,
});
const sectionLabel = (children, color) => <Label color={color} style={{ marginBottom: 14 }}>{children}</Label>;

function LockGlyph({ size = 14, color = TC.fg3 }) {
  return <svg width={size} height={size * 1.18} viewBox="0 0 11 13" fill="none" style={{ flex: '0 0 auto' }}>
    <rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={color} strokeWidth="1.4" />
    <path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={color} strokeWidth="1.4" /></svg>;
}

/* ───────────────────────── SIDEBAR ─────────────────────────────────────── */
const NAV = [
  { id: 'home', icon: 'tome/home', label: 'Home' },
  { id: 'map', icon: 'tome/book', label: 'Modules' },
  { id: 'analyze', icon: 'tome/magic', label: 'Analyze' },
  { id: 'knowledge', icon: 'tome/knowledge-base', label: 'Knowledge' },
  { id: 'sources', icon: 'tome/sources', label: 'Sources' },
];

function NavItem({ item, active, onClick }) {
  return (
    <button className="tpress" onClick={onClick} title={item.label} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
      padding: '12px 14px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
      border: active ? `1.5px solid ${TC.lime}` : '1.5px solid transparent',
      background: 'transparent',
      color: active ? TC.fg1 : TC.fg2,
    }}>
      <span className="nav-ico" style={{ display: 'inline-flex', color: active ? TC.c800 : TC.fg2, flex: '0 0 auto' }}>
        <TIcon name={item.icon} size={22} color="currentColor" />
      </span>
      <span className="nav-label" style={{ fontSize: 15, fontWeight: active ? 700 : 600, whiteSpace: 'nowrap' }}>{item.label}</span>
    </button>
  );
}

function Sidebar({ page, onNav }) {
  const navActive = page === 'flow' ? 'map' : page;
  return (
    <aside className="tome-sidebar" style={{
      flex: '0 0 auto', width: 248, alignSelf: 'stretch', display: 'flex', flexDirection: 'column',
      padding: '24px 16px', gap: 4, background: 'rgba(0,68,80,0.22)', borderRight: `1.5px solid ${TC.border}`,
    }}>
      {/* brand */}
      <div className="brand-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 8px 20px' }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: TC.c800, color: TC.lime, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
          <TIcon name="tome/book" size={22} color="currentColor" />
        </div>
        <div className="brand-text" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: TC.fg1, lineHeight: 1 }}>Tome</div>
          <div style={{ fontSize: 11, color: TC.fg3, fontWeight: 600, marginTop: 3 }}>Danish · A1</div>
        </div>
      </div>

      {NAV.map((it) => <NavItem key={it.id} item={it} active={navActive === it.id} onClick={() => onNav(it.id)} />)}

      <div style={{ flex: 1 }} />

      <NavItem item={{ id: 'settings', icon: 'tome/settings', label: 'Settings' }} active={false} onClick={() => {}} />
      {/* level badge */}
      <div className="side-badge" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', marginTop: 8, borderRadius: 14, border: `1.5px solid ${TC.spark}` }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', border: `2.5px solid ${TC.lime}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', background: 'rgba(217,249,157,0.12)' }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: TC.fg1 }}>A1</span>
        </div>
        <div className="nav-label" style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: TC.fg1 }}>Foundation</div>
          <div style={{ fontSize: 11, color: TC.fg3, fontWeight: 600 }}>1 / 12 modules</div>
        </div>
      </div>
    </aside>
  );
}

/* ───────────────────────── SHELL ───────────────────────────────────────── */
function Shell({ page, onNav, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', background: TC.cyan, color: TC.fg2, fontFamily: TC.font, overflow: 'hidden' }}>
      <Sidebar page={page} onNav={onNav} />
      <main className="tome-main" style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}

/* Page header inside main */
function PageHead({ kicker, title, right, back }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 28 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {back}
        {kicker && <Label style={{ marginBottom: 8 }}>{kicker}</Label>}
        <h1 style={{ fontSize: 34, fontWeight: 700, color: TC.fg1, lineHeight: 1.05, margin: 0, letterSpacing: '-0.01em' }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

Object.assign(window, { D_WEEK, D_LEVELS, D_MODULES, panel, sectionLabel, LockGlyph, Sidebar, Shell, PageHead });
