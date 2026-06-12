'use client';

import { useEffect, useState } from 'react';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

function formatCountdown(ms: number): string {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

export function TestLocked({lockTimestamp}: {lockTimestamp: string}) {
    const [remaining, setRemaining] = useState(() => new Date(lockTimestamp).getTime() - Date.now());

    useEffect(() => {
        const id = setInterval(() => setRemaining(new Date(lockTimestamp).getTime() - Date.now()), 1000);
        return () => clearInterval(id);
    }, [lockTimestamp]);

    return (
        <div className="flex flex-1 flex-col items-center justify-center px-5 gap-6">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-800/20 bg-cyan-800/10 flex items-center justify-center">
                <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-12 h-12" color="bg-cyan-800" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Unlocks in</span>
                <span className="text-4xl font-black text-cyan-800 tabular-nums">{formatCountdown(remaining)}</span>
            </div>

            <p className="text-sm text-black/60 text-center max-w-xs">
                The test opens 4 hours after completing practice, giving the vocabulary time to settle.
            </p>

            <div className="w-full">
                <button disabled className="w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 opacity-40 cursor-default">
                    Start test
                </button>
            </div>
        </div>
    );
}
