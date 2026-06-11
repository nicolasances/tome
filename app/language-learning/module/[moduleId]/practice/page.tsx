'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomePracticeSessionAPI, Exercise, PracticeSession } from '@/api/TomePracticeSessionAPI';
import { reconstructSessionState } from '@/utils/reconstructSessionState';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { ResultSheet } from './components/ResultSheet';
import { ExMultipleChoice } from './components/ExMultipleChoice';
import { ExSentenceReorder } from './components/ExSentenceReorder';
import { ExFillBlank } from './components/ExFillBlank';
import { ExConjugation } from './components/ExConjugation';
import { ExErrorCorrection } from './components/ExErrorCorrection';
import { ExTranslation } from './components/ExTranslation';

// ─── Types ────────────────────────────────────────────────────────────────────

type LoadState = 'loading' | 'error' | 'loaded';

const EXERCISE_LABELS: Record<string, string> = {
    multiple_choice:    'Choose the correct word',
    sentence_reorder:   'Arrange the words',
    fill_blank:         'Complete the sentence',
    conjugation_drill:  'Give the right form',
    error_correction:   'Spot & fix the mistake',
    translation_active: 'Translate to Danish',
};

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

            const result = await new TomePracticeSessionAPI().startPracticeSession(me.id, moduleId);
            if (!result) { setLoadState('error'); return; }

            if (result.resumed) {
                resumeSession(me.id, result.session);
            } else {
                initFreshSession(me.id, result.session.sessionId, result.session.exercises);
            }
        }
        load().catch(() => setLoadState('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId]);

    /** Initialises state for a brand-new session (no prior answers). */
    function initFreshSession(uid: string, sid: string, exs: Exercise[]) {
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

    /**
     * Restores client-side presentation state from a resumed PracticeSession.
     *
     * IMPORTANT: never infers session completion from the reconstructed state. A resumed
     * session is only "finished" when the backend has already set `completedAt`. Calling
     * `/complete` here based on an empty reconstructed queue would destroy an active session
     * (the backend would mark it complete and the next start would create a brand-new one).
     */
    function resumeSession(uid: string, session: PracticeSession) {
        // The backend already marked this session complete — start the next one fresh.
        if (session.completedAt !== null) {
            initFreshSessionAfterComplete(uid);
            return;
        }

        const state = reconstructSessionState(session);

        setUserId(uid);
        setSessionId(session.sessionId);
        setExercises(session.exercises);
        setQueue(state.queue);
        setPendingRetry(state.pendingRetry);
        setIsRetryPhase(state.isRetryPhase);
        setMasteredCount(state.masteredCount);
        setExerciseNumber(state.exerciseNumber);
        setSubmissionState(null);
        setInputValue('');
        setSelectedOption(null);
        setBuiltWords([]);
        localStorage.setItem(storageKey(moduleId), session.sessionId);
        setLoadState('loaded');
    }

    /**
     * Starts a fresh session for the module — used when a resumed session turns out to be
     * already completed on the backend (the normal multi-session loop continues on the overview
     * if coverage is met, otherwise a new session is the right next step).
     */
    async function initFreshSessionAfterComplete(uid: string) {
        localStorage.removeItem(storageKey(moduleId));
        try {
            const started = await new TomePracticeSessionAPI().startPracticeSession(uid, moduleId);
            if (started && !started.resumed) {
                initFreshSession(uid, started.session.sessionId, started.session.exercises);
            } else {
                // Either an error, or another active session surfaced — surface as error rather
                // than risk an unexpected state.
                setLoadState('error');
            }
        } catch {
            setLoadState('error');
        }
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
                if (!started) { setLoadState('error'); }
                else if (started.resumed) { resumeSession(userId, started.session); }
                else { initFreshSession(userId, started.session.sessionId, started.session.exercises); }
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
                            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">{EXERCISE_LABELS[currentExercise.type] ?? 'Practice'}</span>
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
                        {currentExercise.type === 'sentence_reorder' && (
                            <ExSentenceReorder
                                exercise={currentExercise}
                                submissionState={submissionState}
                                builtWords={builtWords}
                                onToggleWord={w => setBuiltWords(prev =>
                                    prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w]
                                )}
                                onCheck={handleCheck}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {currentExercise.type === 'fill_blank' && (
                            <ExFillBlank
                                exercise={currentExercise}
                                submissionState={submissionState}
                                inputValue={inputValue}
                                onInputChange={setInputValue}
                                onSend={handleSend}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {currentExercise.type === 'conjugation_drill' && (
                            <ExConjugation
                                exercise={currentExercise}
                                submissionState={submissionState}
                                inputValue={inputValue}
                                onInputChange={setInputValue}
                                onSend={handleSend}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {currentExercise.type === 'error_correction' && (
                            <ExErrorCorrection
                                exercise={currentExercise}
                                submissionState={submissionState}
                                inputValue={inputValue}
                                onInputChange={setInputValue}
                                onCheck={handleCheck}
                                isSubmitting={isSubmitting}
                            />
                        )}
                        {currentExercise.type === 'translation_active' && (
                            <ExTranslation
                                exercise={currentExercise}
                                submissionState={submissionState}
                                inputValue={inputValue}
                                onInputChange={setInputValue}
                                onSend={handleSend}
                                isSubmitting={isSubmitting}
                            />
                        )}
                    </div>

                    {/* Result sheet overlay */}
                    {submissionState && (
                        <ResultSheet
                            ok={submissionState.isCorrect}
                            answer={submissionState.isCorrect ? undefined : submissionState.correctAnswer}
                            exercise={currentExercise}
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
