'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomePracticeSessionAPI, Exercise } from '@/api/TomePracticeSessionAPI';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { ResultSheet } from './components/ResultSheet';
import { ExMultipleChoice } from './components/ExMultipleChoice';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'error' | 'loaded';

export type SubmissionState = { isCorrect: boolean; correctAnswer: string };

function storageKey(moduleId: string) { return `practice-session-${moduleId}`; }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticePage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();
    const moduleId = params.moduleId as string;

    // ── Session data ──────────────────────────────────────────────────────────
    const [sessionId, setSessionId] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [userId, setUserId] = useState('');

    // ── Queue management ──────────────────────────────────────────────────────
    // queue: ordered exercise IDs still to present in the current pass
    const [queue, setQueue] = useState<string[]>([]);
    // pendingRetry: wrong exercise IDs accumulated during the main pass
    const [pendingRetry, setPendingRetry] = useState<string[]>([]);
    const [isRetryPhase, setIsRetryPhase] = useState(false);
    const [masteredCount, setMasteredCount] = useState(0);
    const [exerciseNumber, setExerciseNumber] = useState(1);

    // ── Per-exercise state (reset on each new exercise) ───────────────────────
    const [submissionState, setSubmissionState] = useState<SubmissionState | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [builtWords, setBuiltWords] = useState<string[]>([]);

    // ── Page meta state ───────────────────────────────────────────────────────
    const [loadState, setLoadState] = useState<LoadState>('loading');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // ── Header ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: 'Practice',
            backButton: { enabled: true, onClick: () => router.push(`/language-learning/module/${moduleId}`) },
        });
    }, [setConfig, router, moduleId]);

    // ── Session load / resume ─────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            const me = await new TomeLearningDashboardAPI().getMe();
            setUserId(me.id);

            const stored = localStorage.getItem(storageKey(moduleId));
            if (stored) {
                const session = await new TomePracticeSessionAPI().getSession(me.id, stored);
                if (session) { initSession(me.id, session.sessionId, session.exercises); return; }
                localStorage.removeItem(storageKey(moduleId));
            }

            const started = await new TomePracticeSessionAPI().startPracticeSession(me.id, moduleId);
            if (!started) { setLoadState('error'); return; }
            initSession(me.id, started.sessionId, started.exercises);
        }
        load().catch(() => setLoadState('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId]);

    function initSession(uid: string, sid: string, exs: Exercise[]) {
        setUserId(uid);
        setSessionId(sid);
        setExercises(exs);
        setQueue(exs.map(e => e.id));
        setPendingRetry([]);
        setIsRetryPhase(false);
        setMasteredCount(0);
        setExerciseNumber(1);
        setSubmissionState(null);
        setInputValue('');
        setSelectedOption(null);
        setBuiltWords([]);
        localStorage.setItem(storageKey(moduleId), sid);
        setLoadState('loaded');
    }

    // ── Derived ───────────────────────────────────────────────────────────────
    const exerciseMap = useMemo(() => new Map(exercises.map(e => [e.id, e])), [exercises]);
    const currentExercise = queue.length > 0 ? exerciseMap.get(queue[0]) ?? null : null;
    const totalExercises = exercises.length;
    const deferredCount = isRetryPhase ? queue.length : pendingRetry.length;

    // ── Answer submission ─────────────────────────────────────────────────────
    async function handleSubmit(userAnswer: string) {
        if (!currentExercise || isSubmitting || submissionState) return;
        setIsSubmitting(true);
        try {
            const result = await new TomePracticeSessionAPI().submitAnswer(userId, sessionId, currentExercise.id, userAnswer);
            setSubmissionState(result);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleCheck() {
        if (!currentExercise) return;
        switch (currentExercise.type) {
            case 'multiple_choice': handleSubmit(selectedOption ?? ''); break;
            case 'sentence_reorder': handleSubmit(builtWords.join(' ')); break;
            case 'error_correction': handleSubmit(inputValue); break;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function handleSend() { handleSubmit(inputValue); }

    // ── Continue (advance to next exercise) ───────────────────────────────────
    async function handleContinue() {
        if (!submissionState) return;

        const currentId = queue[0];
        const wasCorrect = submissionState.isCorrect;

        if (wasCorrect) setMasteredCount(c => c + 1);
        setExerciseNumber(n => Math.min(n + 1, totalExercises));

        if (isRetryPhase) {
            const newQueue = wasCorrect ? queue.slice(1) : [...queue.slice(1), currentId];
            if (newQueue.length === 0) { await doCompleteSession(); return; }
            setQueue(newQueue);
        } else {
            const newPending = wasCorrect ? pendingRetry : [...pendingRetry, currentId];
            const newQueue = queue.slice(1);
            if (newQueue.length === 0) {
                if (newPending.length > 0) {
                    setQueue(newPending);
                    setPendingRetry([]);
                    setIsRetryPhase(true);
                } else {
                    await doCompleteSession();
                    return;
                }
            } else {
                setQueue(newQueue);
                setPendingRetry(newPending);
            }
        }

        setSubmissionState(null);
        setInputValue('');
        setSelectedOption(null);
        setBuiltWords([]);
    }

    async function doCompleteSession() {
        setIsCompleting(true);
        try {
            const result = await new TomePracticeSessionAPI().completeSession(userId, sessionId);
            localStorage.removeItem(storageKey(moduleId));
            if (result.step2Complete) {
                router.push(`/language-learning/module/${moduleId}`);
            } else {
                const started = await new TomePracticeSessionAPI().startPracticeSession(userId, moduleId);
                if (started) { initSession(userId, started.sessionId, started.exercises); }
                else { setLoadState('error'); }
            }
        } catch {
            setLoadState('error');
        } finally {
            setIsCompleting(false);
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">

            {loadState === 'loading' && (
                <div className="flex flex-1 flex-col px-5 pt-2 gap-4" aria-busy="true" aria-label="Loading practice session">
                    <div className="h-6 w-full rounded-full skeleton-shimmer" />
                    <div className="flex justify-between mt-1">
                        <div className="h-3 w-16 rounded-md skeleton-shimmer" />
                        <div className="h-3 w-10 rounded-md skeleton-shimmer" />
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="h-8 w-3/4 mx-auto rounded-md skeleton-shimmer" />
                        <div className="h-4 w-1/2 mx-auto rounded-md skeleton-shimmer" />
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="h-14 w-full rounded-xl skeleton-shimmer" />
                        ))}
                    </div>
                </div>
            )}

            {loadState === 'error' && (
                <div className="flex flex-1 flex-col px-5 pt-4">
                    <p className="text-sm text-cyan-600">Failed to load practice session. Please try again.</p>
                </div>
            )}

            {loadState === 'loaded' && currentExercise && (
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    {/* Progress bar + counter */}
                    <div className="px-5 pt-2">
                        <SessionProgressBar total={totalExercises} mastered={masteredCount} deferred={deferredCount} />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Practice</span>
                            <span className="text-xs font-bold text-black/60">{exerciseNumber} / {totalExercises}</span>
                        </div>
                    </div>

                    {/* Exercise body */}
                    <div className="flex flex-1 flex-col px-5 pt-4 pb-0 overflow-y-auto">
                        {currentExercise.type === 'multiple_choice' && (
                            <ExMultipleChoice
                                exercise={currentExercise}
                                submissionState={submissionState}
                                selectedOption={selectedOption}
                                onSelect={setSelectedOption}
                                onCheck={handleCheck}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {/* Remaining exercise types added in Tasks 4–8 */}
                        {currentExercise.type !== 'multiple_choice' && (
                            <div className="flex flex-1 items-center justify-center text-black/40 text-sm">
                                {currentExercise.type} — coming soon
                            </div>
                        )}
                    </div>

                    {/* Result sheet overlay */}
                    {submissionState && (
                        <ResultSheet
                            ok={submissionState.isCorrect}
                            answer={submissionState.isCorrect ? undefined : submissionState.correctAnswer}
                            aiVerify={currentExercise.type === 'translation_active' && !submissionState.isCorrect}
                            onContinue={handleContinue}
                        />
                    )}
                </div>
            )}

            {isCompleting && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <span className="text-sm text-cyan-700">Saving progress…</span>
                </div>
            )}
        </div>
    );
}
