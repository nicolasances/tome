import { RoundButton } from 'toto-react';
import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { AnswerBox, AnswerLine, AnswerLineInput } from './AnswerBox';

interface ExFillBlankProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    inputValue: string;
    onInputChange: (v: string) => void;
    onSend: () => void;
    isSubmitting: boolean;
}

export function ExFillBlank({exercise, submissionState, inputValue, onInputChange, onSend, isSubmitting}: ExFillBlankProps) {
    const submitted = submissionState !== null;
    const canSend = inputValue.trim().length > 0 && !isSubmitting;

    // Split prompt on ___ to render inline blank
    const parts = exercise.prompt.split('___');
    const hasParts = parts.length === 2;

    return (
        <div className="flex flex-1 flex-col">
            <div className="mt-8 px-1">
                {hasParts ? (
                    <div className="text-2xl font-bold text-black text-center leading-relaxed flex flex-wrap justify-center items-end gap-1.5">
                        <span>{parts[0].trim()}</span>
                        {submitted ? (
                            <AnswerLine text={inputValue || submissionState.correctAnswer} ok={submissionState.isCorrect} />
                        ) : (
                            <AnswerLineInput value={inputValue} onChange={onInputChange} onSend={onSend} canSend={canSend} disabled={isSubmitting} autoFocus />
                        )}
                        <span>{parts[1].trim()}</span>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-2xl font-bold text-black">{exercise.prompt}</p>
                        {submitted && (
                            <div className="flex justify-center mt-4">
                                <AnswerBox text={inputValue} ok={submissionState.isCorrect} />
                            </div>
                        )}
                    </div>
                )}
                {exercise.promptTranslation && (
                    <p className="text-base text-black/50 mt-3 text-center">{exercise.promptTranslation}</p>
                )}
            </div>

            <div className="flex-1" />

            {!submitted && (
                <div className="flex justify-end px-4 pb-4 pt-2">
                    <RoundButton
                        svgIconPath={{ src: '/images/send.svg', alt: 'Send' }}
                        type="primary"
                        size="m"
                        disabled={!canSend}
                        onClick={onSend}
                    />
                </div>
            )}
        </div>
    );
}
