'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { MaskedSvgIcon } from 'toto-react';
import { Exercise } from '@/api/TomePracticeSessionAPI';

interface ResultSheetProps {
    ok: boolean;
    answer?: string;
    aiVerify?: boolean;
    exercise: Exercise;
    onContinue: () => void;
    onAiVerify?: () => void;
}

export function ResultSheet({ok, answer, aiVerify, exercise, onContinue, onAiVerify}: ResultSheetProps) {
    const [expanded, setExpanded] = useState(false);
    const [canExpand, setCanExpand] = useState(false);
    const ansRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') onContinue(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onContinue]);

    useLayoutEffect(() => { setExpanded(false); }, [answer, ok]);
    useLayoutEffect(() => {
        if (expanded) return;
        const el = ansRef.current;
        if (el) setCanExpand(el.scrollHeight - 2 > el.clientHeight);
    }, [answer, ok, expanded]);

    const toggle = () => { if (!ok && canExpand) setExpanded(v => !v); };

    /**
     * Display logic:
     * - Do not display the answer for exercises of type Multiple Choice
     */
    const shouldDisplayAnswer = () => {
        if (exercise.type === 'multiple_choice') return false;
        return !ok && !!answer;
    };

    return (
        <div className="absolute left-0 right-0 bottom-0 bg-cyan-900 rounded-t-3xl px-5 pb-6 pt-2 flex flex-col gap-3 text-white box-border"
            style={{ maxHeight: 'calc(100% - 84px)' }}>

            {/* Drag handle */}
            <div className="flex justify-center py-1">
                <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>

            {/* Verdict row */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${ok ? 'bg-lime-200 text-cyan-800' : 'bg-red-800 text-white'}`}>
                    {ok ? <MaskedSvgIcon src="/images/tick.svg" alt="Correct" size="w-6 h-6" color="bg-cyan-800" /> : <MaskedSvgIcon src="/images/close.svg" alt="Incorrect" size="w-3 h-3" color="bg-white" />}
                </div>
                <span className="text-lg text-white">{ok ? 'Correct!' : 'Not quite'}</span>
            </div>

            {/* Wrong-answer reveal */}
            {shouldDisplayAnswer() && (
                <div className="flex-shrink-0 flex flex-col cursor-pointer min-h-0" onClick={toggle}>
                    <span className="text-sm uppercase tracking-widest text-cyan-200 mb-1">Answer</span>
                    <div
                        ref={ansRef}
                        className="text-base font-bold text-lime-200 leading-snug break-words"
                        style={expanded ? { overflowY: 'auto' } : { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden' }}>
                        {answer}
                    </div>
                    {canExpand && (
                        <span className="text-xs font-semibold text-cyan-300 mt-1.5 flex items-center gap-1">
                            {expanded ? 'Show less' : 'Show more'}
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                                <path d="M3 4.5L6 7.5L9 4.5" />
                            </svg>
                        </span>
                    )}
                </div>
            )}

            {/* Action buttons. "Explain my mistake" is still a stub; "Check with AI" verifies the answer with AI. */}
            {!ok && (
                <div className="flex gap-2 flex-wrap flex-shrink-0">
                    <button className="inline-flex items-center gap-1.5 border border-white/40 bg-transparent text-white/90 rounded-full py-2 px-3 text-sm">
                        <MaskedSvgIcon src="/images/magic.svg" alt="Explain my mistake" size="w-4 h-4" color="bg-white" />
                        Explain my mistake
                    </button>
                    {aiVerify && (
                        <button
                            onClick={onAiVerify}
                            className="inline-flex items-center gap-1.5 border border-white/40 bg-transparent text-white/90 rounded-full py-2 px-3 text-sm">
                            <MaskedSvgIcon src="/images/teacher.svg" alt="Check with AI" size="w-4 h-4" color="bg-white" />
                            Check with AI
                        </button>
                    )}
                </div>
            )}

            {/* Continue */}
            <button
                onClick={onContinue}
                className="w-full border-0 rounded-full bg-lime-200 text-cyan-900 font-bold text-base py-3.5 cursor-pointer tracking-wide flex-shrink-0">
                Continue
            </button>
        </div>
    );
}
