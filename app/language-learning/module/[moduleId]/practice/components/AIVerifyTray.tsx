'use client';

import { useEffect } from 'react';
import { MaskedSvgIcon } from 'toto-react';

type VerifyPhase = 'loading' | 'valid' | 'invalid';

interface AIVerifyTrayProps {
    phase: VerifyPhase;             // Which verification phase to render.
    userAnswer: string;            // The learner's typed translation being verified.
    correctAnswer: string;         // The canonical correct answer (shown when not accepted).
    explanation: string;           // The AI explanation (shown when not accepted).
    onCancel: () => void;          // Aborts an in-flight verification (loading phase).
    onResolve: (accepted: boolean) => void;  // Advances to the next exercise; accepted overturns the wrong verdict.
}

/** Small lime ring spinner shown while the AI request is in flight. */
function Spinner() {
    return <div className="w-5 h-5 rounded-full border-[3px] border-lime-200/25 border-t-lime-200 animate-spin" />;
}

/** Answer chip styled for the deep-teal tray; accepted answers get a lime border + tick. */
function DarkAnswerChip({text, ok, block}: {text: string, ok?: boolean, block?: boolean}) {
    return (
        <div className={`${block ? 'flex items-start' : 'inline-flex items-center'} gap-2 rounded-xl border-2 px-4 py-2 max-w-full ${ok ? 'bg-lime-200/15 border-lime-200' : 'bg-black/15 border-white/40'}`}>
            <span className={`text-base font-bold text-white leading-snug ${block ? 'whitespace-normal break-words flex-1' : 'whitespace-nowrap'}`}>{text}</span>
            {ok && <MaskedSvgIcon src="/images/tick.svg" alt="Accepted" size="w-4 h-4" color="bg-lime-200" />}
        </div>
    );
}

/**
 * Deep-teal bottom tray for the "Check with AI" translation answer-verification
 * flow, with the same footprint as ResultSheet. Renders three phases:
 * - loading: spinner + "Checking with AI…" + Cancel
 * - valid:   green verdict + "Accepted by AI" + Continue (overturns the verdict)
 * - invalid: red verdict + "Not accepted" + explanation + correct answer + Got it
 */
export function AIVerifyTray({phase, userAnswer, correctAnswer, explanation, onCancel, onResolve}: AIVerifyTrayProps) {

    const loading = phase === 'loading';
    const ok = phase === 'valid';
    const title = loading ? 'Checking with AI…' : ok ? 'Accepted by AI' : 'Not accepted';

    useEffect(() => {
        if (loading) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Enter') onResolve(ok); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [loading, ok, onResolve]);

    return (
        <div className="absolute left-0 right-0 bottom-0 bg-cyan-900 rounded-t-3xl px-5 pb-6 pt-2 flex flex-col gap-3 text-white box-border"
            style={{ maxHeight: 'calc(100% - 84px)' }}>

            {/* Drag handle */}
            <div className="flex justify-center py-1">
                <div className="w-10 h-1 rounded-full bg-white/30" />
            </div>

            {/* Header — verdict badge / spinner + title + AI attribution */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${loading ? 'bg-white/10' : ok ? 'bg-lime-200' : 'bg-red-800'}`}>
                    {loading
                        ? <Spinner />
                        : ok
                            ? <MaskedSvgIcon src="/images/tick.svg" alt="Accepted" size="w-6 h-6" color="bg-cyan-800" />
                            : <MaskedSvgIcon src="/images/close.svg" alt="Not accepted" size="w-3 h-3" color="bg-white" />}
                </div>
                <div className="min-w-0">
                    <div className="text-base font-bold text-white leading-tight">{title}</div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold uppercase tracking-widest text-cyan-200">
                        <MaskedSvgIcon src="/images/teacher.svg" alt="" size="w-3.5 h-3.5" color="bg-lime-200" />
                        AI answer check
                    </div>
                </div>
            </div>

            {/* The answer being verified */}
            <div className="flex-shrink-0">
                <div className="text-sm uppercase tracking-widest text-cyan-200 mb-1.5">Your answer</div>
                <DarkAnswerChip text={userAnswer} ok={ok} />
            </div>

            {/* Phase body */}
            {loading && (
                <div className="flex-shrink-0 text-sm text-cyan-100/75 leading-relaxed">
                    Comparing your translation against the meaning — accents and word order count, small variations are fine.
                </div>
            )}
            {ok && (
                <div className="flex-shrink-0 flex items-start gap-2 text-sm text-white leading-relaxed">
                    <MaskedSvgIcon src="/images/magic.svg" alt="" size="w-4 h-4" color="bg-lime-200" />
                    <span>Your translation works too — counting it as correct.</span>
                </div>
            )}
            {phase === 'invalid' && (
                <div className="flex flex-col gap-3 min-h-0 overflow-y-auto">
                    {explanation && (
                        <div>
                            <div className="text-sm uppercase tracking-widest text-cyan-200 mb-1">Why it&apos;s not accepted</div>
                            <div className="text-sm text-white leading-relaxed break-words">{explanation}</div>
                        </div>
                    )}
                    <div>
                        <div className="text-sm uppercase tracking-widest text-cyan-200 mb-1.5">Correct answer</div>
                        <DarkAnswerChip text={correctAnswer} ok block />
                    </div>
                </div>
            )}

            {/* Footer action */}
            {loading ? (
                <button
                    onClick={onCancel}
                    className="w-full border border-white/40 rounded-full bg-transparent text-white/90 font-bold text-base py-3.5 cursor-pointer tracking-wide flex-shrink-0">
                    Cancel
                </button>
            ) : (
                <button
                    onClick={() => onResolve(ok)}
                    className="w-full border-0 rounded-full bg-lime-200 text-cyan-900 font-bold text-base py-3.5 cursor-pointer tracking-wide flex-shrink-0">
                    {ok ? 'Continue' : 'Got it'}
                </button>
            )}
        </div>
    );
}
