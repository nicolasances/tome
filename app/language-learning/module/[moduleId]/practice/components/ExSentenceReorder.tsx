import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { CheckFooter } from './CheckFooter';
import { tagWords } from '@/utils/sentenceReorderWords';

interface WordTileProps {
    word: string;
    tone?: 'correct' | 'wrong' | 'bank' | 'placed';
    onClick?: () => void;
    disabled?: boolean;
}

function WordTile({word, tone, onClick, disabled}: WordTileProps) {
    const styles: Record<string, string> = {
        placed: 'bg-white/80 text-black border-transparent cursor-pointer hover:bg-white',
        bank: 'bg-lime-200 text-cyan-900 border-transparent cursor-pointer hover:bg-lime-300',
        correct: 'bg-lime-100/40 text-black border-lime-200 cursor-default',
        wrong: 'bg-red-600/10 text-red-700 border-red-500 cursor-default',
    };
    const base = styles[tone ?? 'bank'];

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 rounded-xl text-base font-semibold border-2 transition-colors ${base} disabled:opacity-60`}>
            {word}
        </button>
    );
}

interface ExSentenceReorderProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    builtWordIds: number[];
    onToggleWord: (id: number) => void;
    onCheck: () => void;
    isSubmitting: boolean;
}

export function ExSentenceReorder({exercise, submissionState, builtWordIds, onToggleWord, onCheck, isSubmitting}: ExSentenceReorderProps) {
    const allWords = tagWords(exercise.words ?? []);
    const bankWords = allWords.filter(w => !builtWordIds.includes(w.id));
    const placedWords = builtWordIds.map(id => allWords.find(w => w.id === id)!);
    const submitted = submissionState !== null;
    const allPlaced = builtWordIds.length === allWords.length;

    function tileTone(): 'correct' | 'wrong' {
        return submissionState?.isCorrect ? 'correct' : 'wrong';
    }

    return (
        <div className="flex flex-1 flex-col">
            {/* Prompt */}
            {exercise.prompt && (
                <div className="text-center mt-6">
                    <p className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-2">Say in Danish</p>
                    <p className="text-2xl font-bold text-black">{exercise.prompt}</p>
                </div>
            )}

            {/* Build area */}
            <div className={`mt-6 min-h-14 border-b-2 pb-3 flex flex-wrap gap-2 items-center transition-colors ${
                submitted && !submissionState?.isCorrect ? 'border-red-800' : 'border-cyan-400'
            }`}>
                {placedWords.length === 0 && !submitted && (
                    <span className="text-sm text-black/30">Tap words below to build the sentence</span>
                )}
                {placedWords.map(word => (
                    <WordTile
                        key={`placed-${word.id}`}
                        word={word.text}
                        tone={submitted ? tileTone() : 'placed'}
                        onClick={() => !submitted && !isSubmitting && onToggleWord(word.id)}
                        disabled={submitted || isSubmitting}
                    />
                ))}
            </div>

            {/* Word bank */}
            {!submitted && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {bankWords.map(word => (
                        <WordTile
                            key={`bank-${word.id}`}
                            word={word.text}
                            tone="bank"
                            onClick={() => !isSubmitting && onToggleWord(word.id)}
                            disabled={isSubmitting}
                        />
                    ))}
                </div>
            )}

            <div className="flex-1" />

            {!submitted && (
                <CheckFooter enabled={allPlaced && !isSubmitting} onCheck={onCheck} />
            )}
        </div>
    );
}
