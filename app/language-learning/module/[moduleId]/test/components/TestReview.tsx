'use client';

import { TestReviewItem } from '@/api/TomeModuleTestAPI';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

function ReviewItemRow({item}: {item: TestReviewItem}) {
    const { isCorrect, prompt, userAnswer, correctAnswer } = item;

    if (isCorrect) {
        return (
            <div className="flex items-start gap-3 py-3 border-b border-black/10">
                <div className="w-7 h-7 rounded-full bg-lime-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MaskedSvgIcon src="/images/tick.svg" alt="Correct" size="w-4 h-4" color="bg-cyan-800" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-black/80 break-words">{prompt}</span>
                    <span className="text-xs text-black/50 mt-0.5">Answer: {correctAnswer}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3 py-3 border-b border-black/10">
            <div className="w-7 h-7 rounded-full bg-red-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MaskedSvgIcon src="/images/close.svg" alt="Wrong" size="w-3 h-3" color="bg-white" />
            </div>
            <div className="flex flex-col flex-1 min-w-0 gap-1">
                <span className="text-sm font-semibold text-black/80 break-words">{prompt}</span>
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-black/40 line-through break-words">{userAnswer}</span>
                    <span className="text-xs font-semibold text-cyan-800 break-words">{correctAnswer}</span>
                </div>
                <div className="flex gap-2 flex-wrap mt-1">
                    <button className="inline-flex items-center gap-1.5 border border-black/20 rounded-full py-1.5 px-3 text-xs font-semibold text-black/70">
                        <MaskedSvgIcon src="/images/teacher.svg" alt="Explain" size="w-3 h-3" color="bg-black/60" />
                        Explain my mistake
                    </button>
                </div>
            </div>
        </div>
    );
}

interface TestReviewProps {
    kicker: string;
    items: TestReviewItem[];
}

export function TestReview({kicker, items}: TestReviewProps) {
    const correctCount = items.filter(i => i.isCorrect).length;
    const totalCount = items.length;
    const pct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    return (
        <div className="flex flex-1 flex-col overflow-hidden">
            <div className="px-5 pt-4 pb-3 flex-shrink-0">
                <span className="text-xs font-semibold uppercase tracking-widest text-black/50">{kicker}</span>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-black text-cyan-800">{correctCount} / {totalCount} correct</span>
                    <span className="rounded-full bg-lime-200 text-cyan-800 text-xs font-bold px-3 py-1">{pct}%</span>
                </div>
                <div className="mt-3 w-full h-3 rounded-full border-2 border-cyan-400 p-0.5">
                    <div className="flex h-full overflow-hidden rounded-full bg-black/10">
                        <div className="h-full rounded-full bg-cyan-800 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 no-scrollbar">
                {items.map((item, i) => <ReviewItemRow key={i} item={item} />)}
            </div>
        </div>
    );
}
