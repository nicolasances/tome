'use client';

import { useRouter } from 'next/navigation';
import { CurrentModuleInfo } from '@/api/TomeLearningDashboardAPI';

interface ContinueCardProps {
    loading?: boolean;
    /** The current module to continue, or null when none is available. */
    module: CurrentModuleInfo | null | undefined;
}

/**
 * Dark card showing the current (in-progress or first-available) module.
 * Handles its own loading (skeleton) state via the `loading` prop.
 * Tapping navigates to the module overview at /language-learning/module/[id].
 * Renders an empty-state prompt when no module is available.
 */
export function ContinueCard({ loading, module }: ContinueCardProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div
                className="flex items-center gap-3.5 px-4 py-4 rounded-[18px] bg-cyan-800"
                aria-busy="true"
                aria-label="Loading current module"
            >
                <div className="bg-muted animate-pulse flex-none rounded-full w-11 h-11" />
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="bg-muted animate-pulse h-3 w-28 rounded" />
                    <div className="bg-muted animate-pulse h-5 w-40 rounded" />
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="flex items-center gap-3.5 px-4 py-4 rounded-[18px] bg-cyan-800/60">
                <div
                    className="flex-none flex items-center justify-center rounded-full bg-cyan-700 text-cyan-200"
                    style={{ width: 44, height: 44 }}
                    aria-hidden="true"
                >
                    <CheckIcon />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-cyan-200 mb-0.5">
                        All modules complete
                    </p>
                    <p className="text-base font-bold text-white">Level test awaits!</p>
                </div>
            </div>
        );
    }

    const kicker = `Continue · ${module.cefrLevel}·${String(module.moduleIndex).padStart(2, '0')}`;

    return (
        <button
            onClick={() => router.push(`/language-learning/module/${module.id}`)}
            className="w-full text-left flex items-center gap-3.5 px-4 py-4 rounded-[18px] bg-cyan-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200"
            aria-label={`Continue module: ${module.title}`}
        >
            <div
                className="flex-none flex items-center justify-center rounded-full bg-lime-200 text-cyan-800"
                style={{ width: 44, height: 44 }}
                aria-hidden="true"
            >
                <ArrowRightIcon />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-cyan-200 mb-0.5">
                    {kicker}
                </p>
                <p className="text-lg font-bold text-white truncate">{module.title}</p>
            </div>
        </button>
    );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}
