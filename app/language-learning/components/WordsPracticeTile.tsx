'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { WordsPracticeEntry } from '@/utils/wordsPracticeEntry';

export function WordsPracticeTile({ entry, starting, onOpen }: { entry: WordsPracticeEntry, starting?: boolean, onOpen: () => void }) {

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

    const buttonStyle = entry.status == 'resume' ? 'bg-lime-200 border-lime-200' : 'bg-cyan-700/40 border-cyan-500/30';

    return (
        <button
            onClick={onOpen}
            disabled={!enabled}
            className={`flex items-center w-full text-left rounded-2xl border ${buttonStyle} p-5 enabled:cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200`}
            aria-label={hint ? `Words Practice. ${hint}` : `Words Practice. ${action}`}
        >
            <div className="flex items-center gap-2 flex-1">
                <MaskedSvgIcon src="/images/notes.svg" alt="In Progress" size="w-8 h-8" color={`${entry.status === 'resume' ? 'bg-lime-700' : 'bg-cyan-800'}`} />
                <div>
                    <span className="text-lg font-semibold text-black/90">Words Practice</span>
                    <span className="text-xs uppercase tracking-widest text-black/80 block">{action}</span>
                </div>
            </div>
            <div className="flex items-center justify-between gap-2">
                {hint
                    ? <span className="text-xs font-semibold text-black/60">{hint}</span>
                    : entry.status !== 'error' && 
                        (entry.status == 'resume' ? 
                            <MaskedSvgIcon src="/images/point-right.svg" alt="In Progress" size="w-6 h-6" color="bg-lime-700" /> : 
                            <div className="bg-lime-200 rounded-full p-2"><MaskedSvgIcon src="/images/point-right.svg" alt="In Progress" size="w-4 h-4" color="bg-cyan-700" /></div>)}
            </div>
        </button>
    );
}
