'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomeWordsPracticeAPI, WordsPracticeError, WordsPracticeWord, SubmitWordAnswerResponse } from '@/api/TomeWordsPracticeAPI';
import { applyAnswer, buildQueueState, kickerLabel, restoreOutstanding, WordsQueueState } from '@/utils/wordsPracticeQueue';
import { AnswerVerifier, useAnswerVerification } from '@/utils/useAnswerVerification';
import { useKeyboardShortcuts } from '@/utils/useKeyboardShortcuts';
import { TranslationInput } from '@/components/TranslationInput';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { CheckFooter } from '@/components/practice/CheckFooter';
import { ResultSheet } from '@/components/practice/ResultSheet';
import { AIVerifyTray } from '@/components/practice/AIVerifyTray';
import { WordPrompt } from '../components/WordPrompt';

type LoadState = 'loading' | 'error' | 'notFound' | 'loaded';

export default function WordsPracticeSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();
    const sessionId = params.sessionId as string;

    const [userId, setUserId] = useState('');
    const [cefrLevel, setCefrLevel] = useState('');
    const [words, setWords] = useState<WordsPracticeWord[]>([]);
    const [queueState, setQueueState] = useState<WordsQueueState>({ queue: [], correct: [], attempted: [] });
    const [loadState, setLoadState] = useState<LoadState>('loading');

    const [inputValue, setInputValue] = useState('');
    const [submittedAnswer, setSubmittedAnswer] = useState('');
    const [verdict, setVerdict] = useState<SubmitWordAnswerResponse | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // AI check goes to F27 rather than F13: the verifier is the only difference from module practice.
    const verifier: AnswerVerifier = (args, signal) => new TomeWordsPracticeAPI().verifyAnswer(userId, sessionId, { wordKey: args.exerciseId, cefrLevel: args.cefrLevel }, signal);
    const verification = useAnswerVerification(verifier);

    useEffect(() => {
        setConfig({ title: 'Words Practice', backButton: { enabled: true, onClick: () => router.push('/language-learning') } });
    }, [setConfig, router]);

    useEffect(() => {
        async function load() {
            const me = await new TomeLearningDashboardAPI().getMe();
            const session = await new TomeWordsPracticeAPI().getSession(me.id, sessionId);

            if (!session) { setLoadState('notFound'); return; }
            if (session.status === 'completed') { router.replace(`/language-learning/words-practice/${sessionId}/results`); return; }

            setUserId(me.id);
            setCefrLevel(me.cefrLevel);
            setWords(session.words);
            setQueueState(buildQueueState(session.words));
            setLoadState('loaded');
        }
        load().catch(() => setLoadState('error'));
    }, [sessionId, router]);

    const wordMap = useMemo(() => new Map(words.map(w => [w.wordKey, w])), [words]);
    const currentWord = queueState.queue.length > 0 ? wordMap.get(queueState.queue[0]) ?? null : null;

    // Autofocus the input on every new word (and again after a retry of the same word).
    const headKey = queueState.queue[0];
    useEffect(() => {
        if (!verdict && loadState === 'loaded') inputRef.current?.focus();
    }, [headKey, queueState.attempted.length, verdict, loadState]);

    async function handleCheck() {
        if (!currentWord || isSubmitting || verdict || !inputValue.trim()) return;
        setIsSubmitting(true);
        setSubmitError(false);
        try {
            const result = await new TomeWordsPracticeAPI().submitAnswer(userId, sessionId, currentWord.wordKey, inputValue.trim());
            setSubmittedAnswer(inputValue.trim());
            setVerdict(result);
        } catch {
            setSubmitError(true);
        } finally {
            setIsSubmitting(false);
        }
    }

    // overrideCorrect is true when the AI accepted a wrong answer: the word counts as correct.
    async function handleContinue(overrideCorrect?: boolean) {
        if (!currentWord || !verdict) return;

        verification.reset();
        const next = applyAnswer(queueState, currentWord.wordKey, overrideCorrect ?? verdict.isCorrect);

        setVerdict(null);
        setInputValue('');
        setSubmittedAnswer('');
        setQueueState(next);

        if (next.queue.length === 0) await completeSession(next);
    }

    async function completeSession(state: WordsQueueState) {
        try {
            await new TomeWordsPracticeAPI().completeSession(userId, sessionId);
            router.push(`/language-learning/words-practice/${sessionId}/results`);
        } catch (e) {
            if (e instanceof WordsPracticeError && e.outstandingWordKeys?.length) setQueueState(restoreOutstanding(state, e.outstandingWordKeys));
            else setLoadState('error');
        }
    }

    function handleAiVerify() {
        if (!currentWord) return;
        verification.verify({ exerciseId: currentWord.wordKey, userAnswer: submittedAnswer, sessionId, cefrLevel });
    }

    const aiVerifyVisible = !!verdict && !verdict.isCorrect && verification.phase === null;
    useKeyboardShortcuts({ onCheckWithAi: aiVerifyVisible ? handleAiVerify : undefined });

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full lg:mt-8">

            {loadState === 'loading' && (
                <div className="flex flex-1 flex-col px-5 pt-2 gap-4" aria-busy="true" aria-label="Loading Words Practice session">
                    <div className="h-6 w-full rounded-full skeleton-shimmer" />
                    <div className="h-3 w-24 rounded-md skeleton-shimmer" />
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="h-8 w-3/4 mx-auto rounded-md skeleton-shimmer" />
                        <div className="h-6 w-1/3 mx-auto rounded-full skeleton-shimmer" />
                        <div className="h-14 w-full rounded-xl skeleton-shimmer" />
                    </div>
                </div>
            )}

            {(loadState === 'error' || loadState === 'notFound') && (
                <div className="flex flex-1 flex-col items-start gap-4 px-5 pt-4">
                    <p className="text-sm text-cyan-600">{loadState === 'notFound' ? 'This Words Practice session could not be found.' : 'Failed to load the Words Practice session. Please try again.'}</p>
                    <button onClick={() => router.push('/language-learning')} className="rounded-full border border-cyan-400 px-5 py-2.5 text-base font-bold text-cyan-900">Back to home</button>
                </div>
            )}

            {loadState === 'loaded' && currentWord && (
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    <div className="px-5 pt-2">
                        <SessionProgressBar total={words.length} mastered={queueState.correct.length} deferred={0} />
                        <div className="mt-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">{kickerLabel(queueState, words.length)}</span>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col px-5 pb-0 overflow-y-auto">
                        <WordPrompt word={currentWord} />
                        <div className="mt-6">
                            <TranslationInput
                                ref={inputRef}
                                value={inputValue}
                                onChange={setInputValue}
                                onSubmit={handleCheck}
                                disabled={isSubmitting || !!verdict}
                                placeholder="Type the Danish…"
                            />
                            {submitError && (
                                <p role="alert" className="mt-2 text-sm text-red-800">Could not check your answer. Press Check to try again.</p>
                            )}
                        </div>
                        <div className="flex-1" />
                    </div>

                    <CheckFooter enabled={inputValue.trim().length > 0 && !isSubmitting && !verdict} onCheck={handleCheck} />

                    {verdict && verification.phase === null && (
                        <ResultSheet
                            ok={verdict.isCorrect}
                            answer={verdict.correctAnswer}
                            userAnswer={submittedAnswer}
                            exerciseType="translation_active"
                            showExplain={false}
                            aiVerify={aiVerifyVisible}
                            onContinue={() => handleContinue()}
                            onAiVerify={handleAiVerify}
                        />
                    )}
                    {verdict && verification.phase !== null && (
                        <AIVerifyTray
                            phase={verification.phase}
                            userAnswer={submittedAnswer}
                            correctAnswer={verdict.correctAnswer}
                            explanation={verification.explanation}
                            onCancel={verification.cancel}
                            onResolve={accepted => handleContinue(accepted)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
