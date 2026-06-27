'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { StepState } from './StepList';

interface FlowTestPaneProps {
    testState: StepState;
    lockLabel?: string;
    vocabularySeen: number;
    vocabularyTotal: number;
    testUnlockDelayHours: number;
}

export function FlowTestPane({ testState, lockLabel, vocabularySeen, vocabularyTotal, testUnlockDelayHours }: FlowTestPaneProps) {
    const coveragePct = vocabularyTotal > 0 ? (vocabularySeen / vocabularyTotal) * 100 : 0;

    if (testState === 'available') {
        return (
            <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0">
                        <MaskedSvgIcon src="/images/tick.svg" alt="Test" size="w-5 h-5" color="bg-cyan-800" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-black/50 m-0">Module Test</p>
                        <p className="text-xl font-bold text-black mt-0.5 m-0">Ready to test</p>
                    </div>
                </div>
                <p className="text-sm text-black/70 leading-relaxed m-0">
                    You&apos;ve covered all vocabulary. Take the test to complete this module and unlock the next.
                </p>
            </div>
        );
    }

    if (testState === 'completed') {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
                <div className="w-11 h-11 rounded-full bg-lime-200 flex items-center justify-center">
                    <MaskedSvgIcon src="/images/tick.svg" alt="Passed" size="w-5 h-5" color="bg-cyan-800" />
                </div>
                <p className="text-xl font-bold text-black m-0">Test passed</p>
                <p className="text-sm text-black/60 m-0">This module is complete.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 flex-1">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full border-2 border-cyan-600 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-5 h-5" color="bg-cyan-800" />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/50 m-0">Module Test</p>
                    <p className="text-xl font-bold text-black mt-0.5 m-0">Module Test is locked</p>
                </div>
            </div>
            <p className="text-sm text-black/70 leading-relaxed m-0">
                Finish practice so every word has been seen at least once. The test unlocks <b>{testUnlockDelayHours} hours</b> after full coverage — a short spaced-repetition gap so it tests memory, not recall.
            </p>
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-700/40 p-5 flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white mb-2 m-0">Coverage this round</p>
                    <div className="h-2 rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-lime-200 transition-all" style={{ width: `${coveragePct}%` }} />
                    </div>
                </div>
                <span className="text-base font-bold text-white whitespace-nowrap">{vocabularySeen} / {vocabularyTotal} words</span>
            </div>
            {lockLabel && (
                <div className="flex flex-1 items-end justify-end">
                    <div className="flex items-center gap-2 text-lg font-semibold text-black">
                        <MaskedSvgIcon src="/images/padlock.svg" alt="Lock" size="w-4 h-4" color="bg-black/50" />
                        {lockLabel}
                    </div>
                </div>
            )}
        </div>
    );
}
