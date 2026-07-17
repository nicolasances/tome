'use client';

import { useEffect, useState } from 'react';
import { useHeader } from '@/context/HeaderContext';
import { useRouter } from 'next/navigation';
import { RoundButton } from 'toto-react';
import {
    TomeLearningDashboardAPI,
    MeProgressResponse,
    DailyActivityDay,
    CEFR_LEVEL_NAMES,
    CefrLevel,
    deriveCurrentModule,
} from '@/api/TomeLearningDashboardAPI';
import { TomeLevelTestAPI, LevelTestEligibilityResponse } from '@/api/TomeLevelTestAPI';
import { LevelTrack } from './components/LevelTrack';
import { ContinueCard } from './components/ContinueCard';
import { HomeLevelTest } from './components/HomeLevelTest';
import { WeeklyModuleStats } from './components/WeeklyModuleStats';
import { DesktopContinueCard } from './components/DesktopContinueCard';
import { DesktopHomeLevelTest } from './components/DesktopHomeLevelTest';
import { StatTile } from './components/StatTile';
import { UpNextStrip } from './components/UpNextStrip';
import { countActiveDays } from '@/utils/activeDays';

export default function LanguageLearningHomePage() {
    const { setConfig } = useHeader();
    const router = useRouter();

    const [progress, setProgress] = useState<MeProgressResponse | null | undefined>(undefined);
    const [weeklyStats, setWeeklyStats] = useState<DailyActivityDay[] | null | undefined>(undefined);
    const [userId, setUserId] = useState<string | null | undefined>(undefined);
    const [levelTestEligibility, setLevelTestEligibility] = useState<LevelTestEligibilityResponse | null | undefined>(undefined);

    useEffect(() => {
        setConfig({
            title: 'Language Learning',
            backButton: { enabled: false, onClick: () => {} },
        });
    }, [setConfig]);

    useEffect(() => {
        const api = new TomeLearningDashboardAPI();
        api.getMe().then((me) => setUserId(me.id)).catch(() => setUserId(null));
        api.getMeProgress().then(setProgress).catch(() => setProgress(null));
        api.getWeeklySessionStats().then((res) => setWeeklyStats(res.days)).catch(() => setWeeklyStats(null));
    }, []);

    const isProgressLoading = progress === undefined;
    const isWeeklyLoading = weeklyStats === undefined;

    const cefrLevel = progress?.currentCefrLevel as CefrLevel | undefined;
    const levelName = cefrLevel ? CEFR_LEVEL_NAMES[cefrLevel] : undefined;
    const currentLevelSummary = progress?.levels?.find((l) => l.status === 'current');
    const currentModule = progress ? deriveCurrentModule(progress) : undefined;
    const allModulesComplete = currentModule === null;

    // Only worth checking once we know there's no in-progress/available module to continue.
    useEffect(() => {
        if (!userId || !allModulesComplete) return;
        new TomeLevelTestAPI().getLevelTestEligibility(userId).then(setLevelTestEligibility).catch(() => setLevelTestEligibility(null));
    }, [userId, allModulesComplete]);

    const weekTotal = weeklyStats?.reduce((a, d) => a + d.practiceSessions, 0) ?? 0;
    const activeDays = weeklyStats ? countActiveDays(weeklyStats) : 0;
    const currentModuleProgress = progress?.modules?.find((m) => m.status === 'in_progress');
    const wordsSeen = currentModuleProgress?.vocabularyItemsPracticedCount ?? 0;

    return (
        <div className="flex flex-1 flex-col items-stretch lg:items-center">

            {/* ═══ MOBILE LAYOUT ═══ */}
            <div className="flex flex-1 flex-col px-4 pt-6 pb-4 gap-8 overflow-y-auto lg:hidden">
                <LevelTrack
                    loading={isProgressLoading}
                    error={!isProgressLoading && (!progress || !cefrLevel || !levelName || !currentLevelSummary)}
                    cefrLevel={cefrLevel}
                    levelName={levelName}
                    totalModules={currentLevelSummary?.modulesTotal}
                    completedModules={currentLevelSummary?.modulesCompleted}
                />
                {allModulesComplete && cefrLevel ? (
                    <HomeLevelTest cefrLevel={cefrLevel} eligibility={levelTestEligibility} />
                ) : (
                    <ContinueCard loading={isProgressLoading} module={currentModule} />
                )}
                <div className="flex justify-around items-start gap-2">
                    <NavButton
                        icon="/images/book.svg"
                        alt="Modules"
                        label="Modules"
                        onClick={() => router.push(`/language-learning/level/${cefrLevel ?? 'A1'}`)}
                    />
                </div>
                <div className="flex-1" />
                <div className="mb-3.5">
                    <WeeklyModuleStats loading={isWeeklyLoading} days={weeklyStats ?? undefined} />
                </div>
            </div>

            {/* ═══ DESKTOP LAYOUT ═══ */}
            <div className="hidden lg:flex flex-col w-full max-w-5xl px-12 pt-10 pb-14 overflow-y-auto">

                {/* Page header */}
                <div className="flex items-end gap-5 mb-7">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-widest text-black/60 mb-2">Language Learning</p>
                        <h1 className="text-3xl font-bold text-black leading-tight m-0 p-0 border-0">
                            Goddag — let&apos;s keep going
                        </h1>
                    </div>
                    <DesktopWeekCounter loading={isWeeklyLoading} count={weekTotal} />
                </div>

                {/* Level path */}
                <div className="mb-8">
                    <LevelTrack
                        loading={isProgressLoading}
                        error={!isProgressLoading && (!progress || !cefrLevel || !levelName || !currentLevelSummary)}
                        cefrLevel={cefrLevel}
                        levelName={levelName}
                        totalModules={currentLevelSummary?.modulesTotal}
                        completedModules={currentLevelSummary?.modulesCompleted}
                    />
                </div>

                {/* Two-column: Continue card + This week chart */}
                <div className="grid grid-cols-5 gap-6 mb-6">
                    <div className="col-span-3">
                        {allModulesComplete && cefrLevel ? (
                            <DesktopHomeLevelTest cefrLevel={cefrLevel} eligibility={levelTestEligibility} />
                        ) : (
                            <DesktopContinueCard loading={isProgressLoading} module={currentModule} progress={currentModuleProgress} />
                        )}
                    </div>
                    <div className="col-span-2 flex flex-col px-1">
                        <WeeklyModuleStats loading={isWeeklyLoading} days={weeklyStats ?? undefined} />
                    </div>
                </div>

                {/* Stat tiles */}
                <div className="grid grid-cols-3 gap-6 mb-7">
                    <StatTile
                        loading={isProgressLoading}
                        value={String(currentLevelSummary?.modulesCompleted ?? 0)}
                        suffix={`of ${currentLevelSummary?.modulesTotal ?? 0} modules`}
                        label={`${cefrLevel ?? ''} ${levelName ?? ''}`}
                    />
                    <StatTile loading={isProgressLoading} value={String(wordsSeen)} suffix="words seen" label="this round" />
                    <StatTile loading={isWeeklyLoading} value={`${activeDays}d`} suffix="active days" label="last 7 days" />
                </div>

                {/* Up next strip */}
                <UpNextStrip
                    loading={isProgressLoading}
                    levelName={levelName}
                    modules={progress?.modules}
                    onOpenMap={() => router.push(`/language-learning/level/${cefrLevel ?? 'A1'}`)}
                />
            </div>
        </div>
    );
}

function NavButton({icon, alt, label, onClick}: {icon: string, alt: string, label: string, onClick: () => void}) {
    return (
        <div className="flex flex-col items-center gap-2">
            <RoundButton svgIconPath={{ src: icon, alt }} type="primary" onClick={onClick} />
            <span className="text-xs font-semibold tracking-widest uppercase text-black/70">{label}</span>
        </div>
    );
}

function DesktopWeekCounter({loading, count}: {loading: boolean, count: number}) {
    if (loading) {
        return (
            <div className="flex items-center gap-4" aria-busy="true" aria-label="Loading weekly count">
                <div className="text-right">
                    <div className="skeleton-shimmer h-7 w-10 rounded mb-1" />
                    <div className="skeleton-shimmer h-3 w-24 rounded" />
                </div>
            </div>
        );
    }
    return (
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-2xl font-bold text-blackwhite leading-none">{count}</div>
                <p className="text-xs font-semibold uppercase tracking-widest text-black/60 mt-1 m-0">sessions this week</p>
            </div>
        </div>
    );
}
