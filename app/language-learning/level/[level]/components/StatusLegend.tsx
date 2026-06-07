const LEGEND_ITEMS = [
    { label: 'In progress', fill: '#d9f99d', border: 'none' },
    { label: 'Up next', fill: 'transparent', border: '1.5px solid rgba(0,0,0,0.30)' },
    { label: 'Locked', fill: 'transparent', border: '1.5px solid rgba(0,0,0,0.30)' },
] as const;

export function StatusLegend() {
    return (
        <div className="flex gap-4 flex-wrap">
            {LEGEND_ITEMS.map(({ label, fill, border }) => (
                <div key={label} className="flex items-center gap-1.5">
                    <span
                        className="rounded-full"
                        style={{ width: 9, height: 9, background: fill, border, flexShrink: 0 }}
                    />
                    <span className="text-[10.5px] font-semibold text-white/60">{label}</span>
                </div>
            ))}
        </div>
    );
}
