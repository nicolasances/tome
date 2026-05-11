'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { getSentencePracticeAPI } from '@/api/SentencePracticeAPIFactory';
import { SentencePracticeSession, SentencePracticeSentence } from '@/model/SentencePractice';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { TranslationInput } from '@/components/TranslationInput';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { RoundButton } from 'toto-react';
import { TomeLLMVerifyAPI, LLMVerifyResult } from '@/api/TomeLLMVerifyAPI';

type ResultState = { isCorrect: boolean; userAnswer: string } | null;

type QueueDelta = {
    nextPending: string[];
    nextMastered: string[];
    nextDeferred: string[];
    nextFirstAttempt: string[];
    nextFailedAttempts: Record<string, number>;
};

function normalizeForComparison(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function levenshteinDistance(a: string, b: string): number {
    const m = a.length, n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
        Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
            else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

export default function SentencePracticePage() {
    const router = useRouter();
    const { setConfig } = useHeader();

    const [session, setSession] = useState<SentencePracticeSession | null>(null);
    const [pendingQueue, setPendingQueue] = useState<string[]>([]);
    const [masteredIds, setMasteredIds] = useState<string[]>([]);
    const [deferredIds, setDeferredIds] = useState<string[]>([]);
    const [firstAttemptCorrectIds, setFirstAttemptCorrectIds] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState<ResultState>(null);
    const [llmVerifying, setLlmVerifying] = useState(false);
    const [llmResult, setLlmResult] = useState<LLMVerifyResult | null>(null);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const sessionLoadGenRef = useRef(0);
    // Stores the pre-computed queue delta for the current result.
    // For Tier 1/2 correct: correct delta. For wrong: wrong delta.
    // handleAskAI may replace it with a correct delta if LLM accepts.
    const pendingDeltaRef = useRef<QueueDelta | null>(null);

    const api = getSentencePracticeAPI();
    const llmApi = new TomeLLMVerifyAPI();

    useEffect(() => {
        setConfig({
            title: 'Sentence Practice',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    const loadSession = useCallback(async () => {
        const gen = ++sessionLoadGenRef.current;
        setLoading(true);
        setError(null);
        try {
            let s = await api.getActiveSession();
            if (sessionLoadGenRef.current !== gen) return;
            if (!s) {
                s = await api.startSession('danish');
                if (sessionLoadGenRef.current !== gen) return;
            }
            setSession(s);
            setPendingQueue(s.pendingQueue);
            setMasteredIds(s.masteredIds);
            setDeferredIds(s.deferredIds);
            setFirstAttemptCorrectIds(s.firstAttemptCorrectIds);
        } catch (e) {
            if (sessionLoadGenRef.current !== gen) return;
            setError((e as Error).message ?? 'Failed to load session');
        } finally {
            if (sessionLoadGenRef.current === gen) setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadSession();
        return () => { sessionLoadGenRef.current++; };
    }, [loadSession]);

    const currentSentenceId = pendingQueue[0] ?? null;
    useEffect(() => {
        if (!currentSentenceId) return;
        setAnswer('');
        setResult(null);
        setLlmResult(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [currentSentenceId]);

    useEffect(() => {
        if (!session || loading || pendingQueue.length > 0) return;
        (async () => {
            try {
                const summary = await api.completeSession(session.sessionId);
                sessionStorage.setItem('sentence-practice-summary', JSON.stringify(summary));
                router.push('/language-learning/sentence-summary');
            } catch (e) {
                setError((e as Error).message ?? 'Failed to complete session');
            }
        })();
    }, [pendingQueue, session, loading]); // eslint-disable-line react-hooks/exhaustive-deps

    const getCurrentSentence = (): SentencePracticeSentence | null => {
        if (!session || !currentSentenceId) return null;
        return session.sentences.find((s) => s.id === currentSentenceId) ?? null;
    };

    const applyDelta = (delta: QueueDelta, sessionId: string) => {
        const { nextPending, nextMastered, nextDeferred, nextFirstAttempt, nextFailedAttempts } = delta;
        localStorage.setItem(`sentence-queue-${sessionId}`, JSON.stringify({
            sessionId,
            pendingQueue: nextPending,
            masteredIds: nextMastered,
            deferredIds: nextDeferred,
            firstAttemptCorrectIds: nextFirstAttempt,
            sentenceFailedAttempts: nextFailedAttempts,
        }));
        setMasteredIds(nextMastered);
        setDeferredIds(nextDeferred);
        setFirstAttemptCorrectIds(nextFirstAttempt);
        setPendingQueue(nextPending);
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                sentences: prev.sentences.map((s) => ({
                    ...s,
                    failedAttempts: nextFailedAttempts[s.id] ?? s.failedAttempts,
                })),
                masteredIds: nextMastered,
                deferredIds: nextDeferred,
                firstAttemptCorrectIds: nextFirstAttempt,
                pendingQueue: nextPending,
            };
        });
    };

    const handleSubmit = () => {
        if (result !== null) return;
        if (!answer.trim()) return;
        const sentence = getCurrentSentence();
        if (!sentence || !session) return;

        const userAnswer = answer.trim();
        const normalizedUser = normalizeForComparison(userAnswer);
        const normalizedExpected = normalizeForComparison(sentence.sentence);

        const tier1 = normalizedUser === normalizedExpected;
        const tier2 = !tier1 && levenshteinDistance(normalizedUser, normalizedExpected) <= 2;
        const isCorrect = tier1 || tier2;

        setResult({ isCorrect, userAnswer });

        const currentFailedAttempts = Object.fromEntries(
            session.sentences.map((s) => [s.id, s.failedAttempts])
        );

        if (isCorrect) {
            const isFirstAttempt = !deferredIds.includes(sentence.id);
            pendingDeltaRef.current = {
                nextPending: pendingQueue.slice(1),
                nextMastered: [...masteredIds, sentence.id],
                nextDeferred: deferredIds.filter((id) => id !== sentence.id),
                nextFirstAttempt: isFirstAttempt
                    ? [...firstAttemptCorrectIds, sentence.id]
                    : firstAttemptCorrectIds,
                nextFailedAttempts: currentFailedAttempts,
            };
        } else {
            const nextDeferred = deferredIds.includes(sentence.id)
                ? deferredIds
                : [...deferredIds, sentence.id];
            pendingDeltaRef.current = {
                nextPending: [...pendingQueue.slice(1), sentence.id],
                nextMastered: masteredIds,
                nextDeferred,
                nextFirstAttempt: firstAttemptCorrectIds,
                nextFailedAttempts: {
                    ...currentFailedAttempts,
                    [sentence.id]: (currentFailedAttempts[sentence.id] ?? 0) + 1,
                },
            };
        }
    };

    // submitAnswer is always deferred to handleContinue so the correct isCorrect
    // value (including any LLM upgrade) is always what gets recorded.
    const handleContinue = () => {
        const sentence = getCurrentSentence();
        if (!sentence || !session || result === null) return;

        const finalIsCorrect = llmResult !== null ? llmResult.acceptable : result.isCorrect;
        const delta = pendingDeltaRef.current!;

        applyDelta(delta, session.sessionId);
        api.submitAnswer(session.sessionId, sentence.id, finalIsCorrect).catch((e) => {
            console.error('submitAnswer failed:', e);
        });

        setResult(null);
        setAnswer('');
        setLlmResult(null);
        pendingDeltaRef.current = null;
    };

    const handleAskAI = async () => {
        const sentence = getCurrentSentence();
        if (!sentence || !session || !result) return;

        setLlmVerifying(true);
        try {
            const verdict = await llmApi.verifyAnswer(
                sentence.translation,
                result.userAnswer,
                sentence.sentence,
                'danish'
            );

            if (verdict.acceptable) {
                // Replace the wrong delta with a correct delta (no failed-attempt increment)
                const currentFailedAttempts = Object.fromEntries(
                    session.sentences.map((s) => [s.id, s.failedAttempts])
                );
                const isFirstAttempt = !deferredIds.includes(sentence.id);
                pendingDeltaRef.current = {
                    nextPending: pendingQueue.slice(1),
                    nextMastered: [...masteredIds, sentence.id],
                    nextDeferred: deferredIds.filter((id) => id !== sentence.id),
                    nextFirstAttempt: isFirstAttempt
                        ? [...firstAttemptCorrectIds, sentence.id]
                        : firstAttemptCorrectIds,
                    nextFailedAttempts: currentFailedAttempts,
                };
                setResult((prev) => prev ? { ...prev, isCorrect: true } : prev);
            }

            setLlmResult(verdict);
        } catch (e) {
            console.error('LLM verify failed:', e);
            setLlmResult({
                acceptable: false,
                explanation: 'AI verification is temporarily unavailable. Please continue.',
            });
        } finally {
            setLlmVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                <p className="text-destructive text-center">{error}</p>
                <button
                    onClick={loadSession}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!session || session.totalSentences === 0) {
        return (
            <div className="flex flex-1 items-center justify-center px-6">
                <p className="text-muted-foreground text-center">No sentences available.</p>
            </div>
        );
    }

    const currentSentence = getCurrentSentence();
    const showAskAI = result !== null && !result.isCorrect && llmResult === null && !llmVerifying;
    const showContinue = result !== null && !llmVerifying;

    return (
        <div className="flex flex-col items-stretch h-full">
            <div className="px-4 pt-8">
                <SessionProgressBar
                    total={session.totalSentences}
                    mastered={masteredIds.length}
                    deferred={deferredIds.length}
                />
            </div>

            <div className="flex-1 flex flex-col items-stretch justify-start px-6 pt-16 overflow-y-auto min-h-0">
                {currentSentence && (
                    <>
                        {result === null ? (
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                                    Translate to Danish
                                </span>
                                <span className="text-2xl font-bold text-foreground text-center">
                                    {currentSentence.translation}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-stretch gap-3 text-center">
                                <span className="text-xl font-bold text-foreground mb-4">
                                    {currentSentence.translation}
                                </span>
                                <Result type={result.isCorrect ? 'correct' : 'incorrect'} text={result.userAnswer} />
                                {!result.isCorrect && (<Result type="reference" text={currentSentence.sentence} />)}

                                {(showAskAI || llmVerifying) && (
                                    <div className='flex flex-col items-center gap-2 mt-4'>
                                        <RoundButton svgIconPath={{src: "/images/magic.svg", alt: "Ask AI"}} onClick={handleAskAI} loading={llmVerifying} />
                                        <span className="text-sm text-muted-foreground ml-2">{llmVerifying ? 'Checking with AI…' : 'Ask AI for help'}</span>
                                    </div>
                                )}

                                {llmResult !== null && (
                                    <LLMResultCard acceptable={llmResult.acceptable} explanation={llmResult.explanation} />
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <TranslationInput
                            ref={inputRef}
                            value={answer}
                            onChange={setAnswer}
                            onSubmit={handleSubmit}
                            disabled={result !== null}
                            placeholder="Type Danish sentence…"
                        />
                    </div>
                    <div className={`transition-all duration-300 overflow-hidden flex items-center justify-center pb-1 ${showContinue ? 'w-12 opacity-100' : 'w-0 opacity-0'}`}>
                        <RoundButton
                            svgIconPath={{ src: '/images/point-right.svg', alt: 'Continue', color: 'bg-lime-200' }}
                            onClick={handleContinue}
                            type="primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LLMResultCard({ acceptable, explanation }: { acceptable: boolean; explanation: string }) {
    return (
        <div className={`flex flex-col rounded-md px-4 py-3 border-2 mt-1 ${acceptable ? 'border-lime-200 text-lime-200' : 'border-lime-200 text-lime-200'}`}>
            <span className="text-xs font-semibold tracking-widest uppercase mb-1 text-lime-200">
                AI Verdict
            </span>
            <span className={`text-sm font-bold mb-1 ${acceptable ? 'text-lime-200' : 'text-lime-200'}`}>
                {acceptable ? '✓ Acceptable' : '✗ Not acceptable'}
            </span>
            <span className="text–sm text-left text-cyan-900">{explanation}</span>
        </div>
    );
}

function Result({ type, text }: { type: 'correct' | 'incorrect' | 'reference'; text: string }) {
    let imageUrl = '/images/close.svg';
    let iconSize = 'w-5 h-5';
    if (type === 'correct') {
        imageUrl = '/images/tick.svg';
        iconSize = 'w-8 h-8';
    } else if (type === 'reference') imageUrl = '/images/point-right.svg';

    return (
        <div className="flex flex-col items-stretch">
            <div className={`flex rounded-md items-center px-4 py-2 border-2 ${type === 'correct' ? 'border-green-800 text-green-800' : type === 'incorrect' ? 'border-red-800 text-red-800' : 'border-cyan-400 text-cyan-200'}`}>
                <div>
                    <MaskedSvgIcon src={imageUrl} size={iconSize} alt="Result Icon" color={type === 'correct' ? 'bg-green-800' : type === 'incorrect' ? 'bg-red-800' : 'bg-cyan-300'} />
                </div>
                <div className="flex-1 flex flex-col items-start justify-center pl-4 border-l-4 border-[var(--background)] self-stretch -my-2 py-2">
                    <div className="text-left">{text || <em className="text-muted-foreground">empty</em>}</div>
                </div>
            </div>
        </div>
    );
}
