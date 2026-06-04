/* Tome Language Learning — shared kit (primitives + screen shell).
   Visual language: Toto/Tome design system — full-bleed cyan, Comfortaa,
   lime accent, round icon-buttons, hairline borders, NO shadows.
   Requires React + assets/icons.js (window.TOTO_ICONS). */

const TC = {
  cyan: '#00acc1', card: '#00dffa', deep: '#004450', spark: '#5ddef4',
  c50: '#ecfeff', c100: '#cffafe', c200: '#a5f3fc', c300: '#67e8f9',
  c400: '#22d3ee', c500: '#06b6d4', c600: '#0891b2', c700: '#0e7490',
  c800: '#155e75', c900: '#164e63',
  lime: '#d9f99d', limeBright: '#bef264', lime300: '#bef264',
  green: '#15803d', red: '#b91c1c',
  fg1: 'rgba(0,0,0,0.80)', fg2: 'rgba(0,0,0,0.70)', fg3: 'rgba(0,0,0,0.50)',
  onDark: '#ecfeff',
  font: "'Comfortaa','Poppins',system-ui,sans-serif",
};

function TIcon({ name, color = 'currentColor', size = 24 }) {
  const svg = (window.TOTO_ICONS && window.TOTO_ICONS[name]) || '';
  return <span style={{ display: 'inline-flex', width: size, height: size, color, flex: '0 0 auto' }}
    dangerouslySetInnerHTML={{ __html: svg }} />;
}

/* RoundButton — Tome variants: primary(lime ring) | filled(lime) | secondary(none) | menu(cyan ring) */
function RoundButton({ name, onClick, size = 48, variant = 'primary', glyph, flip, label }) {
  const g = glyph || Math.round(size * 0.42);
  let border = 'none', bg = 'transparent';
  let color = variant === 'primary' ? TC.lime : TC.c800;
  if (variant === 'primary') border = `2px solid ${TC.lime}`;
  else if (variant === 'filled') { border = `2px solid ${TC.lime}`; bg = TC.lime; color = TC.c800; }
  else if (variant === 'menu') border = `2px solid ${TC.c600}`;
  else if (variant === 'deep') { border = `2px solid ${TC.c800}`; bg = TC.c800; color = TC.lime; }
  const btn = (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%', border, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: '0 0 auto',
    }}>
      <span style={{ display: 'inline-flex', transform: flip ? 'rotate(180deg)' : 'none' }}>
        <TIcon name={name} color="currentColor" size={g} /></span>
    </div>
  );
  if (!label) return btn;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      {btn}
      <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: TC.fg2, fontWeight: 600 }}>{label}</span>
    </div>
  );
}

/* Screen shell — full-bleed cyan inside the iOS bezel. Clears status bar.
   header: back · centered title · menu */
function TomeScreen({ title, children, menu = true, bg = TC.cyan, footer }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg, color: TC.fg2,
      fontFamily: TC.font, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '56px 16px 6px', flex: '0 0 auto' }}>
        <div style={{ flex: 1, display: 'flex' }}>
          <RoundButton name="tome/point-right" size={34} variant="secondary" glyph={17} flip />
        </div>
        <div style={{ fontSize: 17, color: TC.fg1, fontWeight: 500, letterSpacing: '0.01em' }}>{title}</div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {menu && <RoundButton name="tome/menu" size={34} variant="secondary" glyph={18} />}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>{children}</div>
      {footer}
    </div>
  );
}

/* Micro label — uppercase wide-tracked */
function Label({ children, color = TC.fg3, style }) {
  return <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color, ...style }}>{children}</div>;
}

/* Mastery / level ring — lime sweep on cyan-600 track */
function Ring({ size = 150, stroke = 12, pct = 0.2, track = TC.c600, fill = TC.limeBright, center, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={fill} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        {center}
        {sub}
      </div>
    </div>
  );
}

/* Thin progress bar — lime fill on translucent track */
function Bar({ pct = 0.3, h = 8, track = 'rgba(0,0,0,0.12)', fill = TC.limeBright }) {
  return (
    <div style={{ width: '100%', height: h, borderRadius: 9999, background: track, overflow: 'hidden' }}>
      <div style={{ width: (pct * 100) + '%', height: '100%', borderRadius: 9999, background: fill }} />
    </div>
  );
}

/* Session progress pill (cyan-400 outline, segmented) */
function SessionBar({ total, mastered, deferred }) {
  const remaining = Math.max(0, total - mastered - deferred);
  const pc = (n) => total > 0 ? (n / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', width: '100%', borderRadius: 9999, border: `2px solid ${TC.c400}`, padding: 4 }}>
      <div style={{ display: 'flex', flex: 1, height: 12, overflow: 'hidden', borderRadius: 9999 }}>
        <div style={{ width: pc(mastered) + '%', background: TC.green }} />
        <div style={{ width: pc(remaining) + '%', background: 'rgba(255,255,255,0.35)' }} />
        <div style={{ width: pc(deferred) + '%', background: TC.limeBright }} />
      </div>
    </div>
  );
}

/* Weekly stats — bars rise from baseline (d3-style reveal feel) */
function WeeklyStats({ days, height = 132 }) {
  const max = Math.max(...days.map(d => d.count), 1);
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 9, height }}>
        {days.map((d, i) => {
          const h = Math.max((d.count / max) * (height - 26), d.count ? 8 : 2);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ width: '100%', background: TC.c800, borderRadius: 3, position: 'relative', height: h, minHeight: 2 }}>
                {d.count > 0 && <div style={{ position: 'absolute', top: 4, left: 0, right: 0, textAlign: 'center', fontSize: 10, fontWeight: 700, color: TC.c200 }}>{d.count}</div>}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 7 }}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Step chips for module flow (1 Grammar · 2 Practice · 3 Test) */
function StepDots({ steps, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
      {steps.map((s, i) => {
        const done = s.state === 'done', cur = i === active, locked = s.state === 'locked';
        const bg = done ? TC.limeBright : cur ? 'rgba(255,255,255,0.95)' : 'transparent';
        const bd = done ? TC.limeBright : cur ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.25)';
        const col = (done || cur) ? TC.c800 : TC.fg3;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${bd}`, background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                {done ? '✓' : locked ? <TIcon name="tome/pause" size={9} color={TC.fg3} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: cur ? TC.fg1 : TC.fg3, letterSpacing: '0.04em' }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div style={{ width: 14, height: 2, borderRadius: 2, background: 'rgba(0,0,0,0.18)' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* Lock glyph chip */
function LockTag({ children, color = TC.fg3 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color }}>
      <svg width="11" height="13" viewBox="0 0 11 13" fill="none"><rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke={color} strokeWidth="1.4" /><path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke={color} strokeWidth="1.4" /></svg>
      <span style={{ fontSize: 11, fontWeight: 600 }}>{children}</span>
    </div>
  );
}

Object.assign(window, { TC, TIcon, RoundButton, TomeScreen, Label, Ring, Bar, SessionBar, WeeklyStats, StepDots, LockTag });
