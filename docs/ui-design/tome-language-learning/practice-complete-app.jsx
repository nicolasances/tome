/* Practice-complete exploration — annotated spec.
   Two screens (A round complete, C coverage milestone), each wrapped in an
   AnnoBoard that pins designer notes around the phone. Requires all screen
   files + annotations.jsx. */

function PCPhone({ children }) {
  return <IOSDevice width={390} height={844}>{children}</IOSDevice>;
}

const SPEC_W = 1180, SPEC_H = 1080;
const SPEC_STYLE = { background: '#f0eee9', boxShadow: '0 22px 48px rgba(0,0,0,0.16)', borderRadius: 14 };

const specBoard = (id, label, screen, when, notes) => (
  <DCArtboard id={id} label={label} width={SPEC_W} height={SPEC_H} style={SPEC_STYLE}>
    <AnnoBoard width={SPEC_W} height={SPEC_H} when={when} notes={notes}
      phone={<PCPhone>{screen}</PCPhone>} />
  </DCArtboard>
);

const NOTES_A = [
  { target: 'ring', top: 250, title: 'Ring %', body: 'Words practised so far ÷ total words in the module.' },
  { target: 'headline', top: 450, title: 'Headline', body: 'Performance-driven — the tone adapts to how well the round went.' },
  { target: 'stats', top: 600, title: 'Round stats', lines: [
    { term: 'Answered', def: 'number of exercises in the round' },
    { term: 'Mastered', def: 'exercises right on the first try' },
    { term: 'Accuracy', def: 'first-try correct ÷ total' },
  ] },
  { target: 'saved', top: 838, title: 'Saving', body: 'No blocking overlay — progress saves quietly in the background.' },
];

const NOTES_C = [
  { target: 'coverage', top: 470, title: 'Coverage', body: 'Fills to 100% — every word in the module has now been practised.' },
  { target: 'unlock', top: 648, title: 'Test gate', body: 'The module test enters its 4-hour spaced-repetition cool-down.' },
  { target: 'saved', top: 836, title: 'Saving', body: 'Same quiet confirmation — no blocking overlay.' },
];

function PCCanvas() {
  return (
    <DesignCanvas>
      <DCSection id="pc" title="Practice round complete"
        subtitle="Shown when the last exercise of a module practice round is answered — replacing the blocking “Saving progress…” overlay. Saving is demoted to a quiet acknowledgement; the foreground becomes a rewarding recap. A is the every-round screen; C replaces it once the module is fully covered. Notes sit around each mock and don't touch the UI itself.">
        {specBoard('pc-a', 'A · Momentum ring — every round (not yet fully covered)', <PCRoundComplete />,
          'A practice round finishes, but not every word in the module has been covered yet.', NOTES_A)}
        {specBoard('pc-c', 'C · Coverage milestone — only when all words are covered', <PCMilestone />,
          'Only once every word in the module is covered. This screen replaces A at that point.', NOTES_C)}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PCCanvas />);
