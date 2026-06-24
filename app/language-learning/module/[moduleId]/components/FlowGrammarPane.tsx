'use client';

import { useEffect, useState } from 'react';
import { TomeModuleAPI, GrammarConcept } from '@/api/TomeModuleAPI';
import { ConceptCard } from '../grammar/components/ConceptCard';
import { SessionProgressBar } from '@/components/SessionProgressBar';

export function FlowGrammarPane({moduleId}: {moduleId: string}) {
    const [concepts, setConcepts] = useState<GrammarConcept[] | null | undefined>(undefined);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        new TomeModuleAPI()
            .getGrammarIntroduction(moduleId)
            .then((res) => setConcepts(res.concepts))
            .catch(() => setConcepts(null));
    }, [moduleId]);

    if (concepts === undefined) {
        return (
            <div aria-busy="true" aria-label="Loading grammar">
                <div className="skeleton-shimmer h-6 w-full rounded-full mb-4" />
                <div className="flex items-center gap-3 mb-4">
                    <div className="skeleton-shimmer w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="skeleton-shimmer h-5 w-48 rounded" />
                </div>
                <div className="skeleton-shimmer h-4 w-full rounded mb-2" />
                <div className="skeleton-shimmer h-4 w-10/12 rounded mb-2" />
                <div className="skeleton-shimmer h-4 w-9/12 rounded" />
            </div>
        );
    }

    if (concepts === null || concepts.length === 0) {
        return <p className="text-sm text-white/60">No grammar concepts available.</p>;
    }

    const concept = concepts[currentIndex];
    const total = concepts.length;

    return (
        <div className="flex flex-col gap-4">
            <SessionProgressBar total={total} mastered={currentIndex} deferred={0} />
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Grammar</span>
                <span className="text-xs font-bold text-white/60">{currentIndex + 1} / {total}</span>
            </div>
            <ConceptCard name={concept.name} explanation={concept.explanation} examples={concept.examples} />
        </div>
    );
}
