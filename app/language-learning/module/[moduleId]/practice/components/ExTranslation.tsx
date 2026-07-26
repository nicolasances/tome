import { RoundButton } from 'toto-react';
import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../types';
import { AnswerBox, AnswerAreaInput } from './AnswerBox';

interface ExTranslationProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    inputValue: string;
    onInputChange: (v: string) => void;
    onSend: () => void;
    isSubmitting: boolean;
}

export function ExTranslation({exercise, submissionState, inputValue, onInputChange, onSend, isSubmitting}: ExTranslationProps) {
    const submitted = submissionState !== null;
    const canSend = inputValue.trim().length > 0 && !isSubmitting;

    return (
        <div className="flex flex-1 flex-col">
            {/* English prompt */}
            <div className="text-center mt-8 px-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-3">In Danish, say</p>
                <p className="text-2xl font-bold text-black leading-snug">{exercise.prompt}</p>
            </div>

            {/* Answer input / answer box after submission */}
            <div className="mt-6 px-4">
                {submitted ? (
                    <div className="flex justify-center">
                        <AnswerBox text={inputValue} ok={submissionState.isCorrect} block big />
                    </div>
                ) : (
                    <AnswerAreaInput value={inputValue} onChange={onInputChange} onSend={onSend} canSend={canSend} disabled={isSubmitting} autoFocus />
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
