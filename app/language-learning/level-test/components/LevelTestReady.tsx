'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { CefrLevel, CEFR_LEVEL_NAMES } from '@/api/TomeLearningDashboardAPI';

/** Presentational only — no backend endpoint exposes these yet (OQ-5). Kept in sync with tome-ms-language's Config.ts by hand. */
export const LEVEL_TEST_SIZE = 40;
export const LEVEL_TEST_PASS_THRESHOLD = 75;

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Returns the CEFR level after `level`, or null if already at the highest level. */
export function nextCefrLevel(level: CefrLevel): CefrLevel | null {
    const idx = CEFR_LEVELS.indexOf(level);
    return idx >= 0 && idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : null;
}

function FeatureRow({icon, title, subtitle}: {icon: string, title: string, subtitle: string}) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-black/10 last:border-0">
            <div className="w-10 h-10 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0">
                <MaskedSvgIcon src={icon} alt="" size="w-5 h-5" color="bg-cyan-800" />
            </div>
            <div className="flex flex-col">
                <span className="text-base font-bold text-black/80">{title}</span>
                <span className="text-xs text-black/50 mt-0.5">{subtitle}</span>
            </div>
        </div>
    );
}

interface LevelTestReadyProps {
    currentCefrLevel: CefrLevel;
    onStart: () => void;
    isStarting: boolean;
}

export function LevelTestReady({currentCefrLevel, onStart, isStarting}: LevelTestReadyProps) {
    const currentLevelName = CEFR_LEVEL_NAMES[currentCefrLevel];
    const nextLevel = nextCefrLevel(currentCefrLevel);

    const rows = [
        { icon: '/images/book.svg', title: `${LEVEL_TEST_SIZE} questions`, subtitle: 'sampled across all 12 modules' },
        { icon: '/images/tick.svg', title: `${LEVEL_TEST_PASS_THRESHOLD}% to pass`, subtitle: nextLevel ? `promotes you to ${nextLevel}` : 'completes your journey' },
        { icon: '/images/signal.svg', title: 'Instant feedback', subtitle: 'see mistakes as you go' },
        { icon: '/images/leaf.svg', title: 'Counts toward mastery', subtitle: 'same as practice' },
    ];

    return (
        <div className="flex flex-1 flex-col px-5 pt-2 pb-0">
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">
                {currentCefrLevel} · {currentLevelName}{nextLevel ? ` → ${nextLevel}` : ''}
            </span>
            <span className="text-3xl font-bold text-black mt-2 leading-snug">Ready to<br />level up?</span>
            <p className="text-sm text-black/60 mt-3 leading-relaxed">
                One run across everything {currentLevelName} taught — all twelve modules, vocabulary and grammar, mixed together.
            </p>

            <div className="mt-6 rounded-2xl bg-white/50 px-4">
                {rows.map(r => <FeatureRow key={r.title} icon={r.icon} title={r.title} subtitle={r.subtitle} />)}
            </div>

            <div className="flex-1" />

            <div className="py-4">
                <button
                    onClick={onStart}
                    disabled={isStarting}
                    className={`w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 transition-opacity ${isStarting ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                    {isStarting ? 'Starting…' : 'Start Level Test'}
                </button>
                <p className="text-xs text-black/50 font-semibold mt-3 text-center">
                    The in-test questions work exactly like practice.
                </p>
            </div>
        </div>
    );
}
