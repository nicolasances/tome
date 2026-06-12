import { TotoAPI } from "./TotoAPI";

/**
 * API class for module content retrieval.
 * Wraps the tome-ms-language backend.
 *
 * Endpoint mapping (basepath handled by NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT):
 *   - GET /modules/:id                        → full module document for the Module Overview screen
 *   - GET /modules/:moduleId/grammarIntroduction → grammar concepts for Step 1 (F04)
 */
export class TomeModuleAPI {

    /**
     * Fetches the full module document by ID.
     * Returns title, theme, communication goal, grammar concepts (with names),
     * vocabulary count, and configurable step parameters.
     *
     * Endpoint: GET /modules/:id
     */
    async getModule(moduleId: string): Promise<ModuleResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/modules/${moduleId}`)).json();
    }

    /**
     * Fetches the module's grammar concepts for the Grammar Introduction screen (Step 1).
     * Returns concepts in presentation order (mirrors grammarConceptIds order on the module).
     * Each concept carries a pre-generated explanation and 1–2 Danish/English example pairs.
     * This endpoint is read-only — no backend write occurs.
     *
     * Endpoint: GET /modules/:moduleId/grammarIntroduction
     */
    async getGrammarIntroduction(moduleId: string): Promise<GrammarIntroductionResponse> {
        return (await new TotoAPI().fetch('tome-ms-language', `/modules/${moduleId}/grammarIntroduction`)).json();
    }
}

// ─── API response types ────────────────────────────────────────────────────────

// ── Grammar Introduction ──────────────────────────────────────────────────────

export interface GrammarExample {
    /** Danish sentence illustrating the concept */
    danish: string;
    /** English translation of the Danish example */
    english: string;
}

export interface GrammarConcept {
    /** Concept name, e.g. "Present Tense — at være" */
    name: string;
    /** Pre-generated explanation stored at seeding time; never regenerated live */
    explanation: string;
    /** 1–2 bilingual examples for the concept */
    examples: GrammarExample[];
}

export interface GrammarIntroductionResponse {
    /** Grammar concepts in presentation order (mirrors grammarConceptIds on the module) */
    concepts: GrammarConcept[];
}

// ── Module ────────────────────────────────────────────────────────────────────

export interface ModuleResponse {
    id: string;
    cefrLevel: string;
    /** Short theme label, e.g. "Identity & introductions" */
    theme: string;
    title: string;
    /** Full communication goal sentence, e.g. "Introduce yourself — …" */
    communicationGoal: string;
    /** Grammar concepts covered by the module, enriched with names */
    grammarConceptIds: string[];
    /** List of all vocabulary items in the module */
    vocabularyItemIds: string[]; 
    /** Total number of vocabulary items in the module */
    vocabularyCount: number;
    /** §3.1.2 configurable parameters */
    practiceSessionSize: number;
    testQuestionCount: number;
    /** Percentage, 0–100, e.g. 80 */
    testPassThreshold: number;
    /** Hours after practice completion before the Module Test unlocks */
    testUnlockDelayHours: number;
}

