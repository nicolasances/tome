'use client';

import { useEffect, useState } from 'react';
import { SubmitTestResponse } from '@/api/TomeModuleTestAPI';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

function ScoreRing({score, correctCount, totalCount}: {score: number, correctCount: number, totalCount: number}) {
    const pct = Math.round(score);
    return (
        <div className="relative w-36 h-36 flex items-center justify-center">
            <div
                className="absolute inset-0 rounded-full"
                style={{ background: `conic-gradient(#155e75 ${pct * 3.6}deg, rgba(0,0,0,0.08) 0deg)` }}
            />
            <div className="w-28 h-28 rounded-full bg-white/90 flex flex-col items-center justify-center z-10">
                <span className="text-2xl font-black text-cyan-800">{pct}%</span>
                <span className="text-xs font-bold text-black/60">{correctCount} / {totalCount}</span>
            </div>
        </div>
    );
}

function ThresholdBar({score, threshold}: {score: number, threshold: number}) {
    return (
        <div className="w-full">
            <div className="relative w-full h-3 rounded-full bg-black/10 overflow-visible">
                <div className="h-full rounded-full bg-cyan-800 transition-all duration-500" style={{ width: `${Math.min(score, 100)}%` }} />
                <div className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-red-500" style={{ left: `${threshold}%` }} />
            </div>
            <div className="flex justify-between mt-1">
                <span className="text-xs text-black/40">0%</span>
                <span className="text-xs font-semibold text-red-500">{threshold}% to pass</span>
                <span className="text-xs text-black/40">100%</span>
            </div>
        </div>
    );
}

function RetryCountdown({retryAvailableAt}: {retryAvailableAt: string}) {
    const [remaining, setRemaining] = useState(() => new Date(retryAvailableAt).getTime() - Date.now());
    useEffect(() => {
        const id = setInterval(() => setRemaining(new Date(retryAvailableAt).getTime() - Date.now()), 1000);
        return () => clearInterval(id);
    }, [retryAvailableAt]);
    const totalSec = Math.max(0, Math.floor(remaining / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-black/10 px-3 py-1.5 text-sm font-semibold text-black/70">
            <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-3 h-3" color="bg-black/60" />
            Retry in {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
    );
}

interface TestResultProps {
    result: SubmitTestResponse;
    passThreshold: number;
    moduleNumber: string;
    correctCount: number;
    totalCount: number;
    testRetryAvailableAt?: string;
    onReview: () => void;
    onHome: () => void;
}

export function TestResult({result, passThreshold, moduleNumber, correctCount, totalCount, testRetryAvailableAt, onReview, onHome}: TestResultProps) {
    const { score, passed } = result;

    return (
        <div className="flex flex-1 flex-col items-center px-5 pt-8 pb-4 gap-5">
            <ScoreRing score={score} correctCount={correctCount} totalCount={totalCount} />

            <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-black text-cyan-800">{passed ? 'Module passed!' : 'So close!'}</h1>
                {passed ? (
                    <p className="text-sm text-black/60">Module {moduleNumber} is now unlocked.</p>
                ) : (
                    <p className="text-sm text-black/60 max-w-xs">
                        You need {passThreshold}% to pass. Keep practising and try again.
                    </p>
                )}
            </div>

            <div className="w-full">
                <ThresholdBar score={score} threshold={passThreshold} />
            </div>

            {!passed && testRetryAvailableAt && <RetryCountdown retryAvailableAt={testRetryAvailableAt} />}

            <div className="flex-1" />

            <div className="w-full flex flex-col gap-3">
                {passed && (
                    <button onClick={onHome} className="w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 cursor-pointer">
                        Home
                    </button>
                )}
                <button
                    onClick={onReview}
                    className={`w-full rounded-full font-bold text-base py-4 cursor-pointer ${passed ? 'border-2 border-cyan-800 text-cyan-800 bg-transparent' : 'bg-cyan-800 text-lime-200'}`}>
                    Review answers
                </button>
            </div>
        </div>
    );
}
