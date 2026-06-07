interface GrammarConceptRef {
    id: string;
    name: string;
}

export function ScopeChips({
    grammarConcepts,
    vocabularyCount,
}: {
    grammarConcepts: GrammarConceptRef[];
    vocabularyCount: number;
}) {
    return (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 14 }}>
            {grammarConcepts.map((concept) => (
                <span
                    key={concept.id}
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#164e63',
                        background: 'rgba(255,255,255,0.45)',
                        borderRadius: 9999,
                        padding: '5px 11px',
                    }}
                >
                    {concept.name}
                </span>
            ))}
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(0,0,0,0.50)',
                    padding: '5px 4px',
                }}
            >
                {vocabularyCount} words
            </span>
        </div>
    );
}
