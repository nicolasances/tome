function widthClass(index: number): string {
    const widths = ['w-8/12', 'w-10/12', 'w-7/12', 'w-9/12', 'w-6/12', 'w-8/12'];
    return widths[index % widths.length];
}

export function ModuleMapSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="flex flex-col">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 py-3 border-b border-cyan-700/35">
                    <div className="w-[38px] h-[38px] rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex flex-col flex-1 min-w-0 gap-2">
                        <div className={`h-4 rounded-md skeleton-shimmer ${widthClass(index)}`} />
                        <div className={`h-3 rounded-md skeleton-shimmer ${widthClass(index + 2)}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}
