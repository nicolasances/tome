import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

export type StepState = 'available' | 'upcoming' | 'locked' | 'completed';

export interface StepItem {
    number: number;
    title: string;
    subtitle: string;
    state: StepState;
    lockLabel?: string;
    coverage?: { seen: number; total: number };
    onNavigate?: () => void;
}

function StepMedallion({number, state}: {number: number, state: StepState}) {
    const isLime = state === 'available' || state === 'completed';

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-bold ${isLime ? 'bg-lime-200' : 'bg-transparent'} ${isLime ? '' : state === 'locked' ? 'border-2 border-black/20' : 'border-2 border-cyan-600'} ${state === 'locked' ? 'text-black/50' : 'text-cyan-800'}`}>
            {state === 'completed' ? <MaskedSvgIcon src='/images/tick.svg' alt='Completed' /> : number}
        </div>
    );
}

function LockTag({children}: {children: React.ReactNode}) {
    return (
        <span className="flex items-center gap-[5px] text-[11px] font-semibold text-black/50 whitespace-nowrap flex-shrink-0">
            <MaskedSvgIcon src='/images/padlock.svg' alt='Locked' size="w-3 h-3" color="bg-black/50" />
            {children}
        </span>
    );
}

function CoverageBar({seen, total}: {seen: number; total: number}) {
    const pct = total > 0 ? (seen / total) * 100 : 0;

    return (
        <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1.5 rounded-full bg-black/10">
                <div className="h-full rounded-full bg-lime-200" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-bold text-black/80 whitespace-nowrap">
                {seen} / {total} <span className="font-semibold text-black/60">words</span>
            </span>
        </div>
    );
}

function StepRow({step}: {step: StepItem}) {
    const { state, number, title, subtitle, lockLabel, coverage, onNavigate } = step;
    const isAvailable = state === 'available';
    const isLocked = state === 'locked';
    const isClickable = isAvailable && !!onNavigate;

    return (
        <div
            onClick={isClickable ? onNavigate : undefined}
            className={`flex ${coverage ? 'items-start' : 'items-center'} gap-[13px] px-[14px] py-[13px] rounded-[14px] ${isAvailable ? 'bg-cyan-700/30' : 'bg-transparent'} ${isAvailable ? '' : 'border border-[rgba(9,166,209,0.4)]'} ${isLocked ? 'opacity-[0.85]' : ''} ${isClickable ? 'cursor-pointer' : ''}`}>
            <StepMedallion number={number} state={state} />
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[15px] font-bold text-black/80">{title}</span>
                <span className="text-xs text-black/70 mt-[2px]">{subtitle}</span>
                {coverage && <CoverageBar seen={coverage.seen} total={coverage.total} />}
            </div>
            {isAvailable && (
                <span className="text-[11px] font-bold tracking-[0.10em] uppercase text-cyan-900 flex-shrink-0">
                    Start
                </span>
            )}
            {lockLabel && <LockTag>{lockLabel}</LockTag>}
        </div>
    );
}

export function StepList({steps}: {steps: StepItem[]}) {
    return (
        <div className="flex flex-col gap-1">
            {steps.map((step) => (
                <StepRow key={step.number} step={step} />
            ))}
        </div>
    );
}
