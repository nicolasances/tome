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

interface DesktopHomeLevelTestProps {
    cefrLevel: CefrLevel;
    /** undefined while the eligibility check is loading; null on fetch error. */
    eligibility: LevelTestEligibilityResponse | null | undefined;
}

/** Desktop counterpart of HomeLevelTest — see that file for the eligibility-driven state contract. */
export function DesktopHomeLevelTest({cefrLevel, eligibility}: DesktopHomeLevelTestProps) {
    const router = useRouter();
    const [pressed, setPressed] = useState(false);
    const [remaining, setRemaining] = useState(() => eligibility?.retryAvailableAt ? new Date(eligibility.retryAvailableAt).getTime() - Date.now() : 0);

    useEffect(() => {
        if (!eligibility?.retryAvailableAt) return;
        const retryAvailableAt = eligibility.retryAvailableAt;
        const id = setInterval(() => setRemaining(new Date(retryAvailableAt).getTime() - Date.now()), 1000);
        return () => clearInterval(id);
    }, [eligibility?.retryAvailableAt]);

    if (eligibility === undefined) {
        return (
            <div className="rounded-2xl bg-cyan-800 p-7 min-h-56" aria-busy="true" aria-label="Checking level test eligibility">
                <div className="skeleton-shimmer h-3 w-32 rounded mb-3" />
                <div className="skeleton-shimmer h-8 w-64 rounded mb-2" />
                <div className="skeleton-shimmer h-4 w-48 rounded" />
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
                className="w-full text-left rounded-2xl bg-lime-200 p-7 min-h-56 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-800 transition-transform duration-150"
                aria-label="Take the Level Test"
                style={{ transform: pressed ? 'scale(0.98)' : 'scale(1)' }}
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-base font-semibold tracking-widest uppercase text-cyan-800/70 m-0">
                            Level Test unlocked{next ? ` · ${cefrLevel} → ${next}` : ''}
                        </p>
                        <p className="text-3xl font-bold text-cyan-800 mt-2 leading-tight m-0">Prove your foundation</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-cyan-800 flex items-center justify-center flex-shrink-0">
                        <MaskedSvgIcon src="/images/point-right.svg" alt="" color="bg-lime-200" size="w-7 h-7" />
                    </div>
                </div>
                <div className="mt-6">
                    <span className="inline-flex items-center rounded-full bg-cyan-800 text-lime-200 font-bold text-sm px-5 py-3">
                        Take the Level Test
                    </span>
                </div>
            </button>
        );
    }

    if (eligibility?.retryAvailableAt) {
        return (
            <div className="rounded-2xl bg-cyan-800/60 p-7 min-h-56 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-700 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/padlock.svg" alt="" color="bg-cyan-200" size="w-7 h-7" />
                </div>
                <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-cyan-200">All modules complete</p>
                    <p className="text-xl font-bold text-white mt-1 m-0">Level Test retry in {formatCountdown(remaining)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl bg-cyan-800/60 p-7 min-h-56 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-700 flex items-center justify-center flex-shrink-0">
                <MaskedSvgIcon src="/images/tick.svg" alt="" color="bg-cyan-200" size="w-7 h-7" />
            </div>
            <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-cyan-200">All modules complete</p>
                <p className="text-xl font-bold text-white mt-1 m-0">Level test awaits!</p>
            </div>
        </div>
    );
}
