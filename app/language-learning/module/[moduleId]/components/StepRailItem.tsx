'use client';

import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { StepState } from './StepList';

interface StepRailItemProps {
    number: number;
    title: string;
    subtitle: string;
    state: StepState;
    selected: boolean;
    onClick: () => void;
}

export function StepRailItem({number, title, subtitle, state, selected, onClick}: StepRailItemProps) {
    const isDone = state === 'completed';
    const isActive = state === 'available';
    const isLocked = state === 'locked';
    const isUpcoming = state === 'upcoming';
    const isClickable = !isLocked && !isUpcoming;

    const medallionFilled = isDone || isActive;

    return (
        <button
            onClick={isClickable ? onClick : undefined}
            disabled={!isClickable}
            className={`flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-2xl cursor-${isClickable ? 'pointer' : 'default'} border-[1.5px] ${selected ? 'bg-cyan-700/30    ' : 'border-cyan-500/30 bg-transparent'} ${isLocked || isUpcoming ? 'opacity-70' : ''}`}
        >
            {/* Medallion */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-cyan-800 ${medallionFilled ? (isDone ? 'bg-lime-300' : 'bg-lime-200') : 'bg-transparent'} ${medallionFilled ? '' : isLocked ? 'border-2 border-black/20' : 'border-2 border-cyan-600'}`}>
                {isDone ? (
                    <MaskedSvgIcon src="/images/tick.svg" alt="Done" size="w-4 h-4" color="bg-cyan-800" />
                ) : isLocked ? (
                    <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-3.5 h-3.5" color="bg-cyan-700" />
                ) : (
                    <span className="text-base font-bold">{number}</span>
                )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <span className="text-base font-bold text-black">{title}</span>
                <span className="text-xs text-black/60 block mt-0.5">{subtitle}</span>
            </div>

            {isLocked && <MaskedSvgIcon src="/images/padlock.svg" alt="Locked" size="w-3.5 h-3.5" color="bg-cyan-700" />}
        </button>
    );
}
