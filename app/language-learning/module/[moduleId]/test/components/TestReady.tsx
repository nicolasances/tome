'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

function FeatureRow({icon, label}: {icon: string, label: string}) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-black/10 last:border-0">
            <div className="w-9 h-9 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0">
                <MaskedSvgIcon src={icon} alt="" size="w-5 h-5" color="bg-cyan-800" />
            </div>
            <span className="text-base font-semibold text-black/80">{label}</span>
        </div>
    );
}

interface TestReadyProps {
    kicker: string;
    title: string;
    questionCount: number;
    passThreshold: number;
    onStart: () => void;
    isStarting: boolean;
}

export function TestReady({kicker, title, questionCount, passThreshold, onStart, isStarting}: TestReadyProps) {
    const features = [
        { icon: '/images/book.svg', label: `${questionCount} questions` },
        { icon: '/images/tick.svg', label: `${passThreshold}% to pass` },
        { icon: '/images/signal.svg', label: 'Instant feedback' },
        { icon: '/images/leaf.svg', label: 'Counts toward mastery' },
    ];

    return (
        <div className="flex flex-1 flex-col px-5 pt-4 pb-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">{kicker}</span>
            <h1 className="text-2xl font-black text-cyan-800 mt-1 leading-snug">{title}</h1>
            <p className="text-sm text-black/60 mt-3">Ready to be assessed on this module?</p>

            <div className="mt-6 rounded-2xl bg-white/50 px-4">
                {features.map(f => <FeatureRow key={f.label} icon={f.icon} label={f.label} />)}
            </div>

            <div className="flex-1" />

            <div className="py-4">
                <button
                    onClick={onStart}
                    disabled={isStarting}
                    className={`w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 transition-opacity ${isStarting ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                    {isStarting ? 'Starting…' : 'Start test'}
                </button>
            </div>
        </div>
    );
}
