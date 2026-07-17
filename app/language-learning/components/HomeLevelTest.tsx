'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { CefrLevel } from '@/api/TomeLearningDashboardAPI';
import { LevelTestEligibilityResponse } from '@/api/TomeLevelTestAPI';

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

function nextLevel(level: CefrLevel): CefrLevel | null {
    const idx = CEFR_LEVELS.indexOf(level);
    return idx >= 0 && idx < CEFR_LEVELS.length - 1 ? CEFR_LEVELS[idx + 1] : null;
}

function formatCountdown(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function CooldownCard({retryAvailableAt}: {retryAvailableAt: string}) {
    const [remaining, setRemaining] = useState(() => new Date(retryAvailableAt).getTime() - Date.now());
    useEffect(() => {
        const id = setInterval(() => setRemaining(new Date(retryAvailableAt).getTime() - Date.now()), 1000);
        return () => clearInterval(id);
    }, [retryAvailableAt]);

    return (
        <div className="flex items-center gap-3.5 px-4 py-2 rounded-[18px] bg-cyan-800/60">
            <div className="flex-none flex items-center justify-center rounded-full bg-cyan-700 text-cyan-200" style={{ width: 44, height: 44 }} aria-hidden="true">
                <MaskedSvgIcon src="/images/padlock.svg" alt="" color="bg-cyan-200" size="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-cyan-200 mb-0.5">All modules complete</p>
                <p className="text-base font-bold text-white">Level Test retry in {formatCountdown(remaining)}</p>
            </div>
        </div>
    );
}

interface HomeLevelTestProps {
    cefrLevel: CefrLevel;
    /** undefined while the eligibility check is loading; null on fetch error. */
    eligibility: LevelTestEligibilityResponse | null | undefined;
}

/**
 * Replaces the Continue CTA once all curated modules at the current level are
 * complete. Gated by GET /levelTest/eligibility: an eligible user gets an
 * interactive, celebratory CTA into the Level Test; a cooldown shows a
 * countdown; any other ineligibility falls back to the old passive message.
 */
export function HomeLevelTest({cefrLevel, eligibility}: HomeLevelTestProps) {
    const router = useRouter();
    const [pressed, setPressed] = useState(false);

    if (eligibility === undefined) {
        return (
            <div className="flex items-center gap-3.5 px-4 py-4 rounded-[18px] bg-cyan-800" aria-busy="true" aria-label="Checking level test eligibility">
                <div className="skeleton-shimmer flex-none rounded-full" style={{ width: 44, height: 44 }} />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="skeleton-shimmer h-3 w-28 rounded" />
                    <div className="skeleton-shimmer h-5 w-40 rounded" />
                </div>
            </div>
        );
    }

    if (eligibility?.eligible) {
        const next = nextLevel(cefrLevel);
        return (
            <button
                onClick={() => router.push('/language-learning/level-test')}
                onMouseDown={() => setPressed(true)}
                onMouseUp={() => setPressed(false)}
                onMouseLeave={() => setPressed(false)}
                onTouchStart={() => setPressed(true)}
                onTouchEnd={() => setPressed(false)}
                className="w-full text-left flex items-center gap-3.5 py-2 px-4 rounded-[18px] bg-lime-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800"
                aria-label="Take the Level Test"
                style={{ transform: pressed ? 'scale(0.95)' : 'scale(1)' }}
            >
                <div className="flex-none flex items-center justify-center rounded-full bg-cyan-800" style={{ width: 44, height: 44 }} aria-hidden="true">
                    <MaskedSvgIcon src="/images/point-right.svg" alt="" color="bg-lime-200" size="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase text-cyan-800/70 mb-0.5">
                        Level Test unlocked{next ? ` · ${cefrLevel} → ${next}` : ''}
                    </p>
                    <p className="text-lg font-bold text-cyan-800 truncate">Take the Level Test</p>
                </div>
            </button>
        );
    }

    if (eligibility?.retryAvailableAt) {
        return <CooldownCard retryAvailableAt={eligibility.retryAvailableAt} />;
    }

    return (
        <div className="flex items-center gap-3.5 px-4 py-2 rounded-[18px] bg-cyan-800/60">
            <div className="flex-none flex items-center justify-center rounded-full bg-cyan-700 text-cyan-200" style={{ width: 44, height: 44 }} aria-hidden="true">
                <MaskedSvgIcon src="/images/tick.svg" alt="" color="bg-cyan-200" size="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-cyan-200 mb-0.5">All modules complete</p>
                <p className="text-base font-bold text-white">Level test awaits!</p>
            </div>
        </div>
    );
}
