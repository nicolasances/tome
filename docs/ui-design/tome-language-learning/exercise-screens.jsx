/* Tome Language Learning — the 6 exercise types (module A1·01 "Who Are You?").
   Recognition → production order. Each exercise accepts state:
     'idle'    — the question
     'correct' — solved (confirm + advance)
     'wrong'   — production types: reveal answer + Continue (+ Explain / AI)
     'retry'   — MC & reorder only: mark the bad pick/order red, keep waiting (no reveal)
   Every exercise updates mastery — in practice and in the test (spec §3.1.1). Requires tome-kit.jsx. */

/* Shared exercise shell: session progress on top, body, optional bottom feedback */
function ExShell({ instruction, children, title = 'Who Are You?', session = { total: 20, mastered: 6, deferred: 1 } }) {
  return (
    <TomeScreen title={title}>
      <div style={{ padding: '6px 18px 0' }}>
        <SessionBar total={session.total} mastered={session.mastered} deferred={session.deferred} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Label>{instruction}</Label>
          <span style={{ fontSize: 11, fontWeight: 700, color: TC.fg2 }}>{session.mastered + session.deferred + 1} / {session.total}</span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '0 18px' }}>{children}</div>
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

/* ── Verdict badge, action button, answered-text box ─────────────────── */
function Verdict({ ok, size = 34, noBg = TC.red, noFg = '#fff', mark }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: ok ? TC.limeBright : noBg, color: ok ? TC.c800 : noFg, fontSize: size * 0.5, fontWeight: 800, lineHeight: 1 }}>
      {mark || (ok ? '✓' : '✕')}
    </div>
  );
}

function SheetBtn({ icon, label, light }) {
  return (
    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.5px solid ${light ? 'rgba(236,254,255,0.5)' : TC.c700}`, background: 'transparent', color: light ? TC.onDark : TC.fg1, borderRadius: 9999, padding: '9px 14px', fontFamily: 'inherit', fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}>
      <TIcon name={icon} size={15} color={light ? TC.onDark : TC.c800} />{label}
    </button>
  );
}

function ContinueBtn({ label = 'Continue', bg, color }) {
  return (
    <button style={{ width: '100%', border: 'none', borderRadius: 9999, background: bg || TC.c800, color: color || TC.lime, fontFamily: 'inherit', fontWeight: 700, fontSize: 15, padding: 14, cursor: 'pointer', letterSpacing: '0.02em' }}>{label}</button>
  );
}

/* Answered text box (post-submit), colored by correctness.
   `block` lets it grow full-width and wrap for long sentences (C1/C2 answers).
   noEdge/noFg/noTint override the incorrect coloring (default red). */
function AnswerBox({ text, ok, strike, big, block, noEdge = TC.red, noFg = TC.red, noTint = 'rgba(185,28,28,0.10)' }) {
  const edge = ok ? TC.limeBright : noEdge;
  return (
    <div style={{ display: block ? 'flex' : 'inline-flex', alignItems: block ? 'flex-start' : 'center', gap: 9, background: ok ? 'rgba(190,242,100,0.22)' : noTint, border: `2px solid ${edge}`, borderRadius: 12, padding: big ? '10px 18px' : '8px 15px', justifyContent: 'center', maxWidth: '100%' }}>
      <span style={{ fontSize: big ? 22 : 18, fontWeight: 700, color: ok ? TC.fg1 : noFg, textDecoration: strike ? 'line-through' : 'none', whiteSpace: block ? 'normal' : 'nowrap', wordBreak: 'break-word', textWrap: 'pretty', flex: block ? 1 : '0 1 auto', textAlign: block ? 'left' : 'center', lineHeight: block ? 1.4 : 1.2 }}>{text}</span>
      <span style={{ fontSize: big ? 16 : 14, fontWeight: 800, color: ok ? TC.c800 : noFg, flexShrink: 0, marginTop: block ? 3 : 0 }}>{ok ? '✓' : '✕'}</span>
    </div>
  );
}

/* Inline "keep trying" hint for MC / reorder */
function RetryHint({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 18 }}>
      <Verdict ok={false} size={20} />
      <span style={{ fontSize: 13, fontWeight: 600, color: TC.red }}>{children}</span>
    </div>
  );
}

/* DEFAULT feedback region — elevated deep tray (the chosen "Tray" style),
   pinned to the bottom of the screen as a bottom sheet so it overlays content
   and Continue is always reachable.
   • Correct: just the verdict + Continue. No sentence is revealed.
   • Incorrect: reveals the answer. A long answer truncates to 2 lines; the user
     opens the rest by tapping the answer or dragging the handle up. When the
     answer is very long the expanded text scrolls inside the sheet. */
function ResultSheet({ ok, answer, aiVerify }) {
  const [expanded, setExpanded] = React.useState(false);
  const [canExpand, setCanExpand] = React.useState(false);
  const ansRef = React.useRef(null);

  React.useLayoutEffect(() => { setExpanded(false); }, [answer, ok]);
  React.useLayoutEffect(() => {
    if (expanded) return;            // keep the measured value while open
    const el = ansRef.current;
    if (el) setCanExpand(el.scrollHeight - 2 > el.clientHeight);
  }, [answer, ok, expanded]);

  const startDrag = (e) => {
    if (ok || !canExpand) return;
    const y0 = e.clientY;
    const move = (ev) => {
      const dy = y0 - ev.clientY;
      if (dy > 18) setExpanded(true);
      else if (dy < -18) setExpanded(false);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const toggle = () => { if (!ok && canExpand) setExpanded((v) => !v); };

  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: 'calc(100% - 84px)', background: TC.c900, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '8px 18px 22px', display: 'flex', flexDirection: 'column', gap: 12, color: TC.onDark, boxSizing: 'border-box' }}>
      <div onPointerDown={startDrag} onClick={toggle} style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', padding: '4px 0 2px', cursor: !ok && canExpand ? 'grab' : 'default', touchAction: 'none' }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(236,254,255,0.35)' }} />
      </div>
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Verdict ok={ok} size={32} />
        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{ok ? 'Correct!' : 'Not quite'}</div>
      </div>
      {!ok && answer && (
        <div onClick={toggle} style={{ flex: '0 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', cursor: canExpand ? 'pointer' : 'default' }}>
          <div style={{ flex: '0 0 auto', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: TC.c200, marginBottom: 4 }}>Answer</div>
          <div ref={ansRef} style={{ flex: '0 1 auto', minHeight: 0, fontSize: 14.5, fontWeight: 700, color: TC.limeBright, lineHeight: 1.4, textWrap: 'pretty', wordBreak: 'break-word',
            ...(expanded
              ? { overflowY: 'auto' }
              : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }) }}>{answer}</div>
          {canExpand && (
            <div style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7, fontSize: 11.5, fontWeight: 600, color: TC.c200 }}>
              {expanded ? 'Show less' : 'Show more'}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}><path d="M3 4.5L6 7.5L9 4.5" /></svg>
            </div>
          )}
        </div>
      )}
      {!ok && (
        <div style={{ flex: '0 0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <SheetBtn icon="tome/magic" label="Explain my mistake" light />
          {aiVerify && <SheetBtn icon="tome/teacher" label="Check with AI" light />}
        </div>
      )}
      <ContinueBtn bg={TC.limeBright} color={TC.c900} />
    </div>
  );
}

/* 1 ── Multiple Choice — incorrect = keep trying (no reveal) ───────── */
function ExMultipleChoice({ state = 'idle' }) {
  const opts = [['A', 'er'], ['B', 'hedder'], ['C', 'kommer'], ['D', 'bor']];
  const correctKey = 'A', chosenWrong = 'B';
  const solved = state === 'correct', retry = state === 'retry';
  return (
    <ExShell instruction="Choose the correct word">
      <div style={{ textAlign: 'center', marginTop: 26 }}>
        <div style={{ fontSize: 27, fontWeight: 700, color: TC.fg1 }}>
          Hun <span style={{ display: 'inline-block', minWidth: 64, borderBottom: `3px solid ${solved ? TC.limeBright : TC.lime}`, margin: '0 4px' }}>{solved ? 'er' : '\u00a0'}</span> læge.
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, marginTop: 12 }}>She is a doctor.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        {opts.map(([k, w]) => {
          const isCorrect = k === correctKey;
          const isChosenWrong = retry && k === chosenWrong;
          const preSelected = state === 'idle' && isCorrect;
          let bg = 'transparent', bd = '1.5px solid rgba(9,166,209,0.5)', badge = null, fill = false;
          if (preSelected) { bg = TC.lime; bd = `2px solid ${TC.lime}`; fill = true; }
          if ((solved || retry) && isCorrect) { bg = 'rgba(190,242,100,0.30)'; bd = `2px solid ${TC.limeBright}`; badge = <span style={{ color: TC.c800, fontWeight: 800 }}>✓</span>; fill = true; }
          if (isChosenWrong) { bg = 'rgba(185,28,28,0.10)'; bd = `2px solid ${TC.red}`; badge = <span style={{ color: TC.red, fontWeight: 800 }}>✕</span>; }
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, background: bg, border: bd, opacity: isChosenWrong ? 0.92 : 1 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: fill ? TC.c800 : 'transparent', color: fill ? TC.lime : TC.fg2, border: fill ? 'none' : '1.5px solid rgba(0,0,0,0.25)' }}>{k}</div>
              <span style={{ fontSize: 17, fontWeight: 600, color: TC.fg1, flex: 1 }}>{w}</span>
              {badge}
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      {solved && <ResultSheet ok answer="er — “is” (at være)" />}
      {retry && <ResultSheet ok={false} answer="er" />}
    </ExShell>
  );
}

/* 2 ── Sentence Reorder — incorrect = keep trying (no reveal) ──────── */
function WordTile({ children, ghost, onAccent, tone }) {
  let bg = 'rgba(255,255,255,0.5)', col = TC.fg1, bd = 'none';
  if (ghost) { bg = 'transparent'; col = 'transparent'; bd = '1.5px dashed rgba(0,0,0,0.2)'; }
  else if (onAccent) bg = TC.lime;
  else if (tone === 'correct') { bg = 'rgba(190,242,100,0.30)'; bd = `1.5px solid ${TC.limeBright}`; }
  else if (tone === 'wrong') { bg = 'rgba(185,28,28,0.10)'; col = TC.red; bd = `1.5px solid ${TC.red}`; }
  return (
    <div style={{ padding: '10px 15px', borderRadius: 11, fontSize: 16, fontWeight: 600, background: bg, color: col, border: bd === 'none' ? 'none' : bd }}>{children}</div>
  );
}
function ExReorder({ state = 'idle' }) {
  const solved = state === 'correct', retry = state === 'retry';
  return (
    <ExShell instruction="Arrange the words">
      <PromptBlock kicker="Say in Danish" big="My name is Anna." />
      <div style={{ marginTop: 24, minHeight: 58, borderBottom: `2px solid ${retry ? TC.red : TC.spark}`, display: 'flex', flexWrap: 'wrap', gap: 9, alignItems: 'center', paddingBottom: 12 }}>
        {state === 'idle' && <React.Fragment>
          <WordTile>Jeg</WordTile><WordTile>hedder</WordTile>
          <span style={{ width: 50, height: 40, borderRadius: 11, border: '1.5px dashed rgba(0,0,0,0.25)' }} />
        </React.Fragment>}
        {solved && <React.Fragment>
          <WordTile tone="correct">Jeg</WordTile><WordTile tone="correct">hedder</WordTile><WordTile tone="correct">Anna</WordTile>
        </React.Fragment>}
        {retry && <React.Fragment>
          <WordTile tone="wrong">Jeg</WordTile><WordTile tone="wrong">Anna</WordTile><WordTile tone="wrong">hedder</WordTile>
        </React.Fragment>}
      </div>
      <div style={{ flex: 1 }} />
      {state === 'idle' && <React.Fragment>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 18 }}>
          <WordTile onAccent>Anna</WordTile><WordTile ghost>Jeg</WordTile><WordTile ghost>hedder</WordTile>
        </div>
        <div style={{ padding: '0 0 4px' }}><CheckFooter enabled={false} /></div>
      </React.Fragment>}
      {retry && <ResultSheet ok={false} answer="Jeg hedder Anna" />}
      {solved && <ResultSheet ok answer="Jeg hedder Anna" />}
    </ExShell>
  );
}

/* 3 ── Fill in the Blank ─────────────────────────── */
function ExFillBlank({ state = 'idle' }) {
  const typed = state === 'wrong' ? 'kommor' : 'kommer';
  return (
    <ExShell instruction="Complete the sentence">
      <div style={{ textAlign: 'center', marginTop: 30 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: TC.fg1, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <span>Jeg</span>
          {state === 'idle'
            ? <span style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', border: `2px solid ${TC.c600}`, borderRadius: 11, padding: '6px 14px', minWidth: 92, justifyContent: 'center' }}>
                <span style={{ color: TC.fg1 }}>kommer</span><span style={{ width: 2, height: 22, background: TC.c800, marginLeft: 2, borderRadius: 2 }} />
              </span>
            : <AnswerBox text={typed} ok={state === 'correct'} strike={state === 'wrong'} />}
          <span>fra Norge.</span>
        </div>
        <div style={{ fontSize: 13.5, color: TC.fg2, marginTop: 16 }}>I come from Norway.</div>
      </div>
      <div style={{ flex: 1 }} />
      {state === 'idle'
        ? <SendFooter value="" placeholder="" hint />
        : <ResultSheet ok={state === 'correct'} answer="kommer" translation="“kommer fra” = come from" />}
    </ExShell>
  );
}

/* 4 ── Conjugation Drill ─────────────────────────── */
function ExConjugation({ state = 'idle' }) {
  const typed = state === 'wrong' ? 'heder' : 'hedder';
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
            {state === 'idle'
              ? <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', border: `2px solid ${TC.c600}`, borderRadius: 12, padding: '8px 16px', minWidth: 110, justifyContent: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: TC.fg1 }}>hedder</span><span style={{ width: 2, height: 24, background: TC.c800, marginLeft: 3, borderRadius: 2 }} />
                </div>
              : <AnswerBox text={typed} ok={state === 'correct'} strike={state === 'wrong'} big />}
          </div>
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, textAlign: 'center', marginTop: 4 }}>"My name is…" → <b>Jeg hedder…</b></div>
      </div>
      <div style={{ flex: 1 }} />
      {state === 'idle'
        ? <div style={{ padding: '10px 16px 16px', display: 'flex', justifyContent: 'flex-end' }}><RoundButton name="tome/send" size={52} variant="primary" /></div>
        : <ResultSheet ok={state === 'correct'} answer="hedder" translation="regular -er present tense" />}
    </ExShell>
  );
}

/* 5 ── Error Correction ─────────────────────────── */
function ExErrorCorrection({ state = 'idle' }) {
  const typed = state === 'wrong' ? 'hedde' : 'hedder';
  return (
    <ExShell instruction="Spot &amp; fix the mistake">
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Label style={{ marginBottom: 16 }}>{state === 'idle' ? 'One word is wrong — tap it' : 'The sentence'}</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center' }}>
          {[['Jeg', false], ['hedde', true], ['Anna', false]].map(([w, bad], i) => {
            const fixed = state === 'correct' && bad;
            return (
              <span key={i} style={{ position: 'relative', fontSize: 23, fontWeight: 700, padding: '6px 12px', borderRadius: 10,
                color: fixed ? TC.fg1 : bad ? TC.red : TC.fg1,
                background: fixed ? 'rgba(190,242,100,0.30)' : bad ? 'rgba(185,28,28,0.10)' : 'transparent',
                border: fixed ? `2px solid ${TC.limeBright}` : bad ? `2px solid ${TC.red}` : '2px solid transparent' }}>
                {fixed ? 'hedder' : w}
              </span>
            );
          })}
        </div>
        <div style={{ fontSize: 13, color: TC.fg2, marginTop: 16 }}>Meaning: "My name is Anna."</div>
      </div>
      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <Label>{state === 'idle' ? 'Correct it' : 'Your correction'}</Label>
        {state === 'idle'
          ? <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(0,0,0,0.06)', border: `2px solid ${TC.c600}`, borderRadius: 12, padding: '10px 18px', minWidth: 150, justifyContent: 'center' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: TC.fg1 }}>hedder</span><span style={{ width: 2, height: 22, background: TC.c800, marginLeft: 3, borderRadius: 2 }} />
            </div>
          : <AnswerBox text={typed} ok={state === 'correct'} strike={state === 'wrong'} big />}
      </div>
      <div style={{ flex: 1 }} />
      {state === 'idle'
        ? <CheckFooter />
        : <ResultSheet ok={state === 'correct'} answer="hedde → hedder" />}
    </ExShell>
  );
}

/* 6 ── Translation (active) ─────────────────────────── */
function ExTranslation({ state = 'idle', long }) {
  const prompt = long ? 'Where do you come from originally, and how long have you been living here in Denmark, if you don\u2019t mind me asking?' : 'Where are you from?';
  const correctAns = long ? 'Hvor kommer du oprindeligt fra, og hvor længe har du egentlig boet her i Danmark, hvis jeg må spørge?' : 'Hvor kommer du fra?';
  const typed = state === 'wrong'
    ? (long ? 'Hvor du kommer fra oprindelig, og hvor lang tid har du boet her i Danmark nu, hvis jeg spørger?' : 'Hvor er du fra?')
    : correctAns;
  return (
    <ExShell instruction="Translate to Danish">
      <PromptBlock kicker="In Danish, say" big={prompt} />
      {state !== 'idle' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <AnswerBox text={typed} ok={state === 'correct'} big block={long} />
        </div>
      )}
      <div style={{ flex: 1 }} />
      {state === 'idle'
        ? <SendFooter value={correctAns} placeholder="Type Danish translation…" hint />
        : <ResultSheet ok={state === 'correct'} answer={correctAns} aiVerify={state === 'wrong'} />}
    </ExShell>
  );
}

Object.assign(window, {
  ExShell, FauxInput, SendFooter, CheckFooter, PromptBlock,
  Verdict, SheetBtn, ContinueBtn, AnswerBox, ResultSheet,
  ExMultipleChoice, ExReorder, ExFillBlank, ExConjugation, ExErrorCorrection, ExTranslation,
});
