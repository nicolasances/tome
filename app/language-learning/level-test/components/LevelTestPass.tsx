'use client';

import { CefrLevel, CEFR_LEVEL_NAMES } from '@/api/TomeLearningDashboardAPI';
import { LEVEL_TEST_PASS_THRESHOLD } from './LevelTestReady';

/* Restrained celebration spark ticks around the pass ring — mirrors TestResult's ScoreRing (module test), always shown here since this component only ever renders on a pass. */
const SPARK_ANGLES = [18, 70, 128, 250, 312];

function ScoreRing({score, correctCount, totalCount}: {score: number, correctCount: number, totalCount: number}) {
    const size = 184;
    const stroke = 15;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(Math.max(score, 0), 100) / 100;

    return (
        <div className="relative w-[184px] h-[184px]">
            {SPARK_ANGLES.map((angle, i) => (
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
                    className="stroke-lime-300"
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

function ThresholdBar({score, threshold}: {score: number, threshold: number}) {
    return (
        <div className="relative w-full pt-1 pb-6">
            <div className="w-full h-[10px] rounded-full bg-black/10 overflow-hidden">
                <div className="h-full rounded-full bg-lime-300 transition-all duration-500" style={{ width: `${Math.min(score, 100)}%` }} />
            </div>
            <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${threshold}%` }}>
                <div className="w-0.5 h-[18px] rounded-sm bg-cyan-800" />
                <span className="text-[10px] font-bold text-black/70 mt-[3px] whitespace-nowrap">pass {threshold}%</span>
            </div>
        </div>
    );
}

function LevelBadge({label, size}: {label: string, size: 'small' | 'large'}) {
    const dims = size === 'large' ? 'w-14 h-14 text-xl border-[2.5px] border-lime-300 bg-lime-300' : 'w-[46px] h-[46px] text-base border-2 border-lime-200 bg-lime-200';
    return (
        <div className={`${dims} rounded-full text-cyan-800 font-bold flex items-center justify-center flex-shrink-0`}>
            {label}
        </div>
    );
}

interface LevelTestPassProps {
    score: number;
    correctCount: number;
    totalCount: number;
    fromLevel: CefrLevel;
    /** The level the user was promoted to; null if already at the highest level. */
    toLevel: CefrLevel | null;
    onStartNext: () => void;
    onReview: () => void;
}

export function LevelTestPass({score, correctCount, totalCount, fromLevel, toLevel, onStartNext, onReview}: LevelTestPassProps) {
    const fromLevelName = CEFR_LEVEL_NAMES[fromLevel];
    const toLevelName = toLevel ? CEFR_LEVEL_NAMES[toLevel] : null;

    return (
        <div className="flex flex-1 flex-col items-center px-6 pt-6 pb-4 text-center">
            <div className="mt-6">
                <ScoreRing score={score} correctCount={correctCount} totalCount={totalCount} />
            </div>

            <div className="flex items-center gap-3 mt-6">
                <LevelBadge label={fromLevel} size="small" />
                {toLevel && (
                    <>
                        <span className="text-black/40 text-lg">→</span>
                        <LevelBadge label={toLevel} size="large" />
                    </>
                )}
            </div>

            <h1 className="text-2xl font-bold text-black/80 mt-5">{toLevel ? `You're now ${toLevel}!` : "You've completed every level!"}</h1>
            {toLevel ? (
                <p className="text-sm text-black/70 mt-2 leading-relaxed">
                    <b>{fromLevelName}</b> is complete. The <b>{toLevelName}</b> modules are now open.
                </p>
            ) : (
                <p className="text-sm text-black/70 mt-2 leading-relaxed">
                    <b>{fromLevelName}</b> is complete — you&apos;ve reached the top of the path.
                </p>
            )}

            <div className="w-full mt-6">
                <ThresholdBar score={score} threshold={LEVEL_TEST_PASS_THRESHOLD} />
            </div>

            <div className="flex-1" />

            <div className="w-full flex flex-col gap-2.5">
                <button onClick={onStartNext} className="w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 cursor-pointer">
                    {toLevel ? `Start ${toLevel}` : 'Back to Home'}
                </button>
                <button onClick={onReview} className="w-full rounded-full border-2 border-cyan-700 text-black/80 bg-transparent font-bold text-sm py-3 cursor-pointer">
                    Review answers
                </button>
            </div>
        </div>
    );
}
