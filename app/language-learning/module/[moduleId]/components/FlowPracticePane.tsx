'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { ProgressBar } from '@/app/ui/general/ProgressBar';

interface FlowPracticePaneProps {
    currentRung: number;
    rungCovered: number;
    rungTotal: number;
    progress: number;
    stepNumber: number;
}

export function FlowPracticePane({ currentRung, rungCovered, rungTotal, progress }: FlowPracticePaneProps) {

    const completedRungs = currentRung - 1 > 0 ? currentRung - 1 : 0;

    const coveragePct = ((completedRungs + progress) / 3) * 100;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/language.svg" alt="Practice" size="w-5 h-5" color="bg-cyan-800" />
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/50 m-0">Practice</p>
                    <p className="text-xl font-bold text-black mt-0.5 m-0">Keep building vocabulary</p>
                </div>
            </div>

            <p className="text-base text-black/70 leading-relaxed m-0">
                Work through practice rounds until every module word is covered. Each round presents exercises in a mix of formats — no pressure, just repetition.
            </p>

            <div className="flex flex-col gap-1 text-base">
                <CurrentRungProgress currentRung={currentRung} />
                <div className="flex items-center gap-4">
                    <div className="">Items covered in the rung:</div>
                    <div className="text-base font-bold text-white whitespace-nowrap">{rungCovered}/{rungTotal}</div>
                </div>
            </div>

            {/* Coverage */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <p className="text-sm font-semibold uppercase tracking-widest text-white mb-1 m-0">Practice coverage: {coveragePct.toFixed(0)}%</p>
                    <div className="flex-1">
                        <ProgressBar current={completedRungs + progress} max={3} hideNumber={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}


function CurrentRungProgress({ currentRung }: { currentRung: number }) {
    return (
        <div className="flex-1 flex items-center justify">
            <div className="flex-1">Rung <span className="font-bold text-white"> {currentRung} of 3</span></div>
            <div className="flex items-center gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <RungDot key={i} completed={i < currentRung} />
                ))}
            </div>
        </div>
    )
}


function RungDot({ completed }: { completed: boolean }) {
    return (
        <span
            className={`block rounded-full ${completed ? 'bg-lime-200' : 'bg-transparent'}`}
            style={{
                width: 7,
                height: 7,
                ...(completed ? {} : { border: '1.5px solid rgba(0,0,0,0.22)' }),
            }}
        />
    );
}