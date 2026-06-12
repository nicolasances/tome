'use client';

import { useEffect, useState } from 'react';
import { SubmitTestResponse } from '@/api/TomeModuleTestAPI';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

/* Per the wireframe (tome-kit Ring): restrained celebration spark ticks around the pass ring */
const SPARK_ANGLES = [18, 70, 128, 250, 312];

function ScoreRing({score, passed, correctCount, totalCount}: {score: number, passed: boolean, correctCount: number, totalCount: number}) {
    const size = 184;
    const stroke = 15;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(Math.max(score, 0), 100) / 100;

    return (
        <div className="relative w-[184px] h-[184px]">
            {passed && SPARK_ANGLES.map((angle, i) => (
                <span
                    key={angle}
                    className={`absolute left-1/2 top-1/2 w-[7px] h-[7px] rounded-full ${i % 2 ? 'bg-lime-300' : 'bg-[#5ddef4]'}`}
                    style={{ transform: `rotate(${angle}deg) translateY(-118px)` }}
                />
            ))}
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth={stroke} />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    className={passed ? 'stroke-lime-300' : 'stroke-cyan-300'}
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct)}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[52px] font-bold text-black/80 leading-none">
                    {Math.round(score)}<span className="text-2xl">%</span>
                </span>
                <span className="text-xs font-bold text-black/70 mt-1.5">{correctCount} / {totalCount} correct</span>
            </div>
        </div>
    );
}

function ThresholdBar({score, threshold, passed}: {score: number, threshold: number, passed: boolean}) {
    return (
        <div className="relative w-full pt-1 pb-6">
            <div className="w-full h-[10px] rounded-full bg-black/10 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${passed ? 'bg-lime-300' : 'bg-cyan-300'}`}
                    style={{ width: `${Math.min(score, 100)}%` }}
                />
            </div>
            <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${threshold}%` }}>
                <div className="w-0.5 h-[18px] rounded-sm bg-cyan-800" />
                <span className="text-[10px] font-bold text-black/70 mt-[3px] whitespace-nowrap">pass {threshold}%</span>
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
        <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-[rgba(9,166,209,0.5)] px-4 py-2.5 text-[13px] font-bold text-black/70">
            <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-3.5 h-3.5" color="bg-black/70" />
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
        <div className="flex flex-1 flex-col items-center px-6 pt-6 pb-4 text-center">
            <div className="mt-6">
                <ScoreRing score={score} passed={passed} correctCount={correctCount} totalCount={totalCount} />
            </div>

            <h1 className="text-[26px] font-bold text-black/80 mt-5">{passed ? 'Module passed!' : 'So close'}</h1>
            {passed ? (
                <p className="text-sm text-black/70 mt-2 leading-relaxed">Module {moduleNumber} is now unlocked.</p>
            ) : (
                <p className="text-sm text-black/70 mt-2 leading-relaxed max-w-xs">
                    You need <b>{passThreshold}%</b> to pass. Review what slipped, then try again.
                </p>
            )}

            <div className="w-full mt-6">
                <ThresholdBar score={score} threshold={passThreshold} passed={passed} />
            </div>

            {!passed && testRetryAvailableAt && (
                <div className="mt-3">
                    <RetryCountdown retryAvailableAt={testRetryAvailableAt} />
                </div>
            )}

            <div className="flex-1" />

            <div className="w-full flex flex-col gap-2.5">
                {passed && (
                    <button onClick={onHome} className="w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 cursor-pointer">
                        Home
                    </button>
                )}
                <button
                    onClick={onReview}
                    className={`w-full rounded-full font-bold cursor-pointer ${passed ? 'border-2 border-cyan-700 text-black/80 bg-transparent text-[14.5px] py-[13px]' : 'bg-cyan-800 text-lime-200 text-base py-4'}`}>
                    Review answers
                </button>
            </div>
        </div>
    );
}
