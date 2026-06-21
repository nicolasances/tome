'use client';

export function StatTile({loading, value, suffix, label}: {loading?: boolean, value: string, suffix: string, label: string}) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-cyan-300 p-5" aria-busy="true" aria-label="Loading stat">
                <div className="flex items-baseline gap-2">
                    <div className="skeleton-shimmer h-9 w-10 rounded" />
                    <div className="skeleton-shimmer h-4 w-20 rounded" />
                </div>
                <div className="skeleton-shimmer h-3 w-16 rounded mt-2" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-cyan-300 p-5">
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-black/90 leading-none">{value}</span>
                <span className="text-base font-semibold text-black/70">{suffix}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-black/50 mt-2 m-0">{label}</p>
        </div>
    );
}
