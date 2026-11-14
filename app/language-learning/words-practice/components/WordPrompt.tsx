import { WordsPracticeWord } from '@/api/TomeWordsPracticeAPI';

/** The English prompt of a word, with its type and (when present) context as chips beneath. */
export function WordPrompt({word}: {word: WordsPracticeWord}) {
    return (
        <div className="text-center mt-8 px-1">
            <p className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-3">In Danish, say</p>
            <p className="text-2xl font-bold text-black leading-snug break-words">{word.english}</p>
            <div className="flex justify-center flex-wrap gap-2 mt-3">
                <span className="rounded-full border border-cyan-300 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-black/60">{word.type}</span>
                {word.context && <span className="rounded-full border border-cyan-300 px-3 py-1 text-xs font-semibold text-black/60">{word.context}</span>}
            </div>
        </div>
    );
}
