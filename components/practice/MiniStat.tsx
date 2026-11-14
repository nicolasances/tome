'use client';

export function MiniStat({value, label, green = false, delay = 0}: {value: string, label: string, green?: boolean, delay?: number}) {
    return (
        <div className="flex flex-col items-center gap-1 anim-pc-rise" style={{ animationDelay: `${delay}ms` }}>
            <span className={`text-3xl font-bold leading-none ${green ? 'text-green-200' : 'text-black'}`}>{value}</span>
            <span className="text-sm font-semibold uppercase tracking-widest text-black/40">{label}</span>
        </div>
    );
}
