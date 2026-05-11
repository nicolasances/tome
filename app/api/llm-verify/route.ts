import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT ?? '';
const LOCATION = process.env.VERTEX_AI_LOCATION ?? 'europe-west1';

const FLASH_MODEL = 'gemini-2.0-flash';
const PRO_MODEL = 'gemini-2.5-pro';

function buildPrompt(originalSentence: string, expectedAnswer: string, userAnswer: string): string {
    return `You are evaluating a language learner's Danish translation.
English sentence to translate: "${originalSentence}"
Reference Danish answer: "${expectedAnswer}"
Learner's answer: "${userAnswer}"
Is the learner's answer an acceptable Danish translation of the English sentence?
A translation is acceptable if it conveys the same meaning correctly, even if phrased slightly differently. Minor word-order differences or synonyms are acceptable; wrong grammar or wrong meaning is not.
Respond with JSON only: {"acceptable": true or false, "explanation": "<one sentence>"}`;
}

async function callGemini(
    vertexAI: VertexAI,
    modelName: string,
    prompt: string
): Promise<{ acceptable: boolean; explanation: string }> {
    const model = vertexAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    const parsed = JSON.parse(text);
    if (typeof parsed.acceptable !== 'boolean' || typeof parsed.explanation !== 'string') {
        throw new Error('Unexpected model response shape');
    }
    return { acceptable: parsed.acceptable, explanation: parsed.explanation };
}

export async function POST(request: NextRequest) {
    try {
        const { originalSentence, userAnswer, expectedAnswer, language } = await request.json();

        if (!originalSentence || !userAnswer || !expectedAnswer || !language) {
            return NextResponse.json(
                { message: 'originalSentence, userAnswer, expectedAnswer, and language are required' },
                { status: 400 }
            );
        }

        if (!PROJECT_ID) {
            return NextResponse.json(
                { message: 'GCP project not configured' },
                { status: 500 }
            );
        }

        const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
        const prompt = buildPrompt(originalSentence, expectedAnswer, userAnswer);

        const flashResult = await callGemini(vertexAI, FLASH_MODEL, prompt);
        if (flashResult.acceptable) {
            return NextResponse.json(flashResult);
        }

        const proResult = await callGemini(vertexAI, PRO_MODEL, prompt);
        return NextResponse.json(proResult);
    } catch (error) {
        console.error('LLM verify error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
