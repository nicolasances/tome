'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { ProgressBar } from '@/app/ui/general/ProgressBar';

interface FlowPracticePaneProps {
    vocabularySeen: number;
    vocabularyTotal: number;
    stepNumber: number;
}

export function FlowPracticePane({vocabularySeen, vocabularyTotal, stepNumber}: FlowPracticePaneProps) {
    const coveragePct = vocabularyTotal > 0 ? (vocabularySeen / vocabularyTotal) * 100 : 0;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/language.svg" alt="Practice" size="w-5 h-5" color="bg-cyan-800" />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50 m-0">Practice</p>
                    <p className="text-xl font-bold text-white mt-0.5 m-0">Keep building vocabulary</p>
                </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed m-0">
                Work through practice rounds until every module word is covered. Each round presents exercises in a mix of formats — no pressure, just repetition.
            </p>

            {/* Step progress */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <ProgressBar current={stepNumber} max={3} size="s" hideNumber id="flow-practice-step" />
                </div>
                <span className="text-sm font-bold text-white whitespace-nowrap">Step {stepNumber} / 3</span>
            </div>

            {/* Coverage */}
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-700/20 p-5 flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 m-0">Coverage this round</p>
                    <div className="h-2 rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-lime-200 transition-all" style={{ width: `${coveragePct}%` }} />
                    </div>
                </div>
                <span className="text-base font-bold text-white whitespace-nowrap">{vocabularySeen} / {vocabularyTotal} words</span>
            </div>
        </div>
    );
}
