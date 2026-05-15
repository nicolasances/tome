'use client'

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { MaskedSvgIcon, RoundButton } from "toto-react";
import { TomeLanguageAPI, SentenceWithStats } from "@/api/TomeLanguageAPI";
import { SentencesListSkeleton } from "@/app/components/LanguageLearningListSkeletons";
import { DifficultySignal } from "@/app/components/DifficultySignal";

const PAGE_SIZE = 100;

export default function SentencesPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [sentences, setSentences] = useState<SentenceWithStats[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const hasMore = sentences.length < totalCount;

    useEffect(() => {
        setConfig({
            title: 'Sentences',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning/knowledge-base'),
            },
        });
    }, [setConfig, router]);

    const loadPage = useCallback(async (page: number) => {
        try {
            const response = await new TomeLanguageAPI().getSentencesWithStats('danish', page, PAGE_SIZE);
            setTotalCount(response.totalCount);
            setSentences(prev => page === 1 ? response.sentences : [...prev, ...response.sentences]);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error loading sentences:', err);
            setError('Could not load sentences. Please try again.');
        }
    }, []);

    // Initial load
    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            setError(null);
            await loadPage(1);
            setIsLoading(false);
        };
        initialLoad();
    }, [loadPage]);

    // Infinite scroll: watch sentinel
    useEffect(() => {
        if (!sentinelRef.current || isLoading) return;

        observerRef.current?.disconnect();

        if (!hasMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore) {
                    const nextPage = currentPage + 1;
                    setIsLoadingMore(true);
                    loadPage(nextPage).finally(() => setIsLoadingMore(false));
                }
            },
            { rootMargin: '100px' }
        );

        observerRef.current.observe(sentinelRef.current);

        return () => observerRef.current?.disconnect();
    }, [hasMore, isLoading, isLoadingMore, currentPage, loadPage]);

    const retryLoad = () => {
        setError(null);
        setIsLoading(true);
        loadPage(1).finally(() => setIsLoading(false));
    };

    return (
        <div className="flex flex-1 flex-col items-stretch">

            {/* Generate FAB */}
            <div className="flex items-center justify-center mt-8 gap-4">
                <RoundButton
                    svgIconPath={{ src: "/images/magic.svg", alt: "Generate Sentences" }}
                    onClick={() => router.push('/language-learning/sentences/generate')}
                    type="primary"
                />
            </div>

            <div className="flex flex-col px-4 pt-4 gap-4 flex-1 items-stretch overflow-y-auto min-h-0">

                {/* Loading state */}
                {isLoading && <SentencesListSkeleton rows={7} />}

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-sm text-destructive text-center">{error}</p>
                        <button
                            className="text-sm text-primary underline"
                            onClick={retryLoad}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && !error && sentences.length === 0 && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-sm text-muted-foreground text-center">
                            No sentences yet. Tap the wand above to generate some.
                        </p>
                    </div>
                )}

                {/* Sentences list */}
                {!isLoading && !error && sentences.length > 0 && (
                    <div className="flex flex-col mt-4">
                        {sentences.map((sentence) => (
                            <SentenceRow key={sentence.id} sentence={sentence} />
                        ))}
                    </div>
                )}

                {/* Shimmer while loading next page */}
                {isLoadingMore && <SentencesListSkeleton rows={5} />}

                {/* Sentinel for IntersectionObserver */}
                <div ref={sentinelRef} className="h-1" />
            </div>
        </div>
    );
}

function SentenceRow({ sentence }: { sentence: SentenceWithStats }) {
    return (
        <div className="border-b border-cyan-600 py-2 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-2 flex-1 min-w-0 mr-3">
                <div className="shrink-0">
                    {sentence.knowledgeSource == 'tome-agent' && <MaskedSvgIcon src="/images/agent.svg" alt="Tome Agent" />}
                    {sentence.knowledgeSource != 'tome-agent' && <MaskedSvgIcon src="/images/book.svg" alt="Golden Source" />}
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-medium text-grey-900">{sentence.sentence}</div>
                    <div className="text-xs text-muted-foreground mt-1">{sentence.translation}</div>
                </div>
            </div>
            <div className="shrink-0">
                <DifficultySignal failureRatio={sentence.stats?.failureRatio ?? null} />
            </div>
        </div>
    );
}

