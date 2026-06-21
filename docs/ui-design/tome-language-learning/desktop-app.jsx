/* Tome Language Learning — DESKTOP app: routing + Tweaks.
   Tweaks mutate the shared TC token object and re-render (accent · flood · type).
   Requires tome-kit.jsx, desktop-screens.jsx, desktop-home/map/flow.jsx, tweaks-panel.jsx. */

const D_ACCENTS = {
  Lime: ['#d9f99d', '#bef264'], Sky: ['#bae6fd', '#7dd3fc'], Coral: ['#fed7aa', '#fdba74'],
  Rose: ['#fecdd3', '#fda4af'], Violet: ['#ddd6fe', '#c4b5fd'],
};
const D_ACCENT_OPTS = Object.values(D_ACCENTS);
const D_FLOODS = { Lagoon: '#00acc1', Spring: '#1fc8de', Ocean: '#0891b2', Deep: '#0e7490' };
const D_FLOOD_OPTS = Object.values(D_FLOODS);
const D_FONTS = {
  Rounded: "'Comfortaa', system-ui, sans-serif",
  Modern: "'Poppins', system-ui, sans-serif",
  System: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

function applyDesktopTheme(t) {
  const acc = t.accent || D_ACCENTS.Lime;
  TC.lime = acc[0]; TC.limeBright = acc[1]; TC.lime300 = acc[1];
  TC.cyan = t.flood || D_FLOODS.Lagoon;
  TC.font = D_FONTS[t.fontPersona] || D_FONTS.Rounded;
}

const D_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#d9f99d", "#bef264"],
  "flood": "#00acc1",
  "fontPersona": "Rounded"
}/*EDITMODE-END*/;

function DesktopRoot() {
  const [t, setTweak] = useTweaks(D_TWEAK_DEFAULTS);
  applyDesktopTheme(t);

  const [page, setPage] = React.useState('home');
  const mainRef = React.useRef(null);

  const go = (p) => { setPage(p); if (mainRef.current) mainRef.current.scrollTop = 0; };
  const openModule = () => go('flow');

  let body;
  if (page === 'map') body = <ModuleMap onOpenModule={openModule} />;
  else if (page === 'flow') body = <ModuleFlow onBack={() => go('map')} />;
  else if (page === 'home') body = <HomeDashboard onOpenModule={openModule} onOpenMap={() => go('map')} />;
  else body = <Placeholder page={page} />;

  return (
    <React.Fragment>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', background: TC.cyan, color: TC.fg2, fontFamily: TC.font, overflow: 'hidden' }}>
        <Sidebar page={page} onNav={go} />
        <main ref={mainRef} className="tome-main" style={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {body}
        </main>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent spark" />
        <TweakColor label="Accent" value={t.accent} options={D_ACCENT_OPTS} onChange={(v) => setTweak('accent', v)} />
        <TweakSection label="Atmosphere" />
        <TweakColor label="Flood" value={t.flood} options={D_FLOOD_OPTS} onChange={(v) => setTweak('flood', v)} />
        <TweakSection label="Type personality" />
        <TweakRadio label="Typeface" value={t.fontPersona} options={['Rounded', 'Modern', 'System']} onChange={(v) => setTweak('fontPersona', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

/* Decorative nav targets (Analyze · Knowledge · Sources) — not part of the brief. */
function Placeholder({ page }) {
  const titles = { analyze: 'Analyze', knowledge: 'Knowledge Base', sources: 'Sources' };
  return (
    <div style={pageWrap}>
      <PageHead kicker="Coming soon" title={titles[page] || 'Soon'} />
      <div style={{ ...panel({ padding: '40px' }), display: 'flex', alignItems: 'center', gap: 16, color: TC.fg2 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${TC.c600}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TIcon name="tome/magic" size={22} color={TC.fg2} />
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5 }}>This area isn't part of this design pass. Head back to <b>Home</b> or <b>Modules</b>.</div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<DesktopRoot />);
