'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { getVocabularyPracticeAPI } from '@/api/VocabularyPracticeAPIFactory';
import { VocabPracticeSession, VocabPracticeWord } from '@/model/VocabularyPractice';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { TranslationInput } from '@/components/TranslationInput';
import { MaskedSvgIcon, RoundButton } from 'toto-react';

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

    const inputRef = useRef<HTMLTextAreaElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextFnRef = useRef<(() => void) | null>(null);
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
                s = await api.startSession('danish');
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
        }

        nextFnRef.current = next;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(next, isCorrect ? 1000 : 10000);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    };

    const handleNext = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        nextFnRef.current?.();
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
            <div className="px-4 pt-8">
                <SessionProgressBar
                    total={session.totalWords}
                    mastered={masteredIds.length}
                    deferred={deferredIds.length}
                />
            </div>

            {/* Word prompt / result area */}
            <div className="flex-1 flex flex-col items-stretch justify-start px-6 pb-32 pt-16">
                {currentWord && (
                    <>
                        {result === null ? (
                            /* Word prompt */
                            <div className="flex flex-col items-center gap-4">
                                <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                                    Translate this word
                                </span>
                                <span className="text-4xl font-bold text-foreground">
                                    {currentWord.english}
                                </span>
                            </div>
                        ) : (
                            /* Result view */
                            <div className="flex flex-col items-stretch gap-3 text-center">
                                <span className="text-3xl font-bold text-foreground mb-4">
                                    {currentWord.english}
                                </span>
                                <Result type={result.isCorrect ? "correct" : "incorrect"} text={result.userAnswer} />
                                {!result.isCorrect && (<Result type="reference" text={currentWord.translation} />)}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input pinned at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
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

function Result({ type, text }: { type: "correct" | "incorrect" | "reference"; text: string}) {

    let imageUrl = '/images/close.svg';
    let iconSize = 'w-5 h-5';
    if (type === 'correct') {
        imageUrl = '/images/tick.svg';
        iconSize = 'w-8 h-8';
    }
    else if (type === 'reference') imageUrl = '/images/point-right.svg';

    return (
        <div className='flex flex-col items-stretch'>
            {/* <div className="text-2xs uppercase tracking-widest text-left pl-2 mb-1">{title}</div> */}
            <div className={`flex rounded-md items-center px-4 py-2 border-2 ${type === 'correct' ? 'border-green-800 text-green-800' : type === 'incorrect' ? 'border-red-800 text-red-800' : 'border-cyan-400 text-cyan-200'}`}>
                <div className="pr-4">
                    <MaskedSvgIcon src={imageUrl} size={iconSize} alt='Result Icon' color={type === 'correct' ? 'bg-green-800' : type === 'incorrect' ? 'bg-red-800' : 'bg-cyan-300'} />
                </div>
                <div className="flex-1 flex flex-col items-start justify-center pl-4 border-l-4 border-[var(--background)] self-stretch -my-2 py-2">
                    <div>{text || <em className="text-muted-foreground">empty</em>}</div>
                </div>
            </div>
        </div>
    )
}