/* Tome Language Learning — the 6 exercise types (module A1·01 "Who Are You?").
   Recognition → production order. Shared session bar + footer. Requires tome-kit.jsx. */

/* Shared exercise shell: session progress on top, body, footer */
function ExShell({ instruction, children, footer, session = { total: 15, mastered: 6, deferred: 1 } }) {
  return (
    <TomeScreen title="Practice">
      <div style={{ padding: '6px 18px 0' }}>
        <SessionBar total={session.total} mastered={session.mastered} deferred={session.deferred} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Label>{instruction}</Label>
          <span style={{ fontSize: 11, fontWeight: 700, color: TC.fg2 }}>{session.mastered + session.deferred + 1} / {session.total}</span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0 18px' }}>{children}</div>
      {footer}
    </TomeScreen>
  );
}

/* Caret-styled fake text input */
function FauxInput({ value, placeholder, focused = true }) {
  return (
    <div style={{ flex: 1, minWidth: 0, background: 'rgba(0,0,0,0.06)', border: `2px solid ${focused ? TC.c600 : 'rgba(9,166,209,0.5)'}`, borderRadius: 12, padding: '12px 15px', fontSize: 16, color: TC.fg1, display: 'flex', alignItems: 'center', minHeight: 48 }}>
      {value ? <span>{value}</span> : <span style={{ color: 'rgba(0,0,0,0.38)' }}>{placeholder}</span>}
      {focused && <span style={{ width: 2, height: 20, background: TC.c800, marginLeft: 2, display: 'inline-block', borderRadius: 2 }} />}
    </div>
  );
}

function SendFooter({ value, placeholder, hint }) {
  return (
    <div style={{ padding: '10px 16px 16px' }}>
      {hint && <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: TC.fg2, border: `1.5px solid ${TC.spark}`, borderRadius: 9999, padding: '6px 12px' }}>
          <TIcon name="tome/magic" size={14} color={TC.c800} /> Hint
        </span>
      </div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <FauxInput value={value} placeholder={placeholder} />
        <RoundButton name="tome/send" size={48} variant="primary" />
      </div>
    </div>
  );
}

function CheckFooter({ enabled = true }) {
  return (
    <div style={{ padding: '10px 16px 16px' }}>
      <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: enabled ? TC.lime : 'rgba(0,0,0,0.08)', color: enabled ? TC.c800 : TC.fg3, fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: 15, cursor: 'pointer', letterSpacing: '0.02em' }}>Check</button>
    </div>
  );
}

function PromptBlock({ kicker, big, sub }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 22 }}>
      {kicker && <Label style={{ marginBottom: 12 }}>{kicker}</Label>}
      <div style={{ fontSize: 30, fontWeight: 700, color: TC.fg1, lineHeight: 1.2 }}>{big}</div>
      {sub && <div style={{ fontSize: 13.5, color: TC.fg2, marginTop: 10 }}>{sub}</div>}
    </div>
  );
}

/* 1 ── Multiple Choice ─────────────────────────── */
function ExMultipleChoice() {
  const opts = [['A', 'er', true], ['B', 'hedder', false], ['C', 'kommer', false], ['D', 'bor', false]];
  return (
    <ExShell instruction="Choose the correct word">
      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <div style={{ fontSize: 27, fontWeight: 700, color: TC.fg1 }}>
          Hun <span style={{ display: 'inline-block', minWidth: 64, borderBottom: `3px solid ${TC.lime}`, margin: '0 4px' }}>&nbsp;</span> læge.
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, marginTop: 12 }}>She is a doctor.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 26 }}>
        {opts.map(([k, w, sel]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14,
            background: sel ? TC.lime : 'transparent', border: sel ? `2px solid ${TC.lime}` : '1.5px solid rgba(9,166,209,0.5)' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
              background: sel ? TC.c800 : 'transparent', color: sel ? TC.lime : TC.fg2, border: sel ? 'none' : '1.5px solid rgba(0,0,0,0.25)' }}>{k}</div>
            <span style={{ fontSize: 17, fontWeight: 600, color: TC.fg1 }}>{w}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
    </ExShell>
  );
}

/* 2 ── Sentence Reorder ─────────────────────────── */
function WordTile({ children, ghost, onAccent }) {
  return (
    <div style={{ padding: '10px 15px', borderRadius: 11, fontSize: 16, fontWeight: 600,
      background: ghost ? 'transparent' : onAccent ? TC.lime : 'rgba(255,255,255,0.5)',
      color: ghost ? 'transparent' : TC.fg1,
      border: ghost ? '1.5px dashed rgba(0,0,0,0.2)' : 'none' }}>{children}</div>
  );
}
function ExReorder() {
  return (
    <ExShell instruction="Arrange the words">
      <PromptBlock kicker="Say in Danish" big="My name is Anna." />
      {/* build area */}
      <div style={{ marginTop: 26, minHeight: 58, borderBottom: `2px solid ${TC.spark}`, display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center', paddingBottom: 12 }}>
        <WordTile>Jeg</WordTile>
        <WordTile>hedder</WordTile>
        <span style={{ width: 50, height: 40, borderRadius: 11, border: '1.5px dashed rgba(0,0,0,0.25)' }} />
      </div>
      <div style={{ flex: 1 }} />
      {/* word bank */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 18 }}>
        <WordTile onAccent>Anna</WordTile>
        <WordTile ghost>Jeg</WordTile>
        <WordTile ghost>hedder</WordTile>
      </div>
      <div style={{ padding: '0 0 4px' }}>
        <CheckFooter enabled={false} />
      </div>
    </ExShell>
  );
}

/* 3 ── Fill in the Blank ─────────────────────────── */
function ExFillBlank() {
  return (
    <ExShell instruction="Complete the sentence">
      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <span>Jeg</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', border: `2px solid ${TC.c600}`, borderRadius: 11, padding: '6px 14px', minWidth: 92, justifyContent: 'center' }}>
            <span style={{ color: TC.fg1 }}>kommer</span>
            <span style={{ width: 2, height: 22, background: TC.c800, marginLeft: 2, borderRadius: 2 }} />
          </span>
          <span>fra Norge.</span>
        </div>
        <div style={{ fontSize: 13.5, color: TC.fg2, marginTop: 16 }}>I come from Norway.</div>
      </div>
      <div style={{ flex: 1 }} />
      <SendFooter value="" placeholder="" hint />
    </ExShell>
  );
}

/* 4 ── Conjugation Drill ─────────────────────────── */
function ExConjugation() {
  return (
    <ExShell instruction="Give the right form">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24, gap: 18 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: `1.5px solid ${TC.spark}`, borderRadius: 9999, padding: '8px 16px' }}>
          <TIcon name="tome/language" size={17} color={TC.c800} />
          <span style={{ fontSize: 17, fontWeight: 700, color: TC.fg1 }}>at hedde</span>
          <span style={{ fontSize: 12.5, color: TC.fg2 }}>to be called</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'center' }}>
            <Label style={{ marginBottom: 6 }}>Subject</Label>
            <div style={{ fontSize: 24, fontWeight: 700, color: TC.fg1 }}>jeg</div>
          </div>
          <TIcon name="tome/point-right" size={22} color={TC.fg3} />
          <div style={{ textAlign: 'center' }}>
            <Label style={{ marginBottom: 6 }}>Present</Label>
            <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', border: `2px solid ${TC.c600}`, borderRadius: 12, padding: '8px 16px', minWidth: 110, justifyContent: 'center' }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: TC.fg1 }}>hedder</span>
              <span style={{ width: 2, height: 24, background: TC.c800, marginLeft: 3, borderRadius: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, textAlign: 'center', marginTop: 4 }}>"My name is…" → <b>Jeg hedder…</b></div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ padding: '10px 16px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <RoundButton name="tome/send" size={52} variant="primary" />
      </div>
    </ExShell>
  );
}

/* 5 ── Error Correction ─────────────────────────── */
function ExErrorCorrection() {
  const words = [['Jeg', false], ['hedde', true], ['Anna', false]];
  return (
    <ExShell instruction="Spot &amp; fix the mistake">
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Label style={{ marginBottom: 16 }}>One word is wrong — tap it</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center' }}>
          {words.map(([w, bad], i) => (
            <span key={i} style={{ position: 'relative', fontSize: 23, fontWeight: 700, color: bad ? TC.red : TC.fg1, padding: '6px 12px', borderRadius: 10,
              background: bad ? 'rgba(185,28,28,0.10)' : 'transparent', border: bad ? `2px solid ${TC.red}` : '2px solid transparent' }}>
              {w}
              {bad && <span style={{ position: 'absolute', left: 8, right: 8, bottom: 2, height: 0, borderBottom: `2px wavy ${TC.red}` }} />}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, marginTop: 16 }}>Meaning: "My name is Anna."</div>
      </div>
      {/* correction */}
      <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Label>Correct it</Label>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', border: `2px solid ${TC.c600}`, borderRadius: 12, padding: '10px 18px', minWidth: 150, justifyContent: 'center' }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: TC.fg1 }}>hedder</span>
          <span style={{ width: 2, height: 22, background: TC.c800, marginLeft: 3, borderRadius: 2 }} />
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <CheckFooter />
    </ExShell>
  );
}

/* 6 ── Translation (active) ─────────────────────────── */
function ExTranslation() {
  return (
    <ExShell instruction="Translate to Danish">
      <PromptBlock kicker="In Danish, say" big="Where are you from?" />
      <div style={{ flex: 1 }} />
      <SendFooter value="Hvor kommer du fra?" placeholder="Type Danish translation…" hint />
    </ExShell>
  );
}

Object.assign(window, { ExShell, ExMultipleChoice, ExReorder, ExFillBlank, ExConjugation, ExErrorCorrection, ExTranslation });
