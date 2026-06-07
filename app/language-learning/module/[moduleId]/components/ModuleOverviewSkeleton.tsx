export function ModuleOverviewSkeleton() {
    return (
        <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading module overview">
            <div className="flex flex-col gap-2">
                <div className="h-3 w-4/12 rounded-md skeleton-shimmer" />
                <div className="h-7 w-9/12 rounded-md skeleton-shimmer mt-1" />
                <div className="h-4 w-full rounded-md skeleton-shimmer mt-1" />
                <div className="h-4 w-10/12 rounded-md skeleton-shimmer" />
            </div>
            <div className="flex gap-2">
                <div className="h-7 w-24 rounded-full skeleton-shimmer" />
                <div className="h-7 w-20 rounded-full skeleton-shimmer" />
                <div className="h-7 w-24 rounded-full skeleton-shimmer" />
            </div>
            <div className="flex flex-col gap-[10px]">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="flex items-center gap-3 border border-cyan-500/40"
                        style={{ padding: '13px 14px', borderRadius: 14 }}
                    >
                        <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0 gap-2">
                            <div className="h-4 w-5/12 rounded-md skeleton-shimmer" />
                            <div className="h-3 w-8/12 rounded-md skeleton-shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
