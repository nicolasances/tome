import { TotoAPI } from "./TotoAPI";

/**
 * API class for module content retrieval.
 * Wraps the tome-ms-language backend.
 *
 * Endpoint mapping (basepath handled by NEXT_PUBLIC_TOME_LANGUAGE_API_ENDPOINT):
 *   - GET /modules/:id   → full module document for the Module Overview screen
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
}

// ─── API response types ────────────────────────────────────────────────────────

export interface ModuleResponse {
    id: string;
    cefrLevel: string;
    /** Short theme label, e.g. "Identity & introductions" */
    theme: string;
    title: string;
    /** Full communication goal sentence, e.g. "Introduce yourself — …" */
    communicationGoal: string;
    /** Grammar concepts covered by the module, enriched with names */
    grammarConceptId: string[];
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

