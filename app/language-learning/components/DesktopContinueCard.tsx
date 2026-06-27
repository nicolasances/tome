'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { CurrentModuleInfo, ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';
import { ProgressBar } from '@/app/ui/general/ProgressBar';

interface DesktopContinueCardProps {
    loading?: boolean;
    module: CurrentModuleInfo | null | undefined;
    progress?: ModuleProgressEntry | null;
}

export function DesktopContinueCard({loading, module, progress}: DesktopContinueCardProps) {
    const router = useRouter();
    const [pressed, setPressed] = useState(false);

    if (loading) {
        return (
            <div className="rounded-2xl bg-cyan-800 p-7 min-h-56" aria-busy="true" aria-label="Loading continue card">
                <div className="skeleton-shimmer h-3 w-32 rounded mb-3" />
                <div className="skeleton-shimmer h-8 w-64 rounded mb-2" />
                <div className="skeleton-shimmer h-4 w-48 rounded" />
                <div className="mt-8">
                    <div className="skeleton-shimmer h-2 w-full rounded-full" />
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="rounded-2xl bg-cyan-800/60 p-7 min-h-56 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-cyan-700 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/tick.svg" alt="Complete" color="bg-cyan-200" size="w-7 h-7" />
                </div>
                <div>
                    <p className="text-xs font-semibold tracking-widest uppercase text-cyan-200">All modules complete</p>
                    <p className="text-xl font-bold text-white mt-1 m-0">Level test awaits!</p>
                </div>
            </div>
        );
    }

    const kicker = `Continue · ${module.cefrLevel}·${String(module.moduleIndex).padStart(2, '0')}`;
    const stepNum = progress?.step === 'practice' ? 2 : progress?.step === 'test' ? 3 : progress?.step === 'done' ? 3 : 1;

    return (
        <button
            onClick={() => router.push(`/language-learning/module/${module.id}`)}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            className="w-full text-left rounded-2xl bg-cyan-800 p-7 min-h-56 flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200 transition-transform duration-150"
            aria-label={`Continue module: ${module.title}`}
            style={{ transform: pressed ? 'scale(0.98)' : 'scale(1)' }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-widest uppercase text-cyan-200 m-0">{kicker}</p>
                    <p className="text-3xl font-bold text-white mt-2 leading-tight m-0">{module.title}</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/point-right.svg" alt="Continue" color="bg-cyan-800" size="w-7 h-7" />
                </div>
            </div>
            <div className="mt-6">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <ProgressBar current={stepNum} max={3} size="s" hideNumber id="desktop-continue-step" />
                    </div>
                    <span className="text-sm font-bold text-white whitespace-nowrap">Step {stepNum} / 3</span>
                </div>
                {progress && (
                    <p className="text-xs text-cyan-100 mt-2 m-0">
                        Practice · {progress.vocabularyItemsPracticedCount} words seen this round
                    </p>
                )}
            </div>
        </button>
    );
}
