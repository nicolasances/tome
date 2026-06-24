'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomePracticeSessionAPI, Exercise } from '@/api/TomePracticeSessionAPI';
import { reconstructSessionState } from '@/utils/reconstructSessionState';
import { useAnswerVerification } from '@/utils/useAnswerVerification';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { ResultSheet } from '../components/ResultSheet';
import { AIVerifyTray } from '../components/AIVerifyTray';
import { ExMultipleChoice } from '../components/ExMultipleChoice';
import { ExSentenceReorder } from '../components/ExSentenceReorder';
import { ExFillBlank } from '../components/ExFillBlank';
import { ExConjugation } from '../components/ExConjugation';
import { ExErrorCorrection } from '../components/ExErrorCorrection';
import { ExTranslation } from '../components/ExTranslation';
import { SubmissionState } from '../types';

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticeSessionPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();
    const moduleId   = params.moduleId   as string;
    const practiceId = params.practiceId as string;

    // ── Session data ──────────────────────────────────────────────────────────
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [userId, setUserId] = useState('');
    const [cefrLevel, setCefrLevel] = useState('');
    const [prevCoveredCount, setPrevCoveredCount] = useState(0);

    // ── AI answer verification ("Check with AI") ──────────────────────────────
    const verification = useAnswerVerification();

    // ── Queue management ──────────────────────────────────────────────────────
    const [queue, setQueue] = useState<string[]>([]);
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

    // ── Header ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: 'Practice',
            backButton: { enabled: true, onClick: () => router.push(`/language-learning/module/${moduleId}`) },
        });
    }, [setConfig, router, moduleId]);

    // ── Session load ──────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            const me = await new TomeLearningDashboardAPI().getMe();
            const [session, progress] = await Promise.all([
                new TomePracticeSessionAPI().getSession(me.id, practiceId),
                new TomeLearningDashboardAPI().getMeProgress(),
            ]);

            if (!session) {
                router.push(`/language-learning/module/${moduleId}`);
                return;
            }
            if (session.completedAt !== null) {
                router.push(`/language-learning/module/${moduleId}/practice/${practiceId}/results`);
                return;
            }

            const moduleEntry = progress.modules.find(m => m.moduleId === moduleId);
            const coveredCount = moduleEntry?.vocabularyItemsPracticedCount ?? 0;

            const state = reconstructSessionState(session);

            setUserId(me.id);
            setCefrLevel(me.cefrLevel);
            setPrevCoveredCount(coveredCount);
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
            setLoadState('loaded');
        }
        load().catch(() => setLoadState('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId, practiceId]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const exerciseMap    = useMemo(() => new Map(exercises.map(e => [e.id, e])), [exercises]);
    const currentExercise = queue.length > 0 ? exerciseMap.get(queue[0]) ?? null : null;
    const totalExercises  = exercises.length;
    const deferredCount   = isRetryPhase ? queue.length : pendingRetry.length;

    // ── Answer submission ─────────────────────────────────────────────────────
    async function handleSubmit(userAnswer: string) {
        if (!currentExercise || isSubmitting || submissionState) return;
        setIsSubmitting(true);
        try {
            const result = await new TomePracticeSessionAPI().submitAnswer(userId, practiceId, currentExercise.id, userAnswer);
            setSubmissionState(result);
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleCheck(overrideAnswer?: string) {
        if (!currentExercise) return;
        switch (currentExercise.type) {
            case 'multiple_choice':   handleSubmit(overrideAnswer ?? selectedOption ?? ''); break;
            case 'sentence_reorder':  handleSubmit(builtWords.join(' ')); break;
            case 'error_correction':  handleSubmit(inputValue); break;
        }
    }

    function handleSend() { handleSubmit(inputValue); }

    // ── AI answer verification ("Check with AI") ──────────────────────────────
    function handleAiVerify() {
        if (!currentExercise || !submissionState) return;
        verification.verify({ exerciseId: currentExercise.id, userAnswer: inputValue, sessionId: practiceId, cefrLevel });
    }

    // ── Continue (advance to next exercise) ───────────────────────────────────
    // overrideCorrect overturns the verdict when AI accepts a wrong answer (valid: true).
    async function handleContinue(overrideCorrect?: boolean) {
        if (!submissionState) return;

        verification.reset();

        const currentId  = queue[0];
        const wasCorrect = overrideCorrect ?? submissionState.isCorrect;

        if (wasCorrect) setMasteredCount(c => c + 1);
        setExerciseNumber(n => Math.min(n + 1, totalExercises));

        if (isRetryPhase) {
            const newQueue = wasCorrect ? queue.slice(1) : [...queue.slice(1), currentId];
            if (newQueue.length === 0) { await doCompleteSession(); return; }
            setQueue(newQueue);
        } else {
            const newPending = wasCorrect ? pendingRetry : [...pendingRetry, currentId];
            const newQueue   = queue.slice(1);
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
        try {
            await new TomePracticeSessionAPI().completeSession(userId, practiceId);
            router.push(
                `/language-learning/module/${moduleId}/practice/${practiceId}/results?prevCovered=${prevCoveredCount}`
            );
        } catch {
            setLoadState('error');
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full lg:mt-8">

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

                    {/* Result sheet overlay (or the AI verification tray once "Check with AI" is tapped) */}
                    {submissionState && verification.phase === null && (
                        <ResultSheet
                            ok={submissionState.isCorrect}
                            answer={submissionState.isCorrect ? undefined : submissionState.correctAnswer}
                            exercise={currentExercise}
                            aiVerify={currentExercise.type === 'translation_active' && !submissionState.isCorrect}
                            onContinue={() => handleContinue()}
                            onAiVerify={handleAiVerify}
                        />
                    )}
                    {submissionState && verification.phase !== null && (
                        <AIVerifyTray
                            phase={verification.phase}
                            userAnswer={inputValue}
                            correctAnswer={submissionState.correctAnswer}
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
