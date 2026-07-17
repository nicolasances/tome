'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI, CefrLevel, MeProgressResponse } from '@/api/TomeLearningDashboardAPI';
import { TomeLevelTestAPI, LevelTestEligibilityResponse, SubmitLevelTestResponse, LevelTestReviewItem, LevelTestAttempt } from '@/api/TomeLevelTestAPI';
import { Exercise } from '@/api/TomePracticeSessionAPI';
import { toggleWordId, resolveBuiltWords } from '@/utils/sentenceReorderWords';
import { LevelTestReady, LEVEL_TEST_PASS_THRESHOLD } from './components/LevelTestReady';
import { LevelTestPass } from './components/LevelTestPass';
import { TestSubmit } from '../module/[moduleId]/test/components/TestSubmit';
import { TestResult } from '../module/[moduleId]/test/components/TestResult';
import { TestReview } from '../module/[moduleId]/test/components/TestReview';
import { ExMultipleChoice } from '../module/[moduleId]/practice/components/ExMultipleChoice';
import { ExSentenceReorder } from '../module/[moduleId]/practice/components/ExSentenceReorder';
import { ExFillBlank } from '../module/[moduleId]/practice/components/ExFillBlank';
import { ExConjugation } from '../module/[moduleId]/practice/components/ExConjugation';
import { ExErrorCorrection } from '../module/[moduleId]/practice/components/ExErrorCorrection';
import { ExTranslation } from '../module/[moduleId]/practice/components/ExTranslation';
import { ResultSheet } from '../module/[moduleId]/practice/components/ResultSheet';
import { AIVerifyTray } from '../module/[moduleId]/practice/components/AIVerifyTray';
import { useAnswerVerification } from '@/utils/useAnswerVerification';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'error' | 'ready' | 'in-test' | 'submit' | 'result' | 'review';
export type SubmissionState = { isCorrect: boolean; correctAnswer: string };

const EXERCISE_LABELS: Record<string, string> = {
    multiple_choice: 'Choose the correct word',
    sentence_reorder: 'Arrange the words',
    fill_blank: 'Complete the sentence',
    conjugation_drill: 'Give the right form',
    error_correction: 'Spot & fix the mistake',
    translation_active: 'Translate to Danish',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LevelTestPage() {
    const router = useRouter();
    const { setConfig } = useHeader();

    const [phase, setPhase] = useState<Phase>('loading');

    // Base data
    const [userId, setUserId] = useState('');
    const [cefrLevel, setCefrLevel] = useState<CefrLevel | null>(null);
    const [progress, setProgress] = useState<MeProgressResponse | null>(null);

    // AI answer verification ("Check with AI") — always stubbed off for the Level Test (OQ-2)
    const verification = useAnswerVerification();

    // Test session
    const [attemptId, setAttemptId] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [answeredCount, setAnsweredCount] = useState(0);

    // Per-exercise
    const [submissionState, setSubmissionState] = useState<SubmissionState | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [builtWords, setBuiltWords] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result / review
    const [submitResult, setSubmitResult] = useState<SubmitLevelTestResponse | null>(null);
    const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
    const [retryAvailableAt, setRetryAvailableAt] = useState<string | undefined>(undefined);
    const [reviewItems, setReviewItems] = useState<LevelTestReviewItem[] | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmittingTest, setIsSubmittingTest] = useState(false);

    // ── Header ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: phase === 'review' ? 'Review' : 'Level Test',
            backButton: { enabled: true, onClick: () => router.push('/language-learning') },
        });
    }, [phase, setConfig, router]);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            const me = await new TomeLearningDashboardAPI().getMe();
            setUserId(me.id);
            setCefrLevel(me.cefrLevel as CefrLevel);

            const [prog, elig] = await Promise.all([
                new TomeLearningDashboardAPI().getMeProgress(),
                new TomeLevelTestAPI().getLevelTestEligibility(me.id),
            ]);
            setProgress(prog);

            if (!elig.eligible) {
                router.push('/language-learning');
                return;
            }

            if (elig.activeAttemptId) {
                const attempt = await new TomeLevelTestAPI().getLevelTest(me.id, elig.activeAttemptId);
                applyResumedAttempt(attempt);
                return;
            }

            setPhase('ready');
        }
        load().catch(() => setPhase('error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function applyResumedAttempt(attempt: LevelTestAttempt) {
        setAttemptId(attempt.attemptId);
        setExercises(attempt.exercises);
        const pos = attempt.answers.length;
        const correctSoFar = attempt.answers.filter(a => a.isCorrect).length;
        setAnsweredCount(pos);
        setCorrectAnswerCount(correctSoFar);
        setPhase(pos >= attempt.exercises.length ? 'submit' : 'in-test');
    }

    // ── Start test ────────────────────────────────────────────────────────────
    async function handleStartTest() {
        setIsStarting(true);
        try {
            const result = await new TomeLevelTestAPI().startLevelTest(userId);
            setSubmissionState(null);
            setInputValue('');
            setSelectedOption(null);
            setBuiltWords([]);

            if ('answers' in result) {
                // Resume: 409 path returned the full LevelTestAttempt
                applyResumedAttempt(result as LevelTestAttempt);
            } else {
                setAttemptId(result.attemptId);
                setExercises(result.exercises);
                setAnsweredCount(0);
                setCorrectAnswerCount(0);
                setPhase('in-test');
            }
        } catch { setPhase('error'); } finally { setIsStarting(false); }
    }

    // ── Per-answer flow ───────────────────────────────────────────────────────
    const currentExercise = exercises[answeredCount] ?? null;

    async function handleSubmitAnswer(userAnswer: string) {
        if (isSubmitting || submissionState || !currentExercise) return;
        setIsSubmitting(true);
        try {
            const result = await new TomeLevelTestAPI().submitLevelTestAnswer(userId, attemptId, currentExercise.id, userAnswer);
            setSubmissionState(result);
        } finally { setIsSubmitting(false); }
    }

    function handleCheck(overrideAnswer?: string) {
        if (!currentExercise) return;
        if (currentExercise.type === 'multiple_choice') handleSubmitAnswer(overrideAnswer ?? selectedOption ?? '');
        else if (currentExercise.type === 'sentence_reorder') handleSubmitAnswer(resolveBuiltWords(currentExercise.words ?? [], builtWords).join(' '));
        else if (currentExercise.type === 'error_correction') handleSubmitAnswer(inputValue);
    }

    function handleSend() { handleSubmitAnswer(inputValue); }

    // ── Continue (single-pass: no retry queue) ────────────────────────────────
    function handleContinue(overrideCorrect?: boolean) {
        if (!submissionState) return;
        verification.reset();
        if (overrideCorrect ?? submissionState.isCorrect) setCorrectAnswerCount(prev => prev + 1);
        const next = answeredCount + 1;
        setAnsweredCount(next);
        setSubmissionState(null);
        setInputValue('');
        setSelectedOption(null);
        setBuiltWords([]);
        if (next >= exercises.length) setPhase('submit');
    }

    // ── Submit test ───────────────────────────────────────────────────────────
    async function handleSubmitTest() {
        setIsSubmittingTest(true);
        try {
            const result = await new TomeLevelTestAPI().submitLevelTest(userId, attemptId);
            setSubmitResult(result);
            if (!result.passed) {
                const elig: LevelTestEligibilityResponse = await new TomeLevelTestAPI().getLevelTestEligibility(userId);
                setRetryAvailableAt(elig.retryAvailableAt);
            }
            setPhase('result');
        } catch { setPhase('error'); } finally { setIsSubmittingTest(false); }
    }

    // ── Open review ───────────────────────────────────────────────────────────
    async function handleOpenReview() {
        try {
            const { questions } = await new TomeLevelTestAPI().getLevelTestReview(userId, attemptId);
            setReviewItems(questions);
            setPhase('review');
        } catch { setPhase('error'); }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full mt-4">

            {phase === 'loading' && (
                <div className="flex flex-1 flex-col px-5 pt-2 gap-4" aria-busy="true" aria-label="Loading level test">
                    <div className="h-6 w-full rounded-full skeleton-shimmer" />
                    <div className="flex justify-between mt-1">
                        <div className="h-3 w-16 rounded-md skeleton-shimmer" />
                        <div className="h-3 w-10 rounded-md skeleton-shimmer" />
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <div className="h-8 w-3/4 mx-auto rounded-md skeleton-shimmer" />
                        {[0, 1, 2, 3].map(i => <div key={i} className="h-14 w-full rounded-xl skeleton-shimmer" />)}
                    </div>
                </div>
            )}

            {phase === 'error' && (
                <div className="flex flex-1 flex-col px-5 pt-4">
                    <p className="text-sm text-cyan-600">Something went wrong. Please go back and try again.</p>
                </div>
            )}

            {phase === 'ready' && cefrLevel && (
                <LevelTestReady currentCefrLevel={cefrLevel} onStart={handleStartTest} isStarting={isStarting} />
            )}

            {phase === 'in-test' && currentExercise && (
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    <div className="px-5 pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Level Test</span>
                            <span className="text-xs font-bold text-black/60">{answeredCount + 1} / {exercises.length}</span>
                        </div>
                        <div className="w-full h-3 rounded-full border-2 border-cyan-400 p-0.5">
                            <div className="flex h-full overflow-hidden rounded-full bg-black/10">
                                <div
                                    className="h-full rounded-full bg-cyan-800 transition-all duration-300"
                                    style={{ width: `${(answeredCount / exercises.length) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-black/50 mt-2 block">
                            {EXERCISE_LABELS[currentExercise.type] ?? 'Answer'}
                        </span>
                    </div>

                    <div className="flex flex-1 flex-col px-5 pt-4 pb-0 overflow-y-auto">
                        {currentExercise.type === 'multiple_choice' && (
                            <ExMultipleChoice exercise={currentExercise} submissionState={submissionState} selectedOption={selectedOption} onSelect={setSelectedOption} onCheck={handleCheck} isSubmitting={isSubmitting} />
                        )}
                        {currentExercise.type === 'sentence_reorder' && (
                            <ExSentenceReorder exercise={currentExercise} submissionState={submissionState} builtWordIds={builtWords} onToggleWord={id => setBuiltWords(prev => toggleWordId(prev, id))} onCheck={handleCheck} isSubmitting={isSubmitting} />
                        )}
                        {currentExercise.type === 'fill_blank' && (
                            <ExFillBlank exercise={currentExercise} submissionState={submissionState} inputValue={inputValue} onInputChange={setInputValue} onSend={handleSend} isSubmitting={isSubmitting} />
                        )}
                        {currentExercise.type === 'conjugation_drill' && (
                            <ExConjugation exercise={currentExercise} submissionState={submissionState} inputValue={inputValue} onInputChange={setInputValue} onSend={handleSend} isSubmitting={isSubmitting} />
                        )}
                        {currentExercise.type === 'error_correction' && (
                            <ExErrorCorrection exercise={currentExercise} submissionState={submissionState} inputValue={inputValue} onInputChange={setInputValue} onCheck={handleCheck} isSubmitting={isSubmitting} />
                        )}
                        {currentExercise.type === 'translation_active' && (
                            <ExTranslation exercise={currentExercise} submissionState={submissionState} inputValue={inputValue} onInputChange={setInputValue} onSend={handleSend} isSubmitting={isSubmitting} />
                        )}
                    </div>

                    {/* "Check with AI" is stubbed off (aiVerify always false) — the verify endpoint doesn't yet
                        accept a level-test attempt id (OQ-2, tracked in #310). */}
                    {submissionState && verification.phase === null && (
                        <ResultSheet
                            ok={submissionState.isCorrect}
                            answer={submissionState.correctAnswer}
                            userAnswer={inputValue}
                            exercise={currentExercise}
                            aiVerify={false}
                            onContinue={() => handleContinue()}
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

            {phase === 'submit' && (
                <TestSubmit totalCount={exercises.length} onSubmit={handleSubmitTest} isSubmitting={isSubmittingTest} />
            )}

            {phase === 'result' && submitResult && (
                <LevelTestResult
                    result={submitResult}
                    cefrLevel={cefrLevel}
                    progress={progress}
                    correctCount={correctAnswerCount}
                    totalCount={exercises.length}
                    retryAvailableAt={retryAvailableAt}
                    onReview={handleOpenReview}
                    onHome={() => router.push('/language-learning')}
                />
            )}

            {phase === 'review' && reviewItems && (
                <TestReview kicker="Level Test" items={reviewItems} />
            )}
        </div>
    );
}

// ─── Result phase ───────────────────────────────────────────────────────────
// On a pass, the promotion result (LevelTestPass) is new. On a fail, the
// existing Module Test's TestResult is reused as-is for its fail-path visuals
// (score ring, "So close", ThresholdBar, retry countdown) — it is never
// rendered here with `passed: true`, so its Home button never appears.

function LevelTestResult({result, cefrLevel, correctCount, totalCount, retryAvailableAt, onReview, onHome}: {
    result: SubmitLevelTestResponse;
    cefrLevel: CefrLevel | null;
    progress: MeProgressResponse | null;
    correctCount: number;
    totalCount: number;
    retryAvailableAt?: string;
    onReview: () => void;
    onHome: () => void;
}) {
    if (result.passed && cefrLevel) {
        return (
            <LevelTestPass
                score={result.score}
                correctCount={correctCount}
                totalCount={totalCount}
                fromLevel={cefrLevel}
                toLevel={result.advancedTo as CefrLevel | null}
                onStartNext={onHome}
                onReview={onReview}
            />
        );
    }

    return (
        <TestResult
            result={result}
            passThreshold={LEVEL_TEST_PASS_THRESHOLD}
            moduleNumber=""
            correctCount={correctCount}
            totalCount={totalCount}
            testRetryAvailableAt={retryAvailableAt}
            onReview={onReview}
            onHome={onHome}
        />
    );
}
