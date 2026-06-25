'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI, MeProgressResponse, ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';
import { TomeModuleAPI, ModuleResponse } from '@/api/TomeModuleAPI';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { startPracticeAndGetSessionId } from '@/utils/startPractice';
import { ModuleOverviewSkeleton } from './components/ModuleOverviewSkeleton';
import { ModuleHeader } from './components/ModuleHeader';
import { StepList, StepItem, StepState } from './components/StepList';
import { StepRailItem } from './components/StepRailItem';
import { FlowGrammarPane } from './components/FlowGrammarPane';
import { FlowPracticePane } from './components/FlowPracticePane';
import { FlowTestPane } from './components/FlowTestPane';

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

function formatCountdown(testUnlocksAt: string): string {
    const ms = new Date(testUnlocksAt).getTime() - Date.now();
    if (ms <= 0) return '';
    const totalMinutes = Math.ceil(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

function deriveLockLabel(testState: StepState, step: ModuleProgressEntry['step'], testUnlocksAt: string | null, testUnlockDelayHours: number): string | undefined {
    if (testState === 'available' || testState === 'completed') return undefined;
    if (step === 'test' && testUnlocksAt && new Date(testUnlocksAt) > new Date()) return formatCountdown(testUnlocksAt);
    return `${testUnlockDelayHours}h after practice`;
}

function deriveCtaInfo(step: ModuleProgressEntry['step'], testUnlocksAt: string | null): { label: string; disabled: boolean } {
    switch (step) {
        case 'practice':
            return { label: 'Start practice', disabled: false };
        case 'test': {
            const testLocked = testUnlocksAt ? new Date(testUnlocksAt) > new Date() : false;
            if (testLocked) return { label: `Test unlocks in ${testUnlocksAt ? formatCountdown(testUnlocksAt) : ''}`, disabled: true };
            return { label: 'Start test', disabled: false };
        }
        case 'done':
            return { label: 'Module complete', disabled: true };
        default:
            return { label: 'Start grammar', disabled: false };
    }
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
            { number: 2, title: 'Practice', subtitle: `${data.module.practiceSessionSize} exercises · no pressure`, state: stepStates.practice, coverage: stepStates.practice === 'available' ? { seen: moduleProgress?.vocabularyItemsPracticedCount ?? 0, total: data.module.vocabularyItemIds.length } : undefined },
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
        } else {
            router.push(`/language-learning/module/${moduleId}/grammar`);
        }
    };

    const handleDesktopCta = async () => {
        if (!data) return;
        if (selectedStep === 'grammar') {
            router.push(`/language-learning/module/${moduleId}/grammar`);
        } else if (selectedStep === 'practice') {
            if (isStartingPractice) return;
            setIsStartingPractice(true);
            try {
                const sid = await startPracticeAndGetSessionId(data.userId, moduleId);
                if (!sid) { setIsStartingPractice(false); return; }
                router.push(`/language-learning/module/${moduleId}/practice/${sid}`);
            } catch { setIsStartingPractice(false); }
        } else if (selectedStep === 'test' && stepStates.test === 'available') {
            router.push(`/language-learning/module/${moduleId}/test`);
        }
    };

    const isDesktopCtaDisabled = selectedStep === 'test' && stepStates.test !== 'available';
    const desktopCtaLabel = selectedStep === 'test' && stepStates.test !== 'available' ? 'Keep practicing' : FLOW_CTA[selectedStep];

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
                            <div className="mt-4"><StepList steps={steps} /></div>
                            <div className="flex-1" />
                        </div>
                    )}
                </div>
                {data && (
                    <div className="px-4 py-4">
                        <button
                            disabled={cta.disabled || isStartingPractice}
                            onClick={handleCtaClick}
                            className={`w-full border-0 rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 tracking-wide transition-opacity duration-150 ${cta.disabled || isStartingPractice ? 'opacity-50 cursor-default' : 'opacity-100 cursor-pointer'}`}
                        >
                            {isStartingPractice ? 'Starting…' : cta.label}
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
                        </div>

                        {/* RIGHT PANE */}
                        <div className="col-span-2 rounded-2xl border border-cyan-500/30 bg-cyan-700/20 p-8 min-h-96 flex flex-col">
                            <div className="flex-1">
                                {selectedStep === 'grammar' && <FlowGrammarPane moduleId={moduleId} />}
                                {selectedStep === 'practice' && (
                                    <FlowPracticePane
                                        vocabularySeen={moduleProgress?.vocabularyItemsPracticedCount ?? 0}
                                        vocabularyTotal={data.module.vocabularyItemIds.length}
                                        stepNumber={stepNum}
                                    />
                                )}
                                {selectedStep === 'test' && (
                                    <FlowTestPane
                                        testState={stepStates.test}
                                        lockLabel={testLockLabel}
                                        vocabularySeen={moduleProgress?.vocabularyItemsPracticedCount ?? 0}
                                        vocabularyTotal={data.module.vocabularyItemIds.length}
                                        testUnlockDelayHours={data.module.testUnlockDelayHours}
                                    />
                                )}
                            </div>
                            <div className="flex justify-end mt-7">
                                <button
                                    onClick={handleDesktopCta}
                                    disabled={isDesktopCtaDisabled || isStartingPractice}
                                    className={`border-0 rounded-full bg-cyan-800 text-lime-200 font-bold text-base px-8 py-3.5 tracking-wide ${isDesktopCtaDisabled || isStartingPractice ? 'opacity-40 cursor-default' : 'cursor-pointer'}`}
                                >
                                    {isStartingPractice ? 'Starting…' : desktopCtaLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
