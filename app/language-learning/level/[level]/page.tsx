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

export default function ModuleMapPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();

    const level = (params.level as string).toUpperCase() as CefrLevel;
    const levelName = CEFR_LEVEL_NAMES[level] ?? level;

    // undefined = loading, null = failed
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
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">
            <div className="flex flex-1 flex-col px-[18px] pt-4 pb-4 gap-4 overflow-y-auto">

                {progress === undefined && <ModuleMapSkeleton />}

                {progress === null && (
                    <p className="text-sm text-cyan-600 mt-4">Failed to load modules. Please try again.</p>
                )}

                {progress && (
                    <>
                        <LevelProgressHeader completed={completedCount} total={totalCount} />
                        <StatusLegend />
                        <div className="flex flex-col">
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
                    </>
                )}

            </div>
        </div>
    );
}
