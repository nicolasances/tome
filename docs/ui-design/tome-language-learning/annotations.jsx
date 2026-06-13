/* Annotation layer for the practice-complete spec.
   Wraps a phone mock and pins designer notes AROUND it (never inside the UI),
   connected by leader lines to invisible [data-anno] anchors in the screen.
   Notes self-measure after the entrance animations settle, so lines stay
   accurate at the canvas's default zoom. Requires React. */

const ANNO_INK = '#4a3f36';
const ANNO_ACCENT = '#c96442';
const ANNO_PAPER = '#fbf8f2';

function AnnoNote({ n, title, lines, body, top, x, w = 360 }) {
  return (
    <div style={{ position: 'absolute', left: x, top, width: w, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ flex: '0 0 auto', width: 26, height: 26, borderRadius: '50%', background: ANNO_ACCENT, color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Comfortaa', sans-serif", marginTop: 1 }}>{n}</span>
      <div style={{ flex: 1, background: ANNO_PAPER, border: '1px solid rgba(74,63,54,0.16)', borderRadius: 12, padding: '13px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: ANNO_ACCENT, marginBottom: body || lines ? 7 : 0 }}>{title}</div>
        {body && <div style={{ fontSize: 14.5, lineHeight: 1.5, color: ANNO_INK, fontFamily: "'Comfortaa', sans-serif" }}>{body}</div>}
        {lines && <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ fontSize: 14, lineHeight: 1.45, color: ANNO_INK, fontFamily: "'Comfortaa', sans-serif" }}>
              <b style={{ color: '#2c2620' }}>{l.term}</b> <span style={{ color: 'rgba(74,63,54,0.55)' }}>·</span> {l.def}
            </div>
          ))}
        </div>}
      </div>
    </div>
  );
}

function AnnoBoard({ width, height, phone, when, notes, phoneX = 64, phoneY = 150, phoneW = 390, phoneH = 844, notesX = 600 }) {
  const ref = React.useRef(null);
  const [ys, setYs] = React.useState({});
  const [ready, setReady] = React.useState(false);

  const measure = React.useCallback(() => {
    const board = ref.current; if (!board) return;
    const br = board.getBoundingClientRect();
    const scale = br.width / width || 1;
    const out = {};
    notes.forEach((nt) => {
      const el = board.querySelector(`[data-anno="${nt.target}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      out[nt.target] = (r.top + r.height / 2 - br.top) / scale;
    });
    setYs(out); setReady(true);
  }, [notes, width]);

  React.useLayoutEffect(() => {
    const t1 = setTimeout(measure, 1050);
    const t2 = setTimeout(measure, 1700);
    window.addEventListener('resize', measure);
    return () => { clearTimeout(t1); clearTimeout(t2); window.removeEventListener('resize', measure); };
  }, [measure]);

  const markerX = phoneX + phoneW - 16;

  return (
    <div ref={ref} style={{ position: 'relative', width, height, fontFamily: "'Comfortaa','Poppins',system-ui,sans-serif", background: '#f0eee9' }}>
      {/* WHEN-shown trigger banner */}
      <div style={{ position: 'absolute', left: phoneX, top: 34, width: (notesX + 360) - phoneX, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(201,100,66,0.10)', border: '1px solid rgba(201,100,66,0.30)', borderRadius: 14, padding: '14px 18px' }}>
        <span style={{ flex: '0 0 auto', fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff', background: ANNO_ACCENT, borderRadius: 7, padding: '6px 11px' }}>When shown</span>
        <span style={{ fontSize: 15.5, lineHeight: 1.45, color: ANNO_INK, fontWeight: 500 }}>{when}</span>
      </div>

      {/* the phone mock */}
      <div data-anno-phone style={{ position: 'absolute', left: phoneX, top: phoneY, width: phoneW, height: phoneH }}>{phone}</div>

      {/* leader lines + markers */}
      <svg viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0, width, height, pointerEvents: 'none', opacity: ready ? 1 : 0, transition: 'opacity .45s ease' }}>
        {notes.map((nt) => {
          const ay = ys[nt.target]; if (ay == null) return null;
          const py = phoneY + ay;
          const ny = nt.top + 14;
          const midX = (markerX + notesX) / 2;
          return (
            <g key={nt.target}>
              <path d={`M ${markerX} ${py} C ${midX} ${py}, ${midX} ${ny}, ${notesX - 2} ${ny}`} fill="none" stroke="rgba(74,63,54,0.40)" strokeWidth="1.5" strokeDasharray="2 4" strokeLinecap="round" />
              <circle cx={markerX} cy={py} r="5.5" fill={ANNO_ACCENT} />
              <circle cx={markerX} cy={py} r="10" fill="none" stroke={ANNO_ACCENT} strokeWidth="1.2" opacity="0.4" />
            </g>
          );
        })}
      </svg>

      {/* notes */}
      {notes.map((nt, i) => (
        <AnnoNote key={nt.target} n={i + 1} title={nt.title} body={nt.body} lines={nt.lines} top={nt.top} x={notesX} />
      ))}
    </div>
  );
}

Object.assign(window, { AnnoBoard, AnnoNote });
