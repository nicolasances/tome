'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { getVocabularyPracticeAPI } from '@/api/VocabularyPracticeAPIFactory';
import { VocabPracticeSession, VocabPracticeWord } from '@/model/VocabularyPractice';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { TranslationInput } from '@/components/TranslationInput';
import { PracticeResult } from '@/app/components/PracticeResult';
import { RoundButton } from 'toto-react';
import { TomeLanguageAPI } from '@/api/TomeLanguageAPI';

type ResultState = { isCorrect: boolean; userAnswer: string } | null;

function normalizeTranslationForComparison(value: string): string {
    return value
        .toLowerCase()
        .replace(/[\.\s'’]/g, '');
}

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
    const [acceptedThisWord, setAcceptedThisWord] = useState(false);

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextFnRef = useRef<(() => void) | null>(null);
    // Tracks the "generation" of the current loadSession call so stale concurrent
    // invocations (e.g. React StrictMode double-fire) are discarded before they
    // can call startSession and accidentally create a duplicate backend session.
    const sessionLoadGenRef = useRef(0);
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
        const gen = ++sessionLoadGenRef.current;
        setLoading(true);
        setError(null);
        try {
            let s = await api.getActiveSession();
            if (sessionLoadGenRef.current !== gen) return; // superseded — discard
            if (!s) {
                s = await api.startSession('danish');
                if (sessionLoadGenRef.current !== gen) return; // superseded — discard
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
        // Increment the generation counter on cleanup so any in-flight loadSession
        // call from this invocation is treated as stale and will not call startSession.
        return () => { sessionLoadGenRef.current++; };
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
        if (!answer.trim()) return;
        const word = getCurrentWord();
        if (!word || !session) return;

        const userAnswer = answer.trim();
        const normalized = normalizeTranslationForComparison(userAnswer);
        const isCorrect =
            normalized === normalizeTranslationForComparison(word.translation) ||
            word.alternativeTranslations.some((a) => normalized === normalizeTranslationForComparison(a.translation));

        setResult({ isCorrect, userAnswer });

        // Compute next queue state eagerly so we can persist to localStorage immediately
        // (before the UI-delay timeout fires), ensuring resume works even if the user exits
        // during the result feedback pause.
        let nextPending: string[];
        let nextMastered: string[];
        let nextDeferred: string[];
        let nextFirstAttempt: string[];
        let nextFailedAttempts: Record<string, number>;

        const currentFailedAttempts = Object.fromEntries(
            session.words.map((w) => [w.id, w.failedAttempts])
        );

        if (isCorrect) {
            const isFirstAttempt = !deferredIds.includes(word.id);
            nextMastered = [...masteredIds, word.id];
            nextFirstAttempt = isFirstAttempt ? [...firstAttemptCorrectIds, word.id] : firstAttemptCorrectIds;
            nextPending = pendingQueue.slice(1);
            nextDeferred = deferredIds.filter((id) => id !== word.id);
            nextFailedAttempts = currentFailedAttempts;
        } else {
            nextDeferred = deferredIds.includes(word.id) ? deferredIds : [...deferredIds, word.id];
            nextPending = [...pendingQueue.slice(1), word.id];
            nextMastered = masteredIds;
            nextFirstAttempt = firstAttemptCorrectIds;
            nextFailedAttempts = { ...currentFailedAttempts, [word.id]: (currentFailedAttempts[word.id] ?? 0) + 1 };
        }

        // Persist to localStorage immediately (not waiting for the UI timer)
        const queueState = {
            sessionId: session.sessionId,
            pendingQueue: nextPending,
            masteredIds: nextMastered,
            deferredIds: nextDeferred,
            firstAttemptCorrectIds: nextFirstAttempt,
            wordFailedAttempts: nextFailedAttempts,
        };
        localStorage.setItem(`vocab-queue-${session.sessionId}`, JSON.stringify(queueState));

        // Fire-and-forget backend call — errors logged but do not block UX
        api.submitAnswer(session.sessionId, word.id, isCorrect).catch((e) => {
            console.error('submitAnswer failed:', e);
        });

        /**
         * Move to the next question
         */
        const next = () => {

            setMasteredIds(nextMastered);
            setDeferredIds(nextDeferred);
            setFirstAttemptCorrectIds(nextFirstAttempt);
            setPendingQueue(nextPending);

            setSession((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    words: prev.words.map((w) => ({
                        ...w,
                        failedAttempts: nextFailedAttempts[w.id] ?? w.failedAttempts,
                    })),
                    masteredIds: nextMastered,
                    deferredIds: nextDeferred,
                    firstAttemptCorrectIds: nextFirstAttempt,
                    pendingQueue: nextPending,
                };
            });

            setResult(null);
            setAnswer('');
            setAcceptedThisWord(false);
        }

        nextFnRef.current = next;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(next, isCorrect ? 1000 : 10000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    };

    const handleNext = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        nextFnRef.current?.();
    }, []);

    const handleAcceptTranslation = () => {
        const word = getCurrentWord();
        if (!word || !session || !result || acceptedThisWord) return;

        setAcceptedThisWord(true);

        // Store the alternative — fire-and-forget
        new TomeLanguageAPI().addWordAlternative('danish', word.id, result.userAnswer.trim())
            .catch((e) => console.error('addWordAlternative failed:', e));

        // Record a correct outcome in backend stats — fire-and-forget
        api.submitAnswer(session.sessionId, word.id, true)
            .catch((e) => console.error('submitAnswer (accept) failed:', e));

        // Compute correct-answer queue delta
        const currentFailedAttempts = Object.fromEntries(
            session.words.map((w) => [w.id, w.failedAttempts])
        );
        const isFirstAttempt = !deferredIds.includes(word.id);
        const nextMastered = [...masteredIds, word.id];
        const nextFirstAttempt = isFirstAttempt ? [...firstAttemptCorrectIds, word.id] : firstAttemptCorrectIds;
        const nextPending = pendingQueue.slice(1);
        const nextDeferred = deferredIds.filter((id) => id !== word.id);

        // Persist to localStorage
        localStorage.setItem(`vocab-queue-${session.sessionId}`, JSON.stringify({
            sessionId: session.sessionId,
            pendingQueue: nextPending,
            masteredIds: nextMastered,
            deferredIds: nextDeferred,
            firstAttemptCorrectIds: nextFirstAttempt,
            wordFailedAttempts: currentFailedAttempts,
        }));

        // Update React state
        setMasteredIds(nextMastered);
        setDeferredIds(nextDeferred);
        setFirstAttemptCorrectIds(nextFirstAttempt);
        setPendingQueue(nextPending);
        setSession((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                masteredIds: nextMastered,
                deferredIds: nextDeferred,
                firstAttemptCorrectIds: nextFirstAttempt,
                pendingQueue: nextPending,
            };
        });

        // Clear result and advance
        if (timerRef.current) clearTimeout(timerRef.current);
        setResult(null);
        setAnswer('');
        setAcceptedThisWord(false);
    };

    /**
     * Handle "Enter" key to skip to next question immediately only: 
     * - when showing an incorrect result (since the user likely wants to get to the next word without waiting through the full 10-second timer)
     */
    useEffect(() => {

        if (result == null || result.isCorrect) return;

        let listenerAttached = false;
        let activationTimeout: ReturnType<typeof setTimeout> | null = null;

        const onWindowKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Enter') return;
            if (e.repeat) return;
            e.preventDefault();
            handleNext();
        };

        // Delay activation to avoid consuming the same Enter used to submit the answer.
        activationTimeout = setTimeout(() => {
            window.addEventListener('keydown', onWindowKeyDown);
            listenerAttached = true;
        }, 250);

        return () => {
            if (activationTimeout) clearTimeout(activationTimeout);
            if (listenerAttached) {
                window.removeEventListener('keydown', onWindowKeyDown);
            }
        };

    }, [result, handleNext]);

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
           <div className="flex flex-col items-stretch h-full">

            {/* Progress bar */}
            <div className="px-4 pt-8">
                <SessionProgressBar
                    total={session.totalWords}
                    mastered={masteredIds.length}
                    deferred={deferredIds.length}
                />
            </div>

            {/* Word prompt / result area */}
            <div className="flex-1 flex flex-col items-stretch justify-start px-6 pt-16 overflow-y-auto min-h-0">
                {currentWord && (
                    <>
                        {result === null ? (
                            /* Word prompt */
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                                    Translate this word
                                </span>
                                <span className="text-4xl font-bold text-foreground text-center">
                                    {currentWord.english}
                                </span>
                            </div>
                        ) : (
                            /* Result view */
                            <div className="flex flex-col items-stretch gap-3 text-center">
                                <span className="text-3xl font-bold text-foreground mb-4">
                                    {currentWord.english}
                                </span>
                                <PracticeResult type={result.isCorrect ? 'correct' : 'incorrect'} text={result.userAnswer} />
                                {!result.isCorrect && (<PracticeResult type='reference' text={currentWord.translation} />)}
                                {!result.isCorrect && !acceptedThisWord && (
                                    <div className="flex flex-col items-center gap-2 mt-4">
                                        <RoundButton
                                            svgIconPath={{ src: '/images/teacher.svg', alt: 'Accept', color: 'bg-lime-200' }}
                                            onClick={handleAcceptTranslation}
                                            type="primary"
                                        />
                                        <span className="text-sm text-muted-foreground">Accept my translation</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input pinned at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background">
                <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <TranslationInput
                            ref={inputRef}
                            value={answer}
                            onChange={setAnswer}
                            onSubmit={handleSubmit}
                            disabled={result !== null}
                            placeholder="Type Danish translation…"
                        />
                    </div>
                    <div className={`transition-all duration-300 overflow-hidden flex items-center justify-center pb-1 ${result !== null && !result.isCorrect ? 'w-12 opacity-100' : 'w-0 opacity-0'}`}>
                        <RoundButton
                            svgIconPath={{ src: '/images/point-right.svg', alt: 'Next', color: 'bg-lime-200' }}
                            onClick={handleNext}
                            type="primary"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}