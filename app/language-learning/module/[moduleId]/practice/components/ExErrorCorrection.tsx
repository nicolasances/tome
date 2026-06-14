import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { AnswerBox } from './AnswerBox';
import { CheckFooter } from './CheckFooter';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

interface ExErrorCorrectionProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    inputValue: string;
    onInputChange: (v: string) => void;
    onCheck: () => void;
    isSubmitting: boolean;
}

export function ExErrorCorrection({exercise, submissionState, inputValue, onInputChange, onCheck, isSubmitting}: ExErrorCorrectionProps) {
    const submitted = submissionState !== null;
    const canCheck = inputValue.trim().length > 0 && !isSubmitting;

    return (
        <div className="flex flex-1 flex-col">
            {/* Erroneous sentence */}
            <div className="mt-8 px-1">
                <div className="flex items-center gap-2 border-2 border-red-800 rounded-2xl px-4 py-2 mb-1">
                    <span className="text-red-500 font-bold text-base mt-0.5 flex-shrink-0 mr-2"><MaskedSvgIcon src="/images/close.svg" alt="To be corrected" size="w-3 h-3" /></span>
                    <p className="text-lg font-bold text-red-800 leading-snug">{exercise.prompt}</p>
                </div>
                {exercise.promptTranslation && (
                    <p className="text-base text-black/50 mt-2 text-center">Meaning: {exercise.promptTranslation}</p>
                )}
            </div>

            {/* Correction input */}
            <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-black/50 mb-2 pl-2">
                    {submitted ? 'Your correction' : 'Write the corrected sentence'}
                </p>
                {submitted ? (
                    <AnswerBox text={inputValue} ok={submissionState.isCorrect} block big />
                ) : (
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => onInputChange(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && canCheck && onCheck()}
                        placeholder="Type the corrected sentence…"
                        disabled={isSubmitting}
                        className="w-full bg-transparent border-2 border-cyan-400 focus:border-lime-200 rounded-xl px-4 py-3 text-lg font-semibold text-black placeholder-cyan-200 outline-none transition-colors disabled:opacity-50"
                    />
                )}
            </div>

            <div className="flex-1" />

            {!submitted && (
                <CheckFooter enabled={canCheck} onCheck={onCheck} />
            )}
        </div>
    );
}
