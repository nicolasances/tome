'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { RoundButton } from 'toto-react';
import { TomeModuleAPI, GrammarConcept } from '@/api/TomeModuleAPI';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomePracticeSessionAPI } from '@/api/TomePracticeSessionAPI';
import { SessionProgressBar } from '@/components/SessionProgressBar';
import { ConceptCard } from './components/ConceptCard';

// ─── Skeleton ────────────────────────────────────────────────────────────────

function GrammarIntroSkeleton() {
    return (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading grammar introduction">
            {/* SessionBar */}
            <div className="h-6 w-full rounded-full skeleton-shimmer" />
            {/* Counter row */}
            <div className="flex justify-between">
                <div className="h-3 w-16 rounded-md skeleton-shimmer" />
                <div className="h-3 w-10 rounded-md skeleton-shimmer" />
            </div>
            {/* Concept card */}
            <div className="flex flex-col gap-3 mt-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="h-5 w-6/12 rounded-md skeleton-shimmer" />
                </div>
                <div className="h-4 w-full rounded-md skeleton-shimmer" />
                <div className="h-4 w-10/12 rounded-md skeleton-shimmer" />
                <div className="h-4 w-9/12 rounded-md skeleton-shimmer" />
                <div className="flex flex-col gap-3 mt-2">
                    {[0, 1].map((i) => (
                        <div key={i} className="border-l-4 border-lime-200 pl-3 flex flex-col gap-1">
                            <div className="h-4 w-7/12 rounded-md skeleton-shimmer" />
                            <div className="h-3 w-5/12 rounded-md skeleton-shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageData {
    concepts: GrammarConcept[];
    userId: string;
    moduleTitle: string;
}

export default function GrammarIntroPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();

    const moduleId = params.moduleId as string;

    // undefined = loading, null = error
    const [data, setData] = useState<PageData | null | undefined>(undefined);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isStartingSession, setIsStartingSession] = useState(false);

    // ── Header ────────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: data?.moduleTitle ?? 'Grammar',
            backButton: { enabled: true, onClick: () => router.back() },
        });
    }, [setConfig, router, data?.moduleTitle]);

    // ── Load all data in parallel ─────────────────────────────────────────────
    useEffect(() => {
        Promise.all([
            new TomeModuleAPI().getGrammarIntroduction(moduleId),
            new TomeLearningDashboardAPI().getMe(),
            new TomeModuleAPI().getModule(moduleId),
        ]).then(([grammarIntro, me, module]) => {
            setData({
                concepts: grammarIntro.concepts,
                userId: me.id,
                moduleTitle: module.title,
            });
        }).catch(() => setData(null));
    }, [moduleId]);

    // ── Advance / exit ────────────────────────────────────────────────────────
    const handleNext = async () => {
        if (!data || isStartingSession) return;

        const isLast = currentIndex === data.concepts.length - 1;

        if (!isLast) {
            setCurrentIndex((prev) => prev + 1);
            return;
        }

        // Last concept — start the practice session and navigate into Practice
        setIsStartingSession(true);
        try {
            await new TomePracticeSessionAPI().startPracticeSession(data.userId, moduleId);
        } catch {
            // On unexpected failure, still navigate — the practice page handles session load
        } finally {
            router.push(`/language-learning/module/${moduleId}/practice`);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const concept = data?.concepts[currentIndex];
    const total = data?.concepts.length ?? 0;

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">

            {/* ── Top bar: SessionBar + counter row ─────────────────────────── */}
            <div className="px-5 pt-2">
                {data && total > 0 ? (
                    <>
                        <SessionProgressBar total={total} mastered={currentIndex} deferred={0} />
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">
                                Grammar
                            </span>
                            <span className="text-xs font-bold text-black/60">
                                {currentIndex + 1} / {total}
                            </span>
                        </div>
                    </>
                ) : data === undefined ? (
                    <>
                        <div className="h-6 w-full rounded-full skeleton-shimmer" />
                        <div className="flex justify-between mt-2">
                            <div className="h-3 w-16 rounded-md skeleton-shimmer" />
                            <div className="h-3 w-10 rounded-md skeleton-shimmer" />
                        </div>
                    </>
                ) : null}
            </div>

            {/* ── Scrollable concept area ───────────────────────────────────── */}
            <div className="flex flex-1 flex-col px-5 pt-4 pb-0 overflow-y-auto">

                {data === undefined && <GrammarIntroSkeleton />}

                {data === null && (
                    <p className="text-sm text-cyan-600 mt-4">
                        Failed to load grammar concepts. Please try again.
                    </p>
                )}

                {data && concept && (
                    <ConceptCard
                        name={concept.name}
                        explanation={concept.explanation}
                        examples={concept.examples}
                    />
                )}

                <div className="flex-1" />
            </div>

            {/* ── Next control ──────────────────────────────────────────────── */}
            {data && (
                <div className="flex justify-end px-5 py-4">
                    <RoundButton
                        svgIconPath={{ src: '/images/point-right.svg', alt: 'Next' }}
                        type="primary"
                        size="m"
                        loading={isStartingSession}
                        onClick={handleNext}
                    />
                </div>
            )}
        </div>
    );
}
