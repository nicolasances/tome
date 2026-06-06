'use client';

import { RoundButton } from 'toto-react';
import { ModuleProgressEntry } from '@/api/TomeLearningDashboardAPI';
import { ProgressBar } from '@/app/ui/general/ProgressBar';

const STEP_NUMBER: Record<string, number> = {
    grammar: 1,
    practice: 2,
    test: 3,
    done: 3,
};

function Padlock() {
    return (
        <svg width="13" height="15" viewBox="0 0 11 13" fill="none">
            <rect x="1" y="5.5" width="9" height="6.5" rx="1.5" stroke="rgba(255,255,255,0.40)" strokeWidth="1.4" />
            <path d="M3 5.5V4a2.5 2.5 0 015 0v1.5" stroke="rgba(255,255,255,0.40)" strokeWidth="1.4" />
        </svg>
    );
}

function ModuleNode({ status, num }: { status: ModuleProgressEntry['status']; num: string }) {
    const isHighlighted = status === 'in_progress' || status === 'completed';

    return (
        <div
            className="flex items-center justify-center flex-shrink-0 rounded-full text-[13px] font-bold"
            style={{
                width: 38,
                height: 38,
                background: isHighlighted ? '#d9f99d' : 'rgba(0,0,0,0.04)',
                border: isHighlighted ? 'none' : '2px solid rgba(0,0,0,0.20)',
                color: isHighlighted ? '#0891b2' : 'rgba(255,255,255,0.40)',
            }}
        >
            {status === 'locked' && <Padlock />}
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
                <span className="text-[14.5px] font-bold text-white truncate">{module.title}</span>
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
                    <span className="text-[10.5px] font-semibold text-white/70">
                        Step {stepNum} / 3
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[14.5px] font-medium text-white/70 truncate">{module.title}</span>
            {module.status === 'locked' && (
                <span className="mt-1 self-start text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/20 text-white/40">
                    Locked
                </span>
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
            className={`flex items-center gap-[13px] px-3 py-[11px] -mx-1 rounded-xl ${isActive ? 'cursor-pointer' : 'cursor-default'}`}
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
                    onClick={() => {}}
                    size="s"
                />
            )}
        </div>
    );
}
