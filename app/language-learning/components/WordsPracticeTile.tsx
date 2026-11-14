'use client';

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
    const value = entry.status === 'error' ? '—' : String(entry.poolSize);
    const action = entry.status === 'resume' ? 'Resume' : 'Practice words';
    const hint = entry.status === 'disabled' ? 'Complete a module to unlock' : null;

    return (
        <button
            onClick={onOpen}
            disabled={!enabled}
            className="w-full text-left rounded-2xl border border-cyan-300 p-5 enabled:cursor-pointer enabled:hover:bg-cyan-300/10 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200"
            aria-label={hint ? `Words Practice. ${hint}` : `Words Practice. ${action}`}
        >
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black/90 leading-none">{value}</span>
                <span className="text-base font-semibold text-black/70">words to practise</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-black/50 m-0">Words Practice</p>
                {hint
                    ? <span className="text-xs font-semibold text-black/60">{hint}</span>
                    : entry.status !== 'error' && <span className="text-xs font-semibold uppercase tracking-widest text-black/90">{action} →</span>}
            </div>
        </button>
    );
}
