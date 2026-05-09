function widthClass(index: number): string {
    const widths = ['w-10/12', 'w-8/12', 'w-9/12', 'w-7/12'];
    return widths[index % widths.length];
}

export function VocabularyListSkeleton({ rows = 8 }: { rows?: number }) {
    return (
        <div className="space-y-3 pb-4">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="py-1">
                    <div className={`h-6 rounded-md skeleton-shimmer ${widthClass(index)}`} />
                    <div className={`h-4 rounded-md skeleton-shimmer mt-2 ${widthClass(index + 1)}`} />
                </div>
            ))}
        </div>
    );
}

export function SentencesListSkeleton({ rows = 7 }: { rows?: number }) {
    return (
        <div className="flex flex-col mt-4">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="border-b border-cyan-600 py-2 flex flex-row">
                    <div className="mr-2">
                        <div className="w-8 h-8 rounded-md skeleton-shimmer" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className={`h-4 rounded-md skeleton-shimmer ${widthClass(index)}`} />
                        <div className={`h-3 rounded-md skeleton-shimmer mt-2 ${widthClass(index + 2)}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SourcesListSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-2 mt-4">
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg border border-cyan-700 p-2">
                    <div className="w-8 h-8 rounded-md skeleton-shimmer" />
                    <div className="flex flex-col flex-1 min-w-0">
                        <div className={`h-4 rounded-md skeleton-shimmer ${widthClass(index)}`} />
                        <div className={`h-3 rounded-md skeleton-shimmer mt-2 ${widthClass(index + 1)}`} />
                    </div>
                </div>
            ))}
        </div>
    );
}