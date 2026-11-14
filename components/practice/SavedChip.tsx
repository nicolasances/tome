'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

export function SavedChip() {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/40 anim-pc-rise"
            style={{ animationDelay: '440ms' }}>
            <span className="w-4 h-4 rounded-full bg-lime-200 text-cyan-900 flex items-center justify-center text-sm font-black">
                <MaskedSvgIcon src="/images/tick.svg" alt="Saved" size="w-3 h-3" />
            </span>
            <span className="text-base font-semibold text-black/50 whitespace-nowrap">Progress saved</span>
        </div>
    );
}
