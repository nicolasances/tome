import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { AnswerBox } from './AnswerBox';
import { SendFooter } from './SendFooter';

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
                            <AnswerBox text={inputValue || submissionState.correctAnswer} ok={submissionState.isCorrect} />
                        ) : (
                            <span className="inline-block min-w-20 border-b-2 border-cyan-600 px-2 py-0.5 text-center text-cyan-700">
                                {inputValue || <span className="opacity-0">placeholder</span>}
                            </span>
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
                <SendFooter
                    value={inputValue}
                    autoFocus={true}
                    onChange={onInputChange}
                    onSend={onSend}
                    placeholder="Type the missing word…"
                    disabled={isSubmitting}
                />
            )}
        </div>
    );
}
