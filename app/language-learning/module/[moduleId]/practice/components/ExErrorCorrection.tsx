import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../page';
import { AnswerBox } from './AnswerBox';
import { CheckFooter } from './CheckFooter';

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
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-1">
                    <span className="text-red-500 font-bold text-base mt-0.5 flex-shrink-0">✕</span>
                    <p className="text-xl font-bold text-red-800 leading-snug">{exercise.prompt}</p>
                </div>
                {exercise.promptTranslation && (
                    <p className="text-sm text-black/50 mt-2 text-center">Meaning: {exercise.promptTranslation}</p>
                )}
            </div>

            {/* Correction input */}
            <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-black/50 mb-2">
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
                        className="w-full bg-black/6 border-2 border-cyan-600/50 focus:border-cyan-600 rounded-xl px-4 py-3 text-base font-semibold text-black outline-none transition-colors disabled:opacity-50"
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
