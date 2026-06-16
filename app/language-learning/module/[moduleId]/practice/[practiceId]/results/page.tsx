'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomeModuleAPI } from '@/api/TomeModuleAPI';
import { TomePracticeSessionAPI } from '@/api/TomePracticeSessionAPI';
import { reconstructSessionState } from '@/utils/reconstructSessionState';
import { startPracticeAndGetSessionId } from '@/utils/startPractice';
import { PracticeComplete } from '../../components/PracticeComplete';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecapData {
    moduleTitle: string;
    moduleNumber: string;
    coverageBeforePct: number;
    coverageAfterPct: number;
    practicedWords: number;
    totalWords: number;
    answered: number;
    firstTryMastered: number;
    testUnlocksAt: string | null;
    testUnlockDelayHours: number;
    step2Complete: boolean;
    userId: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PracticeResultsPage() {
    const params        = useParams();
    const router        = useRouter();
    const searchParams  = useSearchParams();
    const { setConfig } = useHeader();

    const moduleId   = params.moduleId   as string;
    const practiceId = params.practiceId as string;

    const [recapData, setRecapData] = useState<RecapData | null | undefined>(undefined);
    const [isStarting, setIsStarting] = useState(false);

    // ── Header ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: recapData?.moduleTitle ?? 'Practice',
            backButton: { enabled: true, onClick: () => router.push(`/language-learning/module/${moduleId}`) },
        });
    }, [setConfig, router, moduleId, recapData?.moduleTitle]);

    // ── Load ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function load() {
            const me = await new TomeLearningDashboardAPI().getMe();
            const [session, module, progress] = await Promise.all([
                new TomePracticeSessionAPI().getSession(me.id, practiceId),
                new TomeModuleAPI().getModule(moduleId),
                new TomeLearningDashboardAPI().getMeProgress(),
            ]);

            if (!session) {
                router.push(`/language-learning/module/${moduleId}`);
                return;
            }

            const moduleEntry = progress.modules.find(m => m.moduleId === moduleId);
            const moduleIdx   = progress.modules.findIndex(m => m.moduleId === moduleId);

            const practicedWords       = moduleEntry?.vocabularyItemsPracticedCount ?? 0;
            const totalWords           = module.vocabularyItemIds.length;
            const coverageAfterPct     = totalWords > 0 ? practicedWords / totalWords : 0;
            const prevCoveredRaw       = searchParams.get('prevCovered');
            const prevCoveredCount     = prevCoveredRaw !== null ? parseInt(prevCoveredRaw, 10) : practicedWords;
            const coverageBeforePct    = totalWords > 0 ? prevCoveredCount / totalWords : 0;
            const step2Complete        = totalWords > 0 && practicedWords >= totalWords;
            const { firstTryMasteredCount } = reconstructSessionState(session);

            setRecapData({
                moduleTitle:        module.title,
                moduleNumber:       String(moduleIdx >= 0 ? moduleIdx + 1 : 1).padStart(2, '0'),
                coverageBeforePct,
                coverageAfterPct,
                practicedWords,
                totalWords,
                answered:           session.exercises.length,
                firstTryMastered:   firstTryMasteredCount,
                testUnlocksAt:      moduleEntry?.testUnlocksAt ?? null,
                testUnlockDelayHours: module.testUnlockDelayHours,
                step2Complete,
                userId:             me.id,
            });
        }
        load().catch(() => setRecapData(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleId, practiceId]);

    // ── CTA handlers ─────────────────────────────────────────────────────────

    async function handlePracticeAnother() {
        if (!recapData || isStarting) return;
        setIsStarting(true);
        try {
            const sid = await startPracticeAndGetSessionId(recapData.userId, moduleId);
            if (!sid) { setIsStarting(false); return; }
            router.push(`/language-learning/module/${moduleId}/practice/${sid}`);
        } catch {
            setIsStarting(false);
        }
    }

    function handleBackToModule() {
        router.push(`/language-learning/module/${moduleId}`);
    }

    // ── Render ────────────────────────────────────────────────────────────────
    if (recapData === undefined) {
        return (
            <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">
                <div className="flex flex-1 flex-col px-5 pt-8 gap-6" aria-busy="true" aria-label="Loading results">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-48 h-48 rounded-full skeleton-shimmer" />
                        <div className="h-8 w-48 rounded-md skeleton-shimmer" />
                        <div className="h-5 w-64 rounded-md skeleton-shimmer" />
                    </div>
                    <div className="flex justify-around mt-4">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <div className="h-8 w-12 rounded-md skeleton-shimmer" />
                                <div className="h-3 w-16 rounded-md skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (recapData === null) {
        return (
            <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full px-5 pt-4">
                <p className="text-sm text-cyan-600">Failed to load results. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">
            <PracticeComplete
                step2Complete={recapData.step2Complete}
                moduleTitle={recapData.moduleTitle}
                moduleNumber={recapData.moduleNumber}
                coverageBeforePct={recapData.coverageBeforePct}
                coverageAfterPct={recapData.coverageAfterPct}
                practicedWords={recapData.practicedWords}
                totalWords={recapData.totalWords}
                answered={recapData.answered}
                firstTryMastered={recapData.firstTryMastered}
                testUnlocksAt={recapData.testUnlocksAt}
                testUnlockDelayHours={recapData.testUnlockDelayHours}
                onPracticeAnother={handlePracticeAnother}
                onBackToModule={handleBackToModule}
            />
        </div>
    );
}
