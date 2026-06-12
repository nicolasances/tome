'use client';

interface TestSubmitProps {
    totalCount: number;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function TestSubmit({totalCount, onSubmit, isSubmitting}: TestSubmitProps) {
    return (
        <div className="flex flex-1 flex-col items-center px-5 pt-10 pb-4">
            <div className="flex flex-col items-center gap-1 mb-8">
                <span className="text-xs font-semibold uppercase tracking-widest text-black/50">All answered</span>
                <span className="text-3xl font-black text-cyan-800">{totalCount} / {totalCount}</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {Array.from({ length: totalCount }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-lime-200 border border-cyan-800/20" />
                ))}
            </div>

            <p className="text-base font-semibold text-black/70 text-center mt-10 max-w-xs">
                Ready to see your result?
            </p>

            <div className="flex-1" />

            <div className="w-full py-4">
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className={`w-full rounded-full bg-cyan-800 text-lime-200 font-bold text-base py-4 transition-opacity ${isSubmitting ? 'opacity-50 cursor-default' : 'cursor-pointer'}`}>
                    {isSubmitting ? 'Submitting…' : 'Submit test'}
                </button>
            </div>
        </div>
    );
}
