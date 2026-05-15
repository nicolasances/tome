'use client'

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { TomeLanguageAPI, WordWithStats } from "@/api/TomeLanguageAPI";
import { Input } from "@/components/ui/input";
import { VocabularyListSkeleton } from "@/app/components/LanguageLearningListSkeletons";

const PAGE_SIZE = 100;

export default function VocabularyPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [words, setWords] = useState<WordWithStats[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const hasMore = words.length < totalCount;

    useEffect(() => {
        setConfig({
            title: 'Vocabulary',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning/knowledge-base'),
            },
        });
    }, [setConfig, router]);

    const loadPage = useCallback(async (page: number) => {
        try {
            const response = await new TomeLanguageAPI().getVocabularyWithStats('danish', page, PAGE_SIZE);
            setTotalCount(response.totalCount);
            setWords(prev => page === 1 ? response.words : [...prev, ...response.words]);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error loading vocabulary:', err);
            setError('Failed to load vocabulary. Please try again.');
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

    const filteredWords = useMemo(() => {
        if (!searchQuery.trim()) return words;
        const query = searchQuery.toLowerCase();
        return words.filter(word =>
            word.translation.toLowerCase().includes(query) ||
            word.english.toLowerCase().includes(query)
        );
    }, [words, searchQuery]);

    const retryLoad = () => {
        setError(null);
        setIsLoading(true);
        loadPage(1).finally(() => setIsLoading(false));
    };

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Fixed Search Bar */}
                <div className="px-4 py-3 bg-background sticky top-0 z-10">
                    <Input
                        type="text"
                        placeholder="Search words..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                        className="w-full border border-cyan-600 text-cyan-900 placeholder:text-cyan-700/50 rounded-full focus-visible:border-lime-200"
                    />
                </div>

                {/* Word List */}
                <div className="flex-1 overflow-y-auto px-4 pl-8 mt-4">
                    {isLoading && <VocabularyListSkeleton rows={10} />}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-cyan-900 mb-4">{error}</p>
                            <button
                                onClick={retryLoad}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && words.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-cyan-900/70">No vocabulary words yet</p>
                        </div>
                    )}

                    {!isLoading && !error && words.length > 0 && filteredWords.length === 0 && (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-cyan-900/70">No words match your search</p>
                        </div>
                    )}

                    {!isLoading && !error && filteredWords.length > 0 && (
                        <div className="space-y-3 pb-4">
                            {filteredWords.map((word) => (
                                <WordItem key={word.id} word={word} />
                            ))}
                        </div>
                    )}

                    {/* Shimmer while loading next page */}
                    {isLoadingMore && <VocabularyListSkeleton rows={5} />}

                    {/* Sentinel for IntersectionObserver */}
                    <div ref={sentinelRef} className="h-1" />
                </div>
            </div>
        </div>
    );
}

function WordItem({ word }: { word: WordWithStats }) {
    return (
        <div className="">
            <div className="text-grey-900 font-bold text-lg">
                {word.translation}
            </div>
            <div className="text-muted-foreground text-sm ">
                {word.english}
            </div>
        </div>
    );
}
