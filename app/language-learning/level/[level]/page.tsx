'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import {
    TomeLearningDashboardAPI,
    MeProgressResponse,
    ModuleProgressEntry,
    CEFR_LEVEL_NAMES,
    CefrLevel,
} from '@/api/TomeLearningDashboardAPI';
import { ModuleMapSkeleton } from './components/ModuleMapSkeleton';
import { LevelProgressHeader } from './components/LevelProgressHeader';
import { StatusLegend } from './components/StatusLegend';
import { ModuleRow } from './components/ModuleRow';
import { ModuleCard } from './components/ModuleCard';

export default function ModuleMapPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();

    const level = (params.level as string).toUpperCase() as CefrLevel;
    const levelName = CEFR_LEVEL_NAMES[level] ?? level;

    const [progress, setProgress] = useState<MeProgressResponse | null | undefined>(undefined);

    useEffect(() => {
        setConfig({
            title: `${level} · ${levelName}`,
            backButton: { enabled: true, onClick: () => router.push('/language-learning') },
        });
    }, [setConfig, level, levelName, router]);

    useEffect(() => {
        new TomeLearningDashboardAPI()
            .getMeProgress(level)
            .then(setProgress)
            .catch(() => setProgress(null));
    }, [level]);

    const completedCount = progress?.modules.filter(m => m.status === 'completed').length ?? 0;
    const totalCount = progress?.modules.length ?? 0;

    const handleModuleTap = (module: ModuleProgressEntry) => {
        router.push(`/language-learning/module/${module.moduleId}`);
    };

    return (
        <div className="flex flex-1 flex-col items-stretch lg:items-center">

            {/* ═══ MOBILE LAYOUT ═══ */}
            <div className="flex flex-1 flex-col px-4 pt-4 pb-4 gap-4 overflow-y-auto lg:hidden">
                {progress === undefined && <ModuleMapSkeleton />}
                {progress === null && (
                    <p className="text-sm text-cyan-600 mt-4">Failed to load modules. Please try again.</p>
                )}
                {progress && (
                    <div className="flex flex-col gap-2">
                        <LevelProgressHeader completed={completedCount} total={totalCount} />
                        <StatusLegend />
                        <div className="flex flex-col mt-2">
                            {progress.modules.map((module, index) => (
                                <ModuleRow
                                    key={module.moduleId}
                                    module={module}
                                    index={index}
                                    isLast={index === progress.modules.length - 1}
                                    onTap={() => handleModuleTap(module)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ DESKTOP LAYOUT ═══ */}
            <div className="hidden lg:flex flex-col w-full max-w-5xl px-12 pt-10 pb-14 overflow-y-auto">

                {/* Page header */}
                <div className="flex items-end gap-5 mb-7">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-widest text-black/60 mb-2">{level} · {levelName}</p>
                        <h1 className="text-3xl font-bold text-black leading-tight m-0 p-0 border-0">Module map</h1>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-black leading-none">
                            {completedCount}<span className="text-lg text-black/50"> / {totalCount}</span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-black/60 mt-1 m-0">modules complete</p>
                    </div>
                </div>

                {progress === undefined && <ModuleMapSkeleton />}
                {progress === null && (
                    <p className="text-sm text-cyan-600 mt-4">Failed to load modules. Please try again.</p>
                )}
                {progress && (
                    <>
                        {/* Progress bar + legend */}
                        {progress && (
                            <div className="flex items-center gap-6 mb-7">
                                <div className="flex flex-col mt-2">
                                    <LevelProgressHeader completed={completedCount} total={totalCount} />
                                    <StatusLegend />
                                </div>
                            </div>
                        )}

                        {/* 4-column grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {progress.modules.map((module, index) => (
                                <ModuleCard
                                    key={module.moduleId}
                                    module={module}
                                    index={index}
                                    onTap={() => handleModuleTap(module)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
