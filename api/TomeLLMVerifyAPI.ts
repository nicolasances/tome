export interface LLMVerifyResult {
    acceptable: boolean;
    explanation: string;
}

export class TomeLLMVerifyAPI {

    /**
     * Calls the internal /api/llm-verify route to check whether a learner's
     * Danish answer is an acceptable translation of the given English sentence.
     * Uses a Gemini Flash → Pro cascade on Vertex AI.
     */
    async verifyAnswer(
        originalSentence: string,
        userAnswer: string,
        expectedAnswer: string,
        language: string
    ): Promise<LLMVerifyResult> {
        const response = await fetch('/api/llm-verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalSentence, userAnswer, expectedAnswer, language }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message ?? `LLM verify failed (${response.status})`);
        }

        return response.json();
    }
}
