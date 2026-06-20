'use client';

import { useRef, useState, useCallback } from 'react';
import { TomeAnswerVerificationAPI } from '@/api/TomeAnswerVerificationAPI';

/** The live phase of an AI answer-verification flow; null means no verification is in progress (the ResultSheet is shown). */
export type VerifyPhase = 'loading' | 'valid' | 'invalid' | null;

export interface VerifyArgs {
    exerciseId: string;     // The translation exercise being verified.
    userAnswer: string;     // The learner's raw typed translation.
    sessionId: string;      // The practice session id or module-test attempt id the exercise belongs to.
    cefrLevel: string;      // The learner's CEFR level, e.g. "A1".
}

export interface AnswerVerification {
    phase: VerifyPhase;             // Current verification phase driving which tray (or none) renders.
    explanation: string;           // AI explanation shown when the answer is not accepted (phase === 'invalid').
    verify: (args: VerifyArgs) => void;  // Starts a verification; moves phase to 'loading' then 'valid'/'invalid'.
    cancel: () => void;            // Aborts an in-flight verification and returns to the ResultSheet (phase null).
    reset: () => void;             // Clears all verification state, used when advancing to the next exercise.
}

/**
 * Manages the "Check with AI" translation answer-verification flow used by both
 * Practice and the Module Test. Owns the loading → valid/invalid phase, the AI
 * explanation, and an abort controller so a verification can be cancelled.
 *
 * On any failure (network error, 409 already-verified, 400 non-translation) the
 * flow silently returns to the ResultSheet so the learner can still continue —
 * the button is one-shot, so re-verification is not offered.
 *
 * @returns {AnswerVerification} The verification state and its control functions.
 */
export function useAnswerVerification(): AnswerVerification {

    const [phase, setPhase] = useState<VerifyPhase>(null);
    const [explanation, setExplanation] = useState('');
    const controllerRef = useRef<AbortController | null>(null);

    const verify = useCallback((args: VerifyArgs) => {

        const controller = new AbortController();
        controllerRef.current = controller;

        setExplanation('');
        setPhase('loading');

        new TomeAnswerVerificationAPI()
            .verifyAnswer({ ...args, signal: controller.signal })
            .then(result => {
                if (controller.signal.aborted) return;
                if (result.valid) { setPhase('valid'); return; }
                setExplanation(result.explanation ?? '');
                setPhase('invalid');
            })
            .catch(() => {
                if (controller.signal.aborted) return;
                setPhase(null);
            });
    }, []);

    const cancel = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setPhase(null);
    }, []);

    const reset = useCallback(() => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        setExplanation('');
        setPhase(null);
    }, []);

    return { phase, explanation, verify, cancel, reset };
}
