export type StepState = 'available' | 'upcoming' | 'locked' | 'completed';

export interface StepItem {
    number: number;
    title: string;
    subtitle: string;
    state: StepState;
    lockLabel?: string;
}

function StepMedallion({ number, state }: { number: number; state: StepState }) {
    const isLime = state === 'available' || state === 'completed';

    return (
        <div
            style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 700,
                background: isLime ? '#d9f99d' : 'transparent',
                border: isLime
                    ? 'none'
                    : state === 'locked'
                    ? '2px solid rgba(0,0,0,0.18)'
                    : '2px solid #0891b2',
                color: state === 'locked' ? 'rgba(0,0,0,0.50)' : '#155e75',
            }}
        >
            {state === 'completed' ? '✓' : number}
        </div>
    );
}

function LockTag({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                borderRadius: 9999,
                border: '1px solid rgba(0,0,0,0.25)',
                padding: '3px 9px',
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(0,0,0,0.50)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
            }}
        >
            {children}
        </span>
    );
}

function StepRow({ step }: { step: StepItem }) {
    const { state, number, title, subtitle, lockLabel } = step;
    const isAvailable = state === 'available';
    const isLocked = state === 'locked';

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '13px 14px',
                borderRadius: 14,
                background: isAvailable ? 'rgba(14,116,144,0.32)' : 'transparent',
                border: isAvailable ? 'none' : '1px solid rgba(9,166,209,0.4)',
                opacity: isLocked ? 0.85 : 1,
            }}
        >
            <StepMedallion number={number} state={state} />
            <div className="flex flex-col flex-1 min-w-0">
                <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.80)' }}>
                    {title}
                </span>
                <span style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.70)', marginTop: 2 }}>
                    {subtitle}
                </span>
            </div>
            {isAvailable && (
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.10em',
                        textTransform: 'uppercase',
                        color: '#164e63',
                        flexShrink: 0,
                    }}
                >
                    Start
                </span>
            )}
            {isLocked && lockLabel && <LockTag>{lockLabel}</LockTag>}
        </div>
    );
}

export function StepList({ steps }: { steps: StepItem[] }) {
    return (
        <div className="flex flex-col gap-[10px]">
            {steps.map((step) => (
                <StepRow key={step.number} step={step} />
            ))}
        </div>
    );
}
