'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomeModuleAPI, ModuleResponse } from '@/api/TomeModuleAPI';
import { TomeModuleTestAPI, TestEligibilityResponse, SubmitTestResponse, TestReviewItem, TestAttempt } from '@/api/TomeModuleTestAPI';
import { Exercise } from '@/api/TomePracticeSessionAPI';
import { TestLocked } from './components/TestLocked';
import { TestReady } from './components/TestReady';
import { TestSubmit } from './components/TestSubmit';
import { TestResult } from './components/TestResult';
import { TestReview } from './components/TestReview';
import { ExMultipleChoice } from '../practice/components/ExMultipleChoice';
import { ExSentenceReorder } from '../practice/components/ExSentenceReorder';
import { ExFillBlank } from '../practice/components/ExFillBlank';
import { ExConjugation } from '../practice/components/ExConjugation';
import { ExErrorCorrection } from '../practice/components/ExErrorCorrection';
import { ExTranslation } from '../practice/components/ExTranslation';
import { ResultSheet } from '../practice/components/ResultSheet';
import { AIVerifyTray } from '../practice/components/AIVerifyTray';
import { useAnswerVerification } from '@/utils/useAnswerVerification';

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'error' | 'locked' | 'ready' | 'in-test' | 'submit' | 'result' | 'review';
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

export default function ModuleTestPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();
    const moduleId = params.moduleId as string;

    const [phase, setPhase] = useState<Phase>('loading');

    // Base data
    const [userId, setUserId] = useState('');
    const [cefrLevel, setCefrLevel] = useState('');
    const [moduleData, setModuleData] = useState<ModuleResponse | null>(null);

    // AI answer verification ("Check with AI")
    const verification = useAnswerVerification();
    const [kicker, setKicker] = useState('');
    const [moduleNumber, setModuleNumber] = useState('01');
    const [eligibility, setEligibility] = useState<TestEligibilityResponse | null>(null);

    // Test session
    const [attemptId, setAttemptId] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [answeredCount, setAnsweredCount] = useState(0);

    // Per-exercise
    const [submissionState, setSubmissionState] = useState<SubmissionState | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [builtWords, setBuiltWords] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Result / review
    const [submitResult, setSubmitResult] = useState<SubmitTestResponse | null>(null);
    const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
    const [testRetryAvailableAt, setTestRetryAvailableAt] = useState<string | undefined>(undefined);
    const [reviewItems, setReviewItems] = useState<TestReviewItem[] | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmittingTest, setIsSubmittingTest] = useState(false);

    // ── Header ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: phase === 'review' ? 'Review' : 'Module Test',
            backButton: { enabled: true, onClick: () => router.push(`/language-learning/module/${moduleId}`) },
        });
    }, [phase, setConfig, router, moduleId]);

    // ── Initial load ──────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            const [me, mod, progress] = await Promise.all([
                new TomeLearningDashboardAPI().getMe(),
                new TomeModuleAPI().getModule(moduleId),
                new TomeLearningDashboardAPI().getMeProgress(),
            ]);

            const idx = progress.modules.findIndex(m => m.moduleId === moduleId);
            const num = idx >= 0 ? String(idx + 1).padStart(2, '0') : '01';

            setUserId(me.id);
            setCefrLevel(me.cefrLevel);
            setModuleData(mod);
            setKicker(`${mod.cefrLevel}·${num} · ${mod.theme}`);
            setModuleNumber(num);

            const elig = await new TomeModuleTestAPI().getTestEligibility(me.id, moduleId);
            setEligibility(elig);

            if (!elig.eligible) {
                const lockTime = elig.testUnlocksAt ?? elig.testRetryAvailableAt;
                if (lockTime && new Date(lockTime) > new Date()) {
                    setPhase('locked');
                } else {
                    router.push(`/language-learning/module/${moduleId}`);
                }
                return;
            }

            setPhase('ready');
        }
        load().catch(() => setPhase('error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId]);

    // ── Start test ────────────────────────────────────────────────────────────
    async function handleStartTest() {
        setIsStarting(true);
        try {
            const result = await new TomeModuleTestAPI().startTest(userId, moduleId);
            setAttemptId(result.attemptId);
            setExercises(result.exercises);
            setSubmissionState(null);
            setInputValue('');
            setSelectedOption(null);
            setBuiltWords([]);

            if ('answers' in result) {
                // Resume: 409 path returned full TestAttempt
                const attempt = result as TestAttempt;
                const pos = attempt.answers.length;
                const correctSoFar = attempt.answers.filter(a => a.isCorrect).length;
                setAnsweredCount(pos);
                setCorrectAnswerCount(correctSoFar);
                setPhase(pos >= attempt.exercises.length ? 'submit' : 'in-test');
            } else {
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
            const result = await new TomeModuleTestAPI().submitAnswer(userId, attemptId, currentExercise.id, userAnswer);
            setSubmissionState(result);
        } finally { setIsSubmitting(false); }
    }

    function handleCheck(overrideAnswer?: string) {
        if (!currentExercise) return;
        if (currentExercise.type === 'multiple_choice') handleSubmitAnswer(overrideAnswer ?? selectedOption ?? '');
        else if (currentExercise.type === 'sentence_reorder') handleSubmitAnswer(builtWords.join(' '));
        else if (currentExercise.type === 'error_correction') handleSubmitAnswer(inputValue);
    }

    function handleSend() { handleSubmitAnswer(inputValue); }

    // ── AI answer verification ("Check with AI") ──────────────────────────────
    function handleAiVerify() {
        if (!currentExercise || !submissionState) return;
        verification.verify({ exerciseId: currentExercise.id, userAnswer: inputValue, sessionId: attemptId, cefrLevel });
    }

    // ── Continue (single-pass: no retry queue) ────────────────────────────────
    // overrideCorrect overturns the verdict when AI accepts a wrong answer (valid: true).
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
            const result = await new TomeModuleTestAPI().submitTest(userId, attemptId);
            setSubmitResult(result);
            if (!result.passed) {
                const elig = await new TomeModuleTestAPI().getTestEligibility(userId, moduleId);
                setTestRetryAvailableAt(elig.testRetryAvailableAt);
            }
            setPhase('result');
        } catch { setPhase('error'); } finally { setIsSubmittingTest(false); }
    }

    // ── Open review ───────────────────────────────────────────────────────────
    async function handleOpenReview() {
        try {
            const { questions } = await new TomeModuleTestAPI().getReview(userId, attemptId);
            setReviewItems(questions);
            setPhase('review');
        } catch { setPhase('error'); }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    const lockTimestamp = eligibility?.testUnlocksAt ?? eligibility?.testRetryAvailableAt ?? '';

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full mt-4">

            {phase === 'loading' && (
                <div className="flex flex-1 flex-col px-5 pt-2 gap-4" aria-busy="true" aria-label="Loading module test">
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

            {phase === 'locked' && lockTimestamp && <TestLocked lockTimestamp={lockTimestamp} />}

            {phase === 'ready' && moduleData && (
                <TestReady
                    kicker={kicker}
                    title={moduleData.title}
                    questionCount={moduleData.testQuestionCount}
                    passThreshold={moduleData.testPassThreshold}
                    onStart={handleStartTest}
                    isStarting={isStarting}
                />
            )}

            {phase === 'in-test' && currentExercise && (
                <div className="relative flex flex-1 flex-col overflow-hidden">
                    <div className="px-5 pt-2">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">{kicker}</span>
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
                            <ExSentenceReorder exercise={currentExercise} submissionState={submissionState} builtWords={builtWords} onToggleWord={w => setBuiltWords(prev => prev.includes(w) ? prev.filter(x => x !== w) : [...prev, w])} onCheck={handleCheck} isSubmitting={isSubmitting} />
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

                    {submissionState && verification.phase === null && (
                        <ResultSheet
                            ok={submissionState.isCorrect}
                            answer={submissionState.correctAnswer}
                            userAnswer={inputValue}
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

            {phase === 'submit' && (
                <TestSubmit totalCount={exercises.length} onSubmit={handleSubmitTest} isSubmitting={isSubmittingTest} />
            )}

            {phase === 'result' && submitResult && moduleData && (
                <TestResult
                    result={submitResult}
                    passThreshold={moduleData.testPassThreshold}
                    moduleNumber={moduleNumber}
                    correctCount={correctAnswerCount}
                    totalCount={exercises.length}
                    testRetryAvailableAt={testRetryAvailableAt}
                    onReview={handleOpenReview}
                    onHome={() => router.push('/language-learning')}
                />
            )}

            {phase === 'review' && reviewItems && (
                <TestReview kicker={kicker} items={reviewItems} />
            )}
        </div>
    );
}
