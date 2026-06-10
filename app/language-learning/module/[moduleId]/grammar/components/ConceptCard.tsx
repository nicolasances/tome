import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { GrammarConcept } from '@/api/TomeModuleAPI';

/**
 * Renders a single grammar concept card for the Grammar Introduction step (F04).
 *
 * Layout (per module-screens.jsx → GrammarIntro):
 *   - Header row: lime circle (38px) with teacher icon + concept name as a heading
 *   - Explanation paragraph
 *   - 1–2 example rows: lime left-border, Danish text (bold) above English translation
 *
 * No card border — content is rendered inline (per 2026-06-09 change record).
 */
export function ConceptCard({ name, explanation, examples }: GrammarConcept) {
    return (
        <div className="flex flex-col">
            {/* ── Header: icon circle + concept name ─────────────────────── */}
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="flex items-center justify-center flex-shrink-0 rounded-full bg-lime-200"
                    style={{ width: 38, height: 38 }}
                >
                    <MaskedSvgIcon
                        src="/images/teacher.svg"
                        alt="Grammar concept"
                        size="w-5 h-5"
                        color="bg-cyan-800"
                    />
                </div>
                <div className="text-lg font-bold text-black/80 leading-tight">{name}</div>
            </div>

            {/* ── Explanation ─────────────────────────────────────────────── */}
            <p className="text-sm text-black/80 leading-relaxed">{explanation}</p>

            {/* ── Examples ────────────────────────────────────────────────── */}
            {examples.length > 0 && (
                <div className="flex flex-col gap-3 mt-4">
                    {examples.map((ex, i) => (
                        <div key={i} className="border-l-4 border-lime-300 pl-3">
                            <div className="text-base font-bold text-black/80">{ex.danish}</div>
                            <div className="text-xs text-black/60 mt-0.5">{ex.english}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
