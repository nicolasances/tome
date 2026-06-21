'use client';

import { useRouter } from 'next/navigation';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';

interface UpNextStripProps {
    loading?: boolean;
    levelName?: string;
    modules?: ModuleProgressEntry[];
    onOpenMap: () => void;
}

export function UpNextStrip({loading, levelName, modules, onOpenMap}: UpNextStripProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div aria-busy="true" aria-label="Loading upcoming modules">
                <div className="skeleton-shimmer h-3 w-40 rounded mb-4" />
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-cyan-500/30 bg-cyan-700/20 p-4 min-h-24">
                            <div className="skeleton-shimmer h-5 w-8 rounded mb-3" />
                            <div className="skeleton-shimmer h-3 w-full rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!modules || modules.length === 0) return null;

    const first4 = modules.slice(0, 4);

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/60 m-0 pl-4">
                    Up next in {levelName ?? 'this level'}
                </p>
                <button onClick={onOpenMap} className="bg-transparent border-0 cursor-pointer text-lg font-bold text-lime-200 flex items-center gap-1.5 pr-4">
                    <span className="mr-2">All modules</span>
                    <MaskedSvgIcon src="/images/point-right.svg" alt="Go" size="w-3.5 h-3.5" color="bg-lime-200" />
                </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {first4.map((m, i) => {
                    const isCurrent = m.status === 'in_progress' || m.status === 'available';
                    const isCompleted = m.status === 'completed';
                    const num = String(i + 1).padStart(2, '0');
                    return (
                        <div
                            key={m.moduleId}
                            onClick={isCurrent ? () => router.push(`/language-learning/module/${m.moduleId}`) : undefined}
                            className={`rounded-2xl p-4 min-h-24 flex flex-col justify-between ${isCurrent ? 'bg-lime-200 cursor-pointer' : 'bg-cyan-700/20 border border-cyan-500/30'}`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-xl font-bold ${isCurrent ? 'text-cyan-800' : 'text-black/40'}`}>{num}</span>
                                {isCompleted && <MaskedSvgIcon src="/images/tick.svg" alt="Completed" size="w-6 h-6" color="bg-black/50" />}
                                {isCurrent && <MaskedSvgIcon src="/images/point-right.svg" alt="In Progress" size="w-5 h-5" color="bg-lime-700" />}
                                {!isCurrent && !isCompleted && <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-3.5 h-3.5" color="bg-white/50" />}
                            </div>
                            <span className={`text-sm font-semibold leading-tight mt-2 ${isCurrent ? 'text-cyan-800 font-bold' : 'text-black/40'}`}>
                                {m.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
