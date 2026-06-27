'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';
import { ProgressBar } from '@/app/ui/general/ProgressBar';
import { RoundButton } from 'toto-react';

const STEP_NUMBER: Record<string, number> = { grammar: 1, practice: 2, test: 3, done: 3 };

export function ModuleCard({module, index, onTap}: {module: ModuleProgressEntry, index: number, onTap: () => void}) {
    const num = String(index + 1).padStart(2, '0');
    const isCurrent = module.status === 'in_progress';
    const isActive = module.status === 'in_progress' || module.status === 'available';
    const stepNum = STEP_NUMBER[module.status === 'in_progress' ? (module.step ?? 'grammar') : 'grammar'] ?? 1;

    return (
        <div
            onClick={isActive ? onTap : undefined}
            className={`rounded-2xl p-5 min-h-40 flex flex-col justify-between ${isCurrent ? 'bg-cyan-800' : module.status == "completed" ? ' bg-cyan-600' : 'bg-cyan-700/20 text-cyan-700'} ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
            role={isActive ? 'button' : undefined}
            tabIndex={isActive ? 0 : undefined}
            onKeyDown={isActive ? (e) => e.key === 'Enter' && onTap() : undefined}
            aria-label={isActive ? `Open module ${module.title}` : undefined}
        >
            <div className="flex items-start justify-between">

                <span className={`text-3xl font-bold leading-none ${isCurrent ? 'text-lime-200' : 'text-black/30'}`}>{num}</span>

                {isCurrent && <RoundButton svgIconPath={{ src: '/images/point-right.svg', alt: 'Open' }} type="primary" onClick={() => {}} size="s" />}
                {module.status === 'locked' && <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-4 h-4" color="bg-white/50" />}
                {module.status === 'completed' && <MaskedSvgIcon src='/images/tick.svg' alt='Completed' size="w-5 h-5" color="bg-black/50" />}
                    
            </div>
            <div>
                <span className={`text-base font-bold leading-tight ${isCurrent ? 'text-lime-200' : 'text-black/70'}`}>
                    {module.title}
                </span>
                {isCurrent ? (
                    <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1">
                            <ProgressBar current={stepNum} max={3} size="s" hideNumber id={`map-card-${module.moduleId}`} />
                        </div>
                        <span className="text-xs font-bold text-cyan-200 whitespace-nowrap">Step {stepNum}/3</span>
                    </div>
                ) : (
                    <p className="text-xs text-black/50 font-semibold mt-2 m-0">
                        {module.status === 'locked' ? `Finish module ${String(index).padStart(2, '0')} to unlock` : module.status === 'completed' ? 'Completed' : 'Ready'}
                    </p>
                )}
            </div>
        </div>
    );
}
