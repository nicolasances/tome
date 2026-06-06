import { ProgressBar } from '@/app/ui/general/ProgressBar';

export function LevelProgressHeader({ completed, total }: { completed: number; total: number }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex-1">
                <ProgressBar current={completed} max={total} size="s" hideNumber id="level-map" />
            </div>
            <span className="text-xs font-bold text-white/90 whitespace-nowrap">
                {completed} / {total}
            </span>
        </div>
    );
}
