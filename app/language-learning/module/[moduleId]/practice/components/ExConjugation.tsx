import { RoundButton } from 'toto-react';
import { Exercise } from '@/api/TomePracticeSessionAPI';
import { SubmissionState } from '../page';
import { AnswerBox } from './AnswerBox';

interface ExConjugationProps {
    exercise: Exercise;
    submissionState: SubmissionState | null;
    inputValue: string;
    onInputChange: (v: string) => void;
    onSend: () => void;
    isSubmitting: boolean;
}

export function ExConjugation({exercise, submissionState, inputValue, onInputChange, onSend, isSubmitting}: ExConjugationProps) {
    const submitted = submissionState !== null;
    const canSend = inputValue.trim().length > 0 && !isSubmitting;

    // The prompt format for conjugation_drill is expected to be the infinitive form.
    // promptTranslation is the English gloss.

    return (
        <div className="flex flex-1 flex-col items-stretch">
            {/* Verb chip */}
            <div className="flex justify-center mt-8">
                <div className="inline-flex items-center gap-2 border border-cyan-500/60 rounded-full px-4 py-2">
                    <span className="text-base font-bold text-black">{exercise.prompt}</span>
                    {exercise.promptTranslation && (
                        <span className="text-sm text-black/50">{exercise.promptTranslation}</span>
                    )}
                </div>
            </div>

            {/* Subject → form layout */}
            <div className="flex items-center justify-center gap-4 mt-8">
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/50 mb-1">Subject</p>
                    <p className="text-2xl font-bold text-black">jeg</p>
                </div>
                <span className="text-xl text-black/30 font-light">→</span>
                <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-widest text-black/50 mb-1">Present</p>
                    {submitted ? (
                        <AnswerBox text={inputValue} ok={submissionState.isCorrect} big />
                    ) : (
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => onInputChange(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && canSend && onSend()}
                            placeholder="…"
                            disabled={isSubmitting}
                            className="bg-black/6 border-2 border-cyan-600/50 focus:border-cyan-600 rounded-xl px-4 py-2.5 text-xl font-bold text-black text-center min-w-32 outline-none transition-colors disabled:opacity-50"
                        />
                    )}
                </div>
            </div>

            <div className="flex-1" />

            {/* Standalone send button — right-aligned, no full footer */}
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
