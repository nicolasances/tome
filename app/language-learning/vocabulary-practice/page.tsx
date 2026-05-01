'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { getVocabularyPracticeAPI } from '@/api/VocabularyPracticeAPIFactory';
import { VocabPracticeSession, VocabPracticeWord } from '@/model/VocabularyPractice';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { Input } from '@/components/ui/input';

type ResultState = { isCorrect: boolean; userAnswer: string } | null;

export default function VocabularyPracticePage() {
    const router = useRouter();
    const { setConfig } = useHeader();

    // Core session state
    const [session, setSession] = useState<VocabPracticeSession | null>(null);
    const [pendingQueue, setPendingQueue] = useState<string[]>([]);
    const [masteredIds, setMasteredIds] = useState<string[]>([]);
    const [deferredIds, setDeferredIds] = useState<string[]>([]);
    const [firstAttemptCorrectIds, setFirstAttemptCorrectIds] = useState<string[]>([]);

    // UI state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState<ResultState>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const api = getVocabularyPracticeAPI();

    // Configure header
    useEffect(() => {
        setConfig({
            title: 'Vocabulary Practice',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    // Load or start session on mount
    const loadSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let s = await api.getActiveSession();
            if (!s) {
                s = await api.startSession();
            }
            setSession(s);
            setPendingQueue(s.pendingQueue);
            setMasteredIds(s.masteredIds);
            setDeferredIds(s.deferredIds);
            setFirstAttemptCorrectIds(s.firstAttemptCorrectIds);
        } catch (e) {
            setError((e as Error).message ?? 'Failed to load session');
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // Auto-clear and auto-focus when current word changes
    const currentWordId = pendingQueue[0] ?? null;
    useEffect(() => {
        if (!currentWordId) return;
        setAnswer('');
        setResult(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [currentWordId]);

    // Complete session when queue is empty (and session is loaded)
    useEffect(() => {
        if (!session || loading || pendingQueue.length > 0) return;
        (async () => {
            try {
                const summary = await api.completeSession(session.sessionId);
                sessionStorage.setItem('vocab-practice-summary', JSON.stringify(summary));
                router.push('/language-learning/summary');
            } catch (e) {
                setError((e as Error).message ?? 'Failed to complete session');
            }
        })();
    }, [pendingQueue, session, loading]); // eslint-disable-line react-hooks/exhaustive-deps

    const getCurrentWord = (): VocabPracticeWord | null => {
        if (!session || !currentWordId) return null;
        return session.words.find((w) => w.id === currentWordId) ?? null;
    };

    const handleSubmit = () => {
        if (result !== null) return; // already showing result
        const word = getCurrentWord();
        if (!word || !session) return;

        const userAnswer = answer.trim();
        const isCorrect =
            userAnswer.toLowerCase() === word.translation.toLowerCase();

        setResult({ isCorrect, userAnswer });
        api.submitAnswer(session.sessionId, word.id, isCorrect).catch(console.error);

        const timer = setTimeout(() => {
            if (isCorrect) {
                const isFirstAttempt = !deferredIds.includes(word.id);
                const newMastered = [...masteredIds, word.id];
                const newFirstAttempt = isFirstAttempt
                    ? [...firstAttemptCorrectIds, word.id]
                    : firstAttemptCorrectIds;
                const newPending = pendingQueue.slice(1);

                setMasteredIds(newMastered);
                setFirstAttemptCorrectIds(newFirstAttempt);
                setPendingQueue(newPending);

                // Update session state for completeSession accuracy
                setSession((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        masteredIds: newMastered,
                        firstAttemptCorrectIds: newFirstAttempt,
                        pendingQueue: newPending,
                    };
                });
            } else {
                // Move to end of queue, add to deferred if not already
                const newDeferred = deferredIds.includes(word.id)
                    ? deferredIds
                    : [...deferredIds, word.id];
                const newPending = [...pendingQueue.slice(1), word.id];

                // Increment failedAttempts in local session state
                setSession((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        words: prev.words.map((w) =>
                            w.id === word.id
                                ? { ...w, failedAttempts: w.failedAttempts + 1 }
                                : w
                        ),
                        deferredIds: newDeferred,
                        pendingQueue: newPending,
                    };
                });

                setDeferredIds(newDeferred);
                setPendingQueue(newPending);
            }
            setResult(null);
            setAnswer('');
        }, 3000);

        return () => clearTimeout(timer);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    // ---- Render states ----

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

    if (!session || session.totalWords === 0) {
        return (
            <div className="flex flex-1 items-center justify-center px-6">
                <p className="text-muted-foreground text-center">No vocabulary words available.</p>
            </div>
        );
    }

    const currentWord = getCurrentWord();

    return (
        <div className="flex flex-1 flex-col items-stretch">
            {/* Progress bar */}
            <div className="px-4 pt-4">
                <SessionProgressBar
                    total={session.totalWords}
                    mastered={masteredIds.length}
                    deferred={deferredIds.length}
                />
            </div>

            {/* Word prompt / result area */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
                {currentWord && (
                    <>
                        {result === null ? (
                            /* Word prompt */
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                    Translate
                                </span>
                                <span className="text-4xl font-bold text-foreground">
                                    {currentWord.english}
                                </span>
                            </div>
                        ) : (
                            /* Result view */
                            <div className="flex flex-col items-center gap-3 text-center">
                                <span className="text-3xl font-bold text-foreground">
                                    {currentWord.english}
                                </span>
                                <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                    You Translated
                                </span>
                                <span className="text-2xl font-semibold">
                                    {result.userAnswer || <em className="text-muted-foreground">empty</em>}
                                </span>
                                {result.isCorrect ? (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-4xl">✅</span>
                                        <span className="text-green-600 font-bold text-lg">Correct!</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-4xl">❌</span>
                                        <span className="text-red-600 font-bold text-lg">Wrong!</span>
                                        <span className="text-muted-foreground text-sm mt-1">
                                            Correct answer:{' '}
                                            <span className="font-semibold text-foreground">
                                                {currentWord.translation}
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input pinned at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex gap-2">
                <Input
                    ref={inputRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={result !== null}
                    placeholder="Type Danish translation…"
                    className="flex-1"
                />
                <button
                    onClick={handleSubmit}
                    disabled={result !== null}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                >
                    Submit
                </button>
            </div>
        </div>
    );
}
