'use client';

export function StatTile({loading, value, suffix, label}: {loading?: boolean, value: string, suffix: string, label: string}) {
    if (loading) {
        return (
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-700/30 p-5" aria-busy="true" aria-label="Loading stat">
                <div className="flex items-baseline gap-2">
                    <div className="skeleton-shimmer h-9 w-10 rounded" />
                    <div className="skeleton-shimmer h-4 w-20 rounded" />
                </div>
                <div className="skeleton-shimmer h-3 w-16 rounded mt-2" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-cyan-500/30 bg-cyan-700/30 p-5">
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white leading-none">{value}</span>
                <span className="text-base font-semibold text-white/70">{suffix}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mt-2 m-0">{label}</p>
        </div>
    );
}
