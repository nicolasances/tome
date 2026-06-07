import { ProgressBar } from '@/app/ui/general/ProgressBar';

export function LevelProgressHeader({ completed, total }: { completed: number; total: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1">
                <ProgressBar current={completed} max={total} size="s" hideNumber id="level-map" />
            </div>
            <span className="text-sm font-bold text-black/90 whitespace-nowrap">
                {completed} / {total}
            </span>
        </div>
    );
}
