'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { WordsPracticeEntry } from '@/utils/wordsPracticeEntry';

export function WordsPracticeTile({entry, starting, onOpen}: {entry: WordsPracticeEntry, starting?: boolean, onOpen: () => void}) {

    if (entry.status === 'loading') {
        return (
            <div className="rounded-2xl border border-cyan-300 p-5" aria-busy="true" aria-label="Loading Words Practice">
                <div className="flex items-baseline gap-2">
                    <div className="skeleton-shimmer h-9 w-10 rounded" />
                    <div className="skeleton-shimmer h-4 w-28 rounded" />
                </div>
                <div className="skeleton-shimmer h-3 w-16 rounded mt-2" />
            </div>
        );
    }

    const enabled = (entry.status === 'start' || entry.status === 'resume') && !starting;
    const action = entry.status === 'resume' ? 'Resume' : 'Practice words';
    const hint = entry.status === 'disabled' ? 'Complete a module to unlock' : null;

    return (
        <button
            onClick={onOpen}
            disabled={!enabled}
            className="flex items-center w-full text-left rounded-2xl border enabled:border-lime-200 enabled:bg-lime-200 p-5 enabled:cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200"
            aria-label={hint ? `Words Practice. ${hint}` : `Words Practice. ${action}`}
        >
            <div className="flex items-center gap-2 flex-1">
                <MaskedSvgIcon src="/images/notes.svg" alt="In Progress" size="w-8 h-8" color="bg-lime-700" />
                <span className="text-lg font-semibold text-black/90">Words Practice</span>
            </div>
            <div className="flex items-center justify-between gap-2">
                {hint
                    ? <span className="text-xs font-semibold text-black/60">{hint}</span>
                    : entry.status !== 'error' && <MaskedSvgIcon src="/images/point-right.svg" alt="In Progress" size="w-6 h-6" color="bg-lime-700" />}
            </div>
        </button>
    );
}
