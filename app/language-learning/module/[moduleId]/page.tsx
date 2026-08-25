'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI, MeProgressResponse, ModuleProgressEntry, calculateModuleProgress } from '@/api/TomeLearningDashboardAPI';
import { TomeModuleAPI, ModuleResponse } from '@/api/TomeModuleAPI';
import { startPracticeAndGetSessionId } from '@/utils/startPractice';
import { deriveCtaInfo, formatCountdown, RE_PRACTICE_CTA } from '@/utils/moduleOverviewCta';
import { ModuleOverviewSkeleton } from './components/ModuleOverviewSkeleton';
import { ModuleHeader } from './components/ModuleHeader';
import { StepList, StepItem, StepState } from './components/StepList';
import { StepRailItem } from './components/StepRailItem';
import { FlowGrammarPane } from './components/FlowGrammarPane';
import { FlowPracticePane } from './components/FlowPracticePane';
import { FlowTestPane } from './components/FlowTestPane';
import ConfirmationPopup from '@/app/components/ConfirmationPopup';

interface PageData {
    module: ModuleResponse;
    progress: MeProgressResponse;
    userId: string;
}

function deriveStepStates(step: ModuleProgressEntry['step'], testUnlocksAt: string | null): { grammar: StepState; practice: StepState; test: StepState } {
    switch (step) {
        case 'practice':
            return { grammar: 'completed', practice: 'available', test: 'locked' };
        case 'test': {
            const testLocked = testUnlocksAt ? new Date(testUnlocksAt) > new Date() : false;
            return { grammar: 'completed', practice: 'completed', test: testLocked ? 'locked' : 'available' };
        }
        case 'done':
            return { grammar: 'completed', practice: 'completed', test: 'completed' };
        default:
            return { grammar: 'available', practice: 'upcoming', test: 'upcoming' };
    }
}

function deriveLockLabel(testState: StepState, step: ModuleProgressEntry['step'], testUnlocksAt: string | null, testUnlockDelayHours: number): string | undefined {
    if (testState === 'available' || testState === 'completed') return undefined;
    if (step === 'test' && testUnlocksAt && new Date(testUnlocksAt) > new Date()) return `Test unlocks in ${testUnlocksAt ? formatCountdown(testUnlocksAt) : ''}`;
    return `${testUnlockDelayHours}h after practice`;
}

type FlowStep = 'grammar' | 'practice' | 'test';

const FLOW_CTA: Record<FlowStep, string> = {
    grammar: 'Review grammar',
    practice: 'Continue practice',
    test: 'Start test',
};

function deriveDefaultStep(stepStates: { grammar: StepState; practice: StepState; test: StepState }): FlowStep {

    if (stepStates.practice === 'available') return 'practice';
    if (stepStates.grammar === 'available') return 'grammar';
    if (stepStates.test === 'available') return 'test';

    // If practice and grammar are completed, always return test
    if (stepStates.practice === 'completed' && stepStates.grammar === 'completed') return 'test';

    return 'grammar';
}

export default function ModuleOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();

    const moduleId = params.moduleId as string;

    const [data, setData] = useState<PageData | null | undefined>(undefined);
    const [isStartingPractice, setIsStartingPractice] = useState(false);
    const [selectedStep, setSelectedStep] = useState<FlowStep>('grammar');
    const [showRePracticeConfirmation, setShowRePracticeConfirmation] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetConflict, setResetConflict] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Module',
            backButton: { enabled: true, onClick: () => { router.push("/language-learning") } },
        });
    }, [setConfig, router]);

    useEffect(() => {
        Promise.all([
            new TomeModuleAPI().getModule(moduleId),
            new TomeLearningDashboardAPI().getMeProgress(),
            new TomeLearningDashboardAPI().getMe(),
        ]).then(([module, progress, me]) => {
            setData({ module, progress, userId: me.id });
        }).catch(() => setData(null));
    }, [moduleId]);

    const moduleProgress = data?.progress.modules.find(m => m.moduleId === moduleId) ?? null;
    const moduleIndex = data?.progress.modules.findIndex(m => m.moduleId === moduleId) ?? -1;
    const number = moduleIndex >= 0 ? String(moduleIndex + 1).padStart(2, '0') : '01';
    const kicker = data ? `${data.module.cefrLevel}·${number} · ${data.module.theme}` : '';

    const stepStates = moduleProgress
        ? deriveStepStates(moduleProgress.step, moduleProgress.testUnlocksAt)
        : { grammar: 'available' as StepState, practice: 'upcoming' as StepState, test: 'upcoming' as StepState };

    const testLockLabel = data
        ? deriveLockLabel(stepStates.test, moduleProgress?.step ?? null, moduleProgress?.testUnlocksAt ?? null, data.module.testUnlockDelayHours)
        : undefined;

    const steps: StepItem[] = data
        ? [
            { number: 1, title: 'Grammar', subtitle: `${data.module.grammarConceptIds?.length} concepts · learn the rules`, state: stepStates.grammar },
            { number: 2, title: 'Practice', subtitle: `${data.module.practiceSessionSize} exercises · no pressure`, state: stepStates.practice, coverage: stepStates.practice === 'available' && moduleProgress ? { progress: calculateModuleProgress(moduleProgress), currentRung: moduleProgress.currentRung, rungCovered: moduleProgress.currentRungCoverage.coveredCount, rungTotal: moduleProgress.currentRungCoverage.totalCount } : undefined },
            { number: 3, title: 'Module Test', subtitle: `${data.module.testQuestionCount ?? "?"} questions · ${data.module.testPassThreshold}% to pass`, state: stepStates.test, lockLabel: testLockLabel, onNavigate: stepStates.test === 'available' ? () => router.push(`/language-learning/module/${moduleId}/test`) : undefined },
        ]
        : [];

    const ctaStep = moduleProgress?.step ?? null;
    const cta = deriveCtaInfo(ctaStep, moduleProgress?.testUnlocksAt ?? null);

    // Set initial selected step based on progress
    useEffect(() => {
        if (data) setSelectedStep(deriveDefaultStep(stepStates));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const handleCtaClick = async () => {
        if (cta.disabled || !data) return;
        if (ctaStep === 'practice') {
            if (isStartingPractice) return;
            setIsStartingPractice(true);
            try {
                const sid = await startPracticeAndGetSessionId(data.userId, moduleId);
                if (!sid) { setIsStartingPractice(false); return; }
                router.push(`/language-learning/module/${moduleId}/practice/${sid}`);
            } catch { setIsStartingPractice(false); }
        } else if (ctaStep === 'test') {
            router.push(`/language-learning/module/${moduleId}/test`);
        } else if (ctaStep === 'done') {
            setShowRePracticeConfirmation(true);
        } else {
            router.push(`/language-learning/module/${moduleId}/grammar`);
        }
    };

    /**
     * Re-fetches /me/progress in place after a successful reset, so the module
     * renders as a fresh, first-pass module without navigating anywhere.
     */
    const refetchProgress = async () => {
        if (!data) return;
        const progress = await new TomeLearningDashboardAPI().getMeProgress();
        setData({ ...data, progress });
    };

    /**
     * Confirms the re-practice reset. A 409 means a practice session or test
     * attempt for this module is still open — that is a first-class state
     * (S5), not an error, and offers "Finish practice round" instead. Any
     * other failure leaves the page as it was, with an inline error (S6).
     */
    const handleRePracticeConfirm = async () => {
        if (!data) return;
        if (isResetting) return;

        setShowRePracticeConfirmation(false);
        setResetConflict(false);
        setResetError(null);
        setIsResetting(true);

        try {
            const result = await new TomeLearningDashboardAPI().rePractice(data.userId, moduleId);

            if (result.conflict) {
                setResetConflict(true);
                setIsResetting(false);
                return;
            }

            await refetchProgress();
            setIsResetting(false);
        } catch {
            setResetError('Could not reset this module. Please try again.');
            setIsResetting(false);
        }
    };

    /**
     * Start a new practice
     */
    const startNewPractice = async () => {

        if (!data) return;
        if (isStartingPractice) return;

        setIsStartingPractice(true);

        try {
            const sid = await startPracticeAndGetSessionId(data.userId, moduleId);
            if (!sid) { setIsStartingPractice(false); return; }
            router.push(`/language-learning/module/${moduleId}/practice/${sid}`);
        }
        catch { setIsStartingPractice(false); }
    }

    const handleDesktopCta = async () => {

        if (!data) return;

        if (ctaStep === 'done') {
            setShowRePracticeConfirmation(true);
            return;
        }

        if (selectedStep === 'grammar') {
            router.push(`/language-learning/module/${moduleId}/grammar`);
        }
        else if (selectedStep === 'practice') {
            await startNewPractice();
        }
        else if (selectedStep === 'test' && stepStates.test === 'available') {
            router.push(`/language-learning/module/${moduleId}/test`);
        }
        else if (selectedStep === 'test' && stepStates.test == 'locked' && stepStates.practice === 'completed') {
            // If test is locked but practice is completed, allow to start a new practice
            await startNewPractice();
        }
    };

    let desktopCtaLabel = FLOW_CTA[selectedStep];
    if (ctaStep === 'done') desktopCtaLabel = RE_PRACTICE_CTA.label;
    else if (selectedStep === 'test' && stepStates.test !== 'available') desktopCtaLabel = 'Keep practicing';
    else if (selectedStep === 'practice' && stepStates.practice == 'completed') desktopCtaLabel = 'Keep practicing';

    const stepNum = ctaStep === 'practice' ? 2 : ctaStep === 'test' ? 3 : ctaStep === 'done' ? 3 : 1;

    const railSteps: { id: FlowStep; number: number; title: string; subtitle: string; state: StepState }[] = data ? [
        { id: 'grammar', number: 1, title: 'Grammar', subtitle: `${data.module.grammarConceptIds?.length} concepts · learn the rules`, state: stepStates.grammar },
        { id: 'practice', number: 2, title: 'Practice', subtitle: `${data.module.practiceSessionSize} a round · no pressure`, state: stepStates.practice },
        { id: 'test', number: 3, title: 'Module Test', subtitle: `${data.module.testQuestionCount ?? '?'} questions · ${data.module.testPassThreshold}% to pass`, state: stepStates.test },
    ] : [];

    return (
        <div className="flex flex-1 flex-col items-stretch lg:items-center">

            {/* ═══ MOBILE LAYOUT ═══ */}
            <div className="flex flex-1 flex-col lg:hidden mt-4">
                <div className="flex flex-1 flex-col px-4 pt-1 pb-0 gap-0 overflow-y-auto">
                    {data === undefined && <ModuleOverviewSkeleton />}
                    {data === null && <p className="text-sm text-cyan-600 mt-4">Failed to load module. Please try again.</p>}
                    {data && (
                        <div className="flex flex-col">
                            <ModuleHeader kicker={kicker} title={data.module.title} communicationGoal={data.module.communicationGoal} />
                            <div className="mt-4">
                                <StepList steps={steps} />
                            </div>
                            {ctaStep === 'done' && (
                                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-700/20 p-4">
                                    <p className="text-sm font-bold text-black/80">Re-practice this module</p>
                                    <p className="text-sm text-black/70 mt-1">Starting over replays the grammar, practice and test from the beginning, and your current proficiency score is replaced by the new result.</p>
                                </div>
                            )}
                            <div className="flex-1" />
                        </div>
                    )}
                </div>
                {data && (
                    <div className="px-4 py-4">
                        {resetConflict && (
                            <div className="mb-3 rounded-xl border border-cyan-500/30 bg-cyan-700/20 p-4">
                                <p className="text-sm text-black/70">You have an unfinished practice round for this module. Finish it before re-practising.</p>
                                <button
                                    onClick={startNewPractice}
                                    disabled={isStartingPractice}
                                    className="text-sm font-bold text-cyan-800 underline mt-2 disabled:opacity-50"
                                >
                                    {isStartingPractice ? 'Resuming…' : 'Finish practice round'}
                                </button>
                            </div>
                        )}
                        {resetError && <p className="text-sm text-red-600 mb-3">{resetError}</p>}
                        <button
                            disabled={cta.disabled || isStartingPractice || isResetting}
                            onClick={handleCtaClick}
                            className={`w-full border-0 rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 tracking-wide transition-opacity duration-150 ${cta.disabled || isStartingPractice || isResetting ? 'opacity-50 cursor-default' : 'opacity-100 cursor-pointer'}`}
                        >
                            {isResetting ? 'Resetting…' : isStartingPractice ? 'Starting…' : cta.label}
                        </button>
                    </div>
                )}
            </div>

            {/* ═══ DESKTOP TWO-PANE LAYOUT ═══ */}
            <div className="hidden lg:flex flex-col w-full max-w-5xl px-12 pt-10 pb-14 overflow-y-auto">

                {data === undefined && <ModuleOverviewSkeleton />}
                {data === null && <p className="text-sm text-cyan-800 mt-4">Failed to load module. Please try again.</p>}

                {data && (
                    <div className="grid grid-cols-3 gap-7 items-start">
                        {/* LEFT RAIL */}
                        <div className="col-span-1">
                            <p className="text-xs font-semibold uppercase tracking-widest text-black/60 m-0">{kicker}</p>
                            <h1 className="text-3xl font-bold text-black leading-tight mt-2 m-0 p-0 border-0">{data.module.title}</h1>
                            <p className="text-sm text-black/70 leading-relaxed mt-2 m-0">{data.module.communicationGoal}</p>

                            <div className="flex flex-col gap-3 mt-6">
                                {railSteps.map((s) => (
                                    <StepRailItem
                                        key={s.id}
                                        number={s.number}
                                        title={s.title}
                                        subtitle={s.subtitle}
                                        state={s.state}
                                        selected={selectedStep === s.id}
                                        onClick={() => setSelectedStep(s.id)}
                                    />
                                ))}
                            </div>

                            {ctaStep === 'done' && (
                                <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-700/20 p-4">
                                    <p className="text-sm font-bold text-black/80">Re-practice this module</p>
                                    <p className="text-sm text-black/70 mt-1">Starting over replays the grammar, practice and test from the beginning, and your current proficiency score is replaced by the new result.</p>
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANE */}
                        <div className="col-span-2 rounded-2xl border border-cyan-500/30 bg-cyan-700/20 p-8 min-h-96 flex flex-col">
                            <div className="flex-1 flex items-start">
                                {selectedStep === 'grammar' && <FlowGrammarPane moduleId={moduleId} />}
                                {selectedStep === 'practice' && (
                                    <FlowPracticePane
                                        currentRung={moduleProgress?.currentRung ?? 1}
                                        rungCovered={moduleProgress?.currentRungCoverage.coveredCount ?? 0}
                                        rungTotal={moduleProgress?.currentRungCoverage.totalCount ?? 0}
                                        progress={moduleProgress ? calculateModuleProgress(moduleProgress) : 0}
                                        stepNumber={stepNum}
                                    />
                                )}
                                {selectedStep === 'test' && (
                                    <FlowTestPane
                                        testState={stepStates.test}
                                        lockLabel={testLockLabel}
                                        currentRung={moduleProgress?.currentRung ?? 1}
                                        rungCovered={moduleProgress?.currentRungCoverage.coveredCount ?? 0}
                                        rungTotal={moduleProgress?.currentRungCoverage.totalCount ?? 0}
                                        progress={moduleProgress ? calculateModuleProgress(moduleProgress) : 0}
                                        testUnlockDelayHours={data.module.testUnlockDelayHours}
                                    />
                                )}
                            </div>
                            {resetConflict && (
                                <div className="mt-4 rounded-xl border border-cyan-500/30 bg-cyan-800/20 p-4">
                                    <p className="text-sm text-black/70">You have an unfinished practice round for this module. Finish it before re-practising.</p>
                                    <button
                                        onClick={startNewPractice}
                                        disabled={isStartingPractice}
                                        className="text-sm font-bold text-cyan-800 underline mt-2 disabled:opacity-50"
                                    >
                                        {isStartingPractice ? 'Resuming…' : 'Finish practice round'}
                                    </button>
                                </div>
                            )}
                            {resetError && <p className="text-sm text-red-600 mt-4">{resetError}</p>}
                            <div className="flex justify-end mt-7">
                                <button
                                    onClick={handleDesktopCta}
                                    disabled={isStartingPractice || isResetting}
                                    className={`border-0 rounded-full bg-cyan-800 text-lime-200 font-bold text-base px-8 py-3.5 tracking-wide ${isStartingPractice || isResetting ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
                                >
                                    {isResetting ? 'Resetting…' : isStartingPractice ? 'Starting…' : desktopCtaLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showRePracticeConfirmation && (
                <ConfirmationPopup
                    message={
                        <div className="flex flex-col gap-2 text-left">
                            <p className="font-bold">Re-practice this module?</p>
                            <ul className="list-disc pl-5 text-sm text-black/70 flex flex-col gap-1">
                                <li>The module starts over from the grammar introduction — this is not a quick re-test.</li>
                                <li>This cannot be undone.</li>
                                <li>Your current proficiency score is hidden, and the level test is unavailable, until you complete the module again.</li>
                            </ul>
                        </div>
                    }
                    onConfirm={handleRePracticeConfirm}
                    onCancel={() => setShowRePracticeConfirmation(false)}
                />
            )}
        </div>
    );
}
