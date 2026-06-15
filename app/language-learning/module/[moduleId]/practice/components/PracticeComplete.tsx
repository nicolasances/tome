'use client';

import { useEffect, useState } from 'react';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PracticeCompleteProps {
    step2Complete: boolean;
    moduleTitle: string;
    moduleNumber: string;
    coverageBeforePct: number;
    coverageAfterPct: number;
    practicedWords: number;
    totalWords: number;
    answered: number;
    firstTryMastered: number;
    testUnlocksAt: string | null;
    testUnlockDelayHours: number;
    onPracticeAnother: () => void;
    onBackToModule: () => void;
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function AnimRing({from, to}: {from: number, to: number}) {
    const size = 188, stroke = 15;
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const [p, setP] = useState(from);

    useEffect(() => {
        const t = setTimeout(() => setP(to), 90);
        return () => clearTimeout(t);
    }, [to]);

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0891b2" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#bef264" strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 720ms cubic-bezier(0.22,1,0.36,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                <span className="font-bold text-black leading-none" style={{ fontSize: 50 }}>
                    {Math.round(to * 100)}<span className="text-2xl">%</span>
                </span>
                <span className="text-base font-bold text-black/50">module covered</span>
            </div>
        </div>
    );
}

function AnimBar({from, to}: {from: number, to: number}) {
    const [p, setP] = useState(from);

    useEffect(() => {
        const t = setTimeout(() => setP(to), 160);
        return () => clearTimeout(t);
    }, [to]);

    return (
        <div className="relative w-full h-3.5 rounded-full bg-black/10 overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-white/30" style={{ width: `${from * 100}%` }} />
            <div className="relative h-full rounded-full bg-lime-300"
                style={{ width: `${p * 100}%`, transition: 'width 650ms cubic-bezier(0.22,1,0.36,1)' }} />
        </div>
    );
}

function SparkBurst({radius = 118, dots = [12, 64, 122, 196, 248, 312]}: {radius?: number, dots?: number[]}) {
    return (
        <>
            {dots.map((angle, i) => (
                <span key={i} className="absolute pointer-events-none"
                    style={{ left: '50%', top: '50%', width: 0, height: 0, transform: `rotate(${angle}deg) translateY(-${radius}px)` }}>
                    <span className={`absolute rounded-full anim-pc-pop ${i % 2 ? 'bg-cyan-400' : 'bg-lime-300'}`}
                        style={{ left: -3.5, top: -3.5, width: 7, height: 7, animationDelay: `${200 + i * 45}ms` }} />
                </span>
            ))}
        </>
    );
}

function SavedChip() {
    return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/40 anim-pc-rise"
            style={{ animationDelay: '440ms' }}>
            <span className="w-4 h-4 rounded-full bg-lime-300 text-cyan-900 flex items-center justify-center text-sm font-black">✓</span>
            <span className="text-base font-semibold text-black/50 whitespace-nowrap">Progress saved</span>
        </div>
    );
}

function MiniStat({value, label, green = false, delay = 0}: {value: string, label: string, green?: boolean, delay?: number}) {
    return (
        <div className="flex flex-col items-center gap-1 anim-pc-rise" style={{ animationDelay: `${delay}ms` }}>
            <span className={`text-3xl font-bold leading-none ${green ? 'text-green-200' : 'text-black'}`}>{value}</span>
            <span className="text-sm font-semibold uppercase tracking-widest text-black/40">{label}</span>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveHeadline(accuracy: number): { headline: string; subline: string } {
    if (accuracy >= 0.85) return { headline: 'Strong round!', subline: 'Great momentum — keep it up.' };
    if (accuracy >= 0.60) return { headline: 'Round complete', subline: 'A little more practice and the test unlocks.' };
    return { headline: 'Keep going!', subline: "Every round builds the foundation. You've got this." };
}

function formatUnlockLabel(testUnlocksAt: string | null, testUnlockDelayHours: number): string {
    if (testUnlocksAt) {
        const remainingMs = new Date(testUnlocksAt).getTime() - Date.now();
        if (remainingMs > 0) {
            const hours = Math.ceil(remainingMs / 3600000);
            return `${hours}h`;
        }
    }
    return `${testUnlockDelayHours}h`;
}

// ── Round complete state ───────────────────────────────────────────────────────

function RoundComplete({moduleNumber, coverageBeforePct, coverageAfterPct, answered, firstTryMastered, onPracticeAnother, onBackToModule}: Pick<PracticeCompleteProps, 'moduleNumber' | 'coverageBeforePct' | 'coverageAfterPct' | 'answered' | 'firstTryMastered' | 'onPracticeAnother' | 'onBackToModule'>) {
    const accuracy = answered > 0 ? firstTryMastered / answered : 0;
    const { headline, subline } = deriveHeadline(accuracy);
    const accuracyPct = `${Math.round(accuracy * 100)}%`;

    return (
        <div className="flex flex-1 flex-col items-center px-6 pt-1 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-black/50 mt-4">
                Module {moduleNumber}
            </span>

            <div className="relative mt-4">
                <SparkBurst radius={118} />
                <AnimRing from={coverageBeforePct} to={coverageAfterPct} />
            </div>

            <p className="text-3xl font-bold text-black mt-5 anim-pc-rise" style={{ animationDelay: '120ms' }}>
                {headline}
            </p>
            <p className="text-lg text-black/50 mt-1.5 leading-relaxed anim-pc-rise" style={{ animationDelay: '180ms' }}>
                {subline}
            </p>

            <div className="flex gap-8 mt-6">
                <MiniStat value={String(answered)} label="answered" delay={240} />
                <MiniStat value={String(firstTryMastered)} label="mastered" green delay={300} />
                <MiniStat value={accuracyPct} label="accuracy" delay={360} />
            </div>

            <div className="mt-5">
                <SavedChip />
            </div>

            <div className="flex-1" />

            <div className="w-full pb-4 flex flex-col gap-2.5">
                <button onClick={onPracticeAnother}
                    className="w-full rounded-full bg-lime-300 text-cyan-900 font-bold text-xl py-4 border-0 cursor-pointer">
                    Practice another round
                </button>
                <button onClick={onBackToModule}
                    className="w-full rounded-full border-2 border-cyan-700 bg-transparent text-black font-bold text-lg py-3 cursor-pointer">
                    Back to module
                </button>
            </div>
        </div>
    );
}

// ── Coverage milestone state ───────────────────────────────────────────────────

function CoverageMilestone({moduleTitle, coverageBeforePct, practicedWords, totalWords, testUnlocksAt, testUnlockDelayHours, onPracticeAnother, onBackToModule}: Pick<PracticeCompleteProps, 'moduleTitle' | 'coverageBeforePct' | 'practicedWords' | 'totalWords' | 'testUnlocksAt' | 'testUnlockDelayHours' | 'onPracticeAnother' | 'onBackToModule'>) {
    const unlockLabel = formatUnlockLabel(testUnlocksAt, testUnlockDelayHours);

    return (
        <div className="flex flex-1 flex-col items-center px-6 pt-1 text-center">
            <div className="relative mt-6 w-24 h-24">
                <SparkBurst radius={62} dots={[20, 90, 160, 230, 300]} />
                <div className="absolute inset-0 rounded-full bg-lime-300 flex items-center justify-center anim-pc-pop">
                    <MaskedSvgIcon src="/images/tick.svg" alt="Complete" size="w-10 h-10" color="bg-cyan-900" />
                </div>
            </div>

            <p className="text-3xl font-bold text-black mt-6 anim-pc-rise" style={{ animationDelay: '160ms' }}>
                All words covered
            </p>
            <p className="text-lg text-black/50 mt-1.5 leading-relaxed anim-pc-rise" style={{ animationDelay: '220ms' }}>
                You&apos;ve now practised every word in <strong className="text-black">{moduleTitle}</strong>
            </p>

            <div className="w-full mt-6 anim-pc-rise" style={{ animationDelay: '280ms' }}>
                <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-semibold uppercase tracking-widest text-black/50">Module coverage</span>
                    <span className="text-base font-bold text-black">{practicedWords} / {totalWords} words</span>
                </div>
                <AnimBar from={coverageBeforePct} to={1} />
            </div>

            <div className="w-full mt-5 p-4 rounded-2xl bg-cyan-900 flex items-center gap-3 text-left anim-pc-rise"
                style={{ animationDelay: '360ms' }}>
                <div className="w-10 h-10 rounded-full border-2 border-cyan-700 flex items-center justify-center shrink-0">
                    <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-5 h-5" color="bg-cyan-200" />
                </div>
                <div className="flex-1">
                    <p className="text-lg font-bold text-white">Module test unlocks in {unlockLabel}</p>
                    <p className="text-base text-cyan-200 mt-0.5 leading-snug">
                        We space it out so the words stick. Keep practising meanwhile.
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <SavedChip />
            </div>

            <div className="flex-1" />

            <div className="w-full pb-4 flex flex-col gap-2.5">
                <button onClick={onBackToModule}
                    className="w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-xl py-4 border-0 cursor-pointer">
                    Back to module
                </button>
                <button onClick={onPracticeAnother}
                    className="w-full rounded-full border-2 border-cyan-700 bg-transparent text-black font-bold text-lg py-3 cursor-pointer">
                    Keep practising
                </button>
            </div>
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function PracticeComplete(props: PracticeCompleteProps) {
    const { step2Complete, ...rest } = props;

    return (
        <div className="flex flex-1 flex-col overflow-y-auto no-scrollbar">
            {step2Complete
                ? <CoverageMilestone {...rest} />
                : <RoundComplete {...rest} />
            }
        </div>
    );
}
