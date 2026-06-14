import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../page';
import { AnswerBox } from './AnswerBox';
import { SendFooter } from './SendFooter';

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

    return (
        <div className="flex flex-1 flex-col">
            {/* English prompt */}
            <div className="text-center mt-8 px-1">
                <p className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-3">In Danish, say</p>
                <p className="text-2xl font-bold text-black leading-snug">{exercise.prompt}</p>
            </div>

            {/* Answer box after submission */}
            {submitted && (
                <div className="flex justify-center mt-6 px-1">
                    <AnswerBox text={inputValue} ok={submissionState.isCorrect} block big />
                </div>
            )}

            <div className="flex-1" />

            {!submitted && (
                <SendFooter
                    value={inputValue}
                    onChange={onInputChange}
                    onSend={onSend}
                    placeholder="Type Danish translation…"
                    disabled={isSubmitting}
                    autoFocus
                />
            )}
        </div>
    );
}
