'use client';

import { RoundButton } from 'toto-react';
import { ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';
import { ProgressBar } from '@/app/ui/general/ProgressBar';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

const STEP_NUMBER: Record<string, number> = {
    grammar: 1,
    practice: 2,
    test: 3,
    done: 3,
};

function ModuleNode({ status, num }: { status: ModuleProgressEntry['status']; num: string }) {
    const isHighlighted = status === 'in_progress' || status === 'completed';

    return (
        <div
            className="flex items-center justify-center flex-shrink-0 rounded-full text-[13px] font-bold text-black/70"
            style={{
                width: 38,
                height: 38,
                background: isHighlighted ? '#d9f99d' : 'rgba(0,0,0,0.04)',
                border: isHighlighted ? 'none' : '2px solid rgba(0,0,0,0.20)',
            }}
        >
            {status === 'locked' && <MaskedSvgIcon src='/images/padlock.svg' alt='Locked' />}
            {status === 'available' && num}
            {status === 'in_progress' && num}
            {status === 'completed' && '✓'}
        </div>
    );
}

function RowBody({ module, stepNum }: { module: ModuleProgressEntry; stepNum: number }) {
    if (module.status === 'in_progress') {
        return (
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-base font-bold text-black truncate">{module.title}</span>
                <div className="flex items-center gap-2 mt-1.5">
                    <div style={{ width: 96 }}>
                        <ProgressBar
                            size="s"
                            hideNumber
                            current={stepNum}
                            max={3}
                            id={`step-${module.moduleId}`}
                        />
                    </div>
                    <span className="text-[10.5px] font-semibold text-black/70">
                        Step {stepNum} / 3
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <span className="text-base font-medium text-black/70 truncate">{module.title}</span>
            {module.status === 'locked' && (
                <div className="flex justify-start items-center gap-1">
                    <MaskedSvgIcon src='/images/padlock.svg' alt='Locked' size="w-3 h-3" />
                    <span className="text-sm">Locked</span>
                </div>
            )}
        </div>
    );
}

export function ModuleRow({
    module,
    index,
    isLast,
    onTap,
}: {
    module: ModuleProgressEntry;
    index: number;
    isLast: boolean;
    onTap: () => void;
}) {
    const num = String(index + 1).padStart(2, '0');
    const stepNum = STEP_NUMBER[module.status === 'in_progress' ? (module.step ?? 'grammar') : 'grammar'] ?? 1;
    const isActive = module.status === 'in_progress' || module.status === 'available';
    const isInProgress = module.status === 'in_progress';

    const showBorder = !isInProgress && !isLast;

    return (
        <div
            className={`flex items-center gap-[13px] px-3 py-2 -mx-1 rounded-xl ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
            style={{
                background: isInProgress ? 'rgba(14,116,144,0.32)' : 'transparent',
                borderBottom: showBorder ? '1px solid rgba(9,166,209,0.35)' : 'none',
            }}
            onClick={isActive ? onTap : undefined}
            role={isActive ? 'button' : undefined}
            tabIndex={isActive ? 0 : undefined}
            onKeyDown={isActive ? (e) => e.key === 'Enter' && onTap() : undefined}
            aria-label={isActive ? `Open module ${module.title}` : undefined}
        >
            <ModuleNode status={module.status} num={num} />

            <RowBody module={module} stepNum={stepNum} />

            {isInProgress && (
                <RoundButton
                    svgIconPath={{ src: '/images/point-right.svg', alt: 'continue' }}
                    type="primary"
                    onClick={() => { }}
                    size="s"
                />
            )}
        </div>
    );
}
