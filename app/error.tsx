'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <p className="text-white/70">Something went wrong.</p>
            <button onClick={reset} className="px-4 py-2 rounded-lg bg-cyan-700 text-white text-sm font-semibold">Try again</button>
        </div>
    );
}
