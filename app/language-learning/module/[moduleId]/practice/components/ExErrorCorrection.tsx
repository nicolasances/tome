import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { AnswerAreaInput, AnswerBox } from './AnswerBox';
import { CheckFooter } from './CheckFooter';

interface ExErrorCorrectionProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    inputValue: string;
    onInputChange: (v: string) => void;
    onCheck: () => void;
    isSubmitting: boolean;
}

export function ExErrorCorrection({ exercise, submissionState, inputValue, onInputChange, onCheck, isSubmitting }: ExErrorCorrectionProps) {
    const submitted = submissionState !== null;
    const canCheck = inputValue.trim().length > 0 && !isSubmitting;

    return (
        <div className="flex flex-1 flex-col">
            {/* Erroneous sentence */}
            <div className="mt-8 px-1">
                <div className="text-xs text-center font-semibold uppercase tracking-widest text-black/50">
                    {'Correct the following incorrect sentence'}
                </div>
                <div className="text-center mt-4 px-1">
                    <p className="text-2xl font-bold text-black leading-snug text-red-800">{exercise.prompt}</p>
                </div>
                {exercise.promptTranslation && (
                    <p className="text-base text-black/50 mt-2 text-center">Meaning: {exercise.promptTranslation}</p>
                )}
            </div>

            {/* Correction input */}
            <div className="mt-6">
                {submitted ? (
                    <div className="flex justify-center">
                        <AnswerBox text={inputValue} ok={submissionState.isCorrect} block big />
                    </div>
                ) : (
                    <AnswerAreaInput value={inputValue} onChange={onInputChange} onSend={onCheck} canSend={canCheck} disabled={isSubmitting} autoFocus />
                )}
            </div>

            <div className="flex-1" />

            {!submitted && (
                <CheckFooter enabled={canCheck} onCheck={onCheck} />
            )}
        </div>
    );
}
