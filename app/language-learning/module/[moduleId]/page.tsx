'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI, MeProgressResponse, ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';
import { TomeModuleAPI, ModuleResponse } from '@/api/TomeModuleAPI';
import { ModuleOverviewSkeleton } from './components/ModuleOverviewSkeleton';
import { ModuleHeader } from './components/ModuleHeader';
import { ScopeChips } from './components/ScopeChips';
import { StepList, StepItem, StepState } from './components/StepList';

interface PageData {
    module: ModuleResponse;
    progress: MeProgressResponse;
}

function deriveStepStates(
    step: ModuleProgressEntry['step'],
    testUnlocksAt: string | null
): { grammar: StepState; practice: StepState; test: StepState } {
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

function deriveLockLabel(
    step: ModuleProgressEntry['step'],
    testUnlocksAt: string | null,
    testUnlockDelayHours: number
): string | undefined {
    if (step === 'practice') return `${testUnlockDelayHours}h after practice`;
    if (step === 'test' && testUnlocksAt && new Date(testUnlocksAt) > new Date()) {
        return formatCountdown(testUnlocksAt);
    }
    return undefined;
}

function deriveCtaInfo(
    step: ModuleProgressEntry['step'],
    testUnlocksAt: string | null
): { label: string; disabled: boolean } {
    switch (step) {
        case 'practice':
            return { label: 'Start practice', disabled: false };
        case 'test': {
            const testLocked = testUnlocksAt ? new Date(testUnlocksAt) > new Date() : false;
            if (testLocked) {
                const countdown = testUnlocksAt ? formatCountdown(testUnlocksAt) : '';
                return { label: `Test unlocks in ${countdown}`, disabled: true };
            }
            return { label: 'Start test', disabled: true };
        }
        case 'done':
            return { label: 'Module complete', disabled: true };
        default:
            return { label: 'Start grammar', disabled: false };
    }
}

export default function ModuleOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();

    const moduleId = params.moduleId as string;

    const [data, setData] = useState<PageData | null | undefined>(undefined);

    useEffect(() => {
        setConfig({
            title: 'Module',
            backButton: { enabled: true, onClick: () => router.back() },
        });
    }, [setConfig, router]);

    useEffect(() => {
        Promise.all([
            new TomeModuleAPI().getModule(moduleId),
            new TomeLearningDashboardAPI().getMeProgress(),
        ])
            .then(([module, progress]) => setData({ module, progress }))
            .catch(() => setData(null));
    }, [moduleId]);

    const moduleProgress = data?.progress.modules.find(m => m.moduleId === moduleId) ?? null;
    const moduleIndex = data?.progress.modules.findIndex(m => m.moduleId === moduleId) ?? -1;
    const number = moduleIndex >= 0 ? String(moduleIndex + 1).padStart(2, '0') : '01';
    const kicker = data ? `${data.module.cefrLevel}·${number} · ${data.module.theme}` : '';

    const stepStates = moduleProgress
        ? deriveStepStates(moduleProgress.step, moduleProgress.testUnlocksAt)
        : { grammar: 'available' as StepState, practice: 'upcoming' as StepState, test: 'upcoming' as StepState };

    const testLockLabel = data && moduleProgress
        ? deriveLockLabel(moduleProgress.step, moduleProgress.testUnlocksAt, data.module.testUnlockDelayHours)
        : undefined;

    const steps: StepItem[] = data
        ? [
              {
                  number: 1,
                  title: 'Grammar',
                  subtitle: `${data.module.grammarConcepts.length} concepts · learn the rules`,
                  state: stepStates.grammar,
              },
              {
                  number: 2,
                  title: 'Practice',
                  subtitle: `${data.module.practiceSessionSize} exercises · no pressure`,
                  state: stepStates.practice,
              },
              {
                  number: 3,
                  title: 'Module Test',
                  subtitle: `${data.module.testQuestionCount} questions · ${data.module.testPassThreshold}% to pass`,
                  state: stepStates.test,
                  lockLabel: testLockLabel,
              },
          ]
        : [];

    const ctaStep = moduleProgress?.step ?? null;
    const cta = deriveCtaInfo(ctaStep, moduleProgress?.testUnlocksAt ?? null);

    const handleCtaClick = () => {
        if (cta.disabled) return;
        if (ctaStep === 'practice') {
            router.push(`/language-learning/module/${moduleId}/practice`);
        } else {
            router.push(`/language-learning/module/${moduleId}/grammar`);
        }
    };

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">
            <div className="flex flex-1 flex-col px-[18px] pt-[6px] pb-0 gap-0 overflow-y-auto">

                {data === undefined && <ModuleOverviewSkeleton />}

                {data === null && (
                    <p className="text-sm text-cyan-600 mt-4">Failed to load module. Please try again.</p>
                )}

                {data && (
                    <div className="flex flex-col">
                        <ModuleHeader
                            kicker={kicker}
                            title={data.module.title}
                            communicationGoal={data.module.communicationGoal}
                        />
                        <ScopeChips
                            grammarConcepts={data.module.grammarConcepts}
                            vocabularyCount={data.module.vocabularyCount}
                        />
                        <div style={{ marginTop: 18 }}>
                            <StepList steps={steps} />
                        </div>
                        <div className="flex-1" />
                    </div>
                )}

            </div>

            {data && (
                <div style={{ padding: '16px 18px' }}>
                    <button
                        disabled={cta.disabled}
                        onClick={handleCtaClick}
                        style={{
                            width: '100%',
                            border: 'none',
                            borderRadius: 9999,
                            background: '#155e75',
                            color: '#d9f99d',
                            fontFamily: 'inherit',
                            fontWeight: 700,
                            fontSize: 15,
                            padding: '15px',
                            cursor: cta.disabled ? 'default' : 'pointer',
                            letterSpacing: '0.02em',
                            opacity: cta.disabled ? 0.5 : 1,
                            transition: 'opacity 0.15s',
                        }}
                    >
                        {cta.label}
                    </button>
                </div>
            )}
        </div>
    );
}
