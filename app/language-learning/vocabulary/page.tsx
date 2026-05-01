'use client'

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { TomeLanguageAPI, Word } from "@/api/TomeLanguageAPI";
import { Input } from "@/components/ui/input";

export default function VocabularyPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [words, setWords] = useState<Word[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Vocabulary',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    const loadVocabulary = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await new TomeLanguageAPI().getVocabulary('danish');
            // Sort alphabetically by Danish word (translation)
            const sortedWords = response.words.sort((a, b) =>
                a.translation.localeCompare(b.translation, 'da')
            );
            setWords(sortedWords);
        } catch (err) {
            console.error('Error loading vocabulary:', err);
            setError('Failed to load vocabulary. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadVocabulary();
    }, []);

    // Client-side filtering
    const filteredWords = useMemo(() => {
        if (!searchQuery.trim()) return words;

        const query = searchQuery.toLowerCase();
        return words.filter(word =>
            word.translation.toLowerCase().includes(query) ||
            word.english.toLowerCase().includes(query)
        );
    }, [words, searchQuery]);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 app-content flex flex-col !overflow-hidden">
                {/* Fixed Search Bar */}
                <div className="px-4 py-3 bg-background sticky top-0 z-10">
                    <Input
                        type="text"
                        placeholder="Search words..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-cyan-100 border-0 shadow-md text-cyan-900 placeholder:text-cyan-700/50 rounded-full"
                    />
                </div>

                {/* Word List */}
                <div className="flex-1 overflow-y-auto px-4">
                    {isLoading && <SkeletonList />}

                    {error && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <p className="text-cyan-900 mb-4">{error}</p>
                            <button
                                onClick={loadVocabulary}
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
                </div>
            </div>
        </div>
    );
}

function WordItem({ word }: { word: Word }) {
    return (
        <div className="py-3">
            <div className="text-primary font-medium text-lg">
                {word.translation}
            </div>
            <div className="text-muted-foreground text-sm">
                {word.english}
            </div>
        </div>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-3 pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonItem key={i} />
            ))}
        </div>
    );
}

function SkeletonItem() {
    return (
        <div className="py-3 animate-pulse">
            <div className="h-6 w-32 bg-gradient-to-r from-cyan-200 via-cyan-100 to-cyan-200 rounded mb-2 skeleton-shimmer">
                <span className="text-cyan-400 text-lg">Loading</span>
            </div>
            <div className="h-4 w-24 bg-gradient-to-r from-cyan-200 via-cyan-100 to-cyan-200 rounded skeleton-shimmer">
                <span className="text-cyan-300 text-sm">Loading</span>
            </div>
        </div>
    );
}
