import { useMemo } from 'react';
import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { CheckFooter } from './CheckFooter';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

const KEYS = ['A', 'B', 'C', 'D'] as const;

function seededShuffle<T>(arr: T[], seed: string): T[] {
    const hash = seed.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = (hash * (i + 1)) % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

interface ExMultipleChoiceProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    selectedOption: string | null;
    onSelect: (key: string) => void;
    onCheck: () => void;
    isSubmitting: boolean;
}

export function ExMultipleChoice({exercise, submissionState, selectedOption, onSelect, onCheck, isSubmitting}: ExMultipleChoiceProps) {
    // Build option list: correct answer + distractors, shuffled deterministically
    const options = useMemo(() => {
        const all = [exercise.answer, ...exercise.distractors];
        const shuffled = seededShuffle(all, exercise.id);
        return shuffled.slice(0, 4).map((word, i) => ({ key: KEYS[i], word }));
    }, [exercise.id, exercise.answer, exercise.distractors]);

    const correctKey = options.find(o => o.word === exercise.answer)?.key ?? null;
    const submitted = submissionState !== null;

    // Parse sentence parts around blank (supports ___ marker)
    const parts = exercise.prompt.split('___');
    const hasParts = parts.length === 2;

    function optionStyle(key: string, word: string) {
        if (!submitted) {
            const selected = word === selectedOption;
            return {
                bg: selected ? 'bg-lime-200 border-lime-200' : 'bg-transparent border-cyan-400',
                badgeBg: selected ? 'bg-cyan-800 text-lime-200' : 'bg-transparent border border-black/25 text-black/50',
                text: 'text-black',
                badge: null as string | null,
            };
        }
        const isCorrect = key === correctKey;
        const isChosen = word === selectedOption;
        if (isCorrect) return { bg: 'border-lime-200', badgeBg: 'bg-cyan-800 text-lime-200', text: 'text-black', badge: <MaskedSvgIcon src="/images/tick.svg" alt="Correct" size="w-6 h-6" color="bg-lime-200" /> };
        if (isChosen && !isCorrect) return { bg: 'border-red-800', badgeBg: 'bg-red-800 text-white', text: 'text-black', badge: <MaskedSvgIcon src="/images/close.svg" alt="Incorrect" size="w-3 h-3" color="bg-white" /> };
        return { bg: 'bg-transparent border-cyan-500/20 opacity-50', badgeBg: 'bg-transparent border border-black/20 text-black/40', text: 'text-black/50', badge: null };
    }

    return (
        <div className="flex flex-1 flex-col">
            {/* Sentence with blank */}
            <div className="text-center mt-6 px-1">
                <div className="text-2xl font-bold text-black leading-snug flex flex-wrap justify-center items-end gap-1">
                    {hasParts ? (
                        <>
                            <span>{parts[0].trim()}</span>
                            <span className={`inline-block min-w-16 border-b-2 ${submitted && submissionState?.isCorrect ? 'border-lime-200' : 'border-lime-200'} px-1 mx-1 text-center`}>
                                {submitted ? exercise.answer : (selectedOption ?? ' ')}
                            </span>
                            <span>{parts[1].trim()}</span>
                        </>
                    ) : (
                        <span>{exercise.prompt}</span>
                    )}
                </div>
                {exercise.promptTranslation && (
                    <p className="text-base text-black/70 mt-3">{exercise.promptTranslation}</p>
                )}
            </div>

            {/* Options */}
            <div className="flex flex-col gap-2.5 mt-6">
                {options.map(({ key, word }) => {
                    const s = optionStyle(key, word);
                    return (
                        <button
                            key={key}
                            onClick={() => !submitted && !isSubmitting && onSelect(word)}
                            disabled={submitted || isSubmitting}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-colors text-left w-full ${s.bg}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${s.badgeBg}`}>
                                {s.badge ?? key}
                            </div>
                            <span className={`text-base font-semibold flex-1 ${s.text}`}>{word}</span>
                        </button>
                    );
                })}
            </div>

            {/* AnswerBox for typed exercises after submission (not applicable to MC, but keep layout consistent) */}
            <div className="flex-1" />

            {/* Footer */}
            {!submitted && (
                <CheckFooter enabled={selectedOption !== null && !isSubmitting} onCheck={onCheck} />
            )}
        </div>
    );
}
