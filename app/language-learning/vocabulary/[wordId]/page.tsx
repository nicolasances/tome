'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLanguageAPI, WordDetail, AlternativeTranslation } from '@/api/TomeLanguageAPI';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { RoundButton } from 'toto-react';

export default function WordDetailPage() {
    const router = useRouter();
    const params = useParams();
    const wordId = params.wordId as string;
    const { setConfig } = useHeader();

    const [word, setWord] = useState<WordDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newAlt, setNewAlt] = useState('');
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        setConfig({
            title: 'Word Details',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning/vocabulary'),
            },
        });
    }, [setConfig, router]);

    const loadWord = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await new TomeLanguageAPI().getWord('danish', wordId);
            setWord(data);
        } catch (e) {
            setError((e as Error).message ?? 'Failed to load word');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (wordId) loadWord();
    }, [wordId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRemoveAlternative = (alt: AlternativeTranslation) => {
        if (!word) return;
        // Optimistic remove
        setWord((prev) => prev ? { ...prev, alternativeTranslations: prev.alternativeTranslations.filter((a) => a.id !== alt.id) } : prev);
        new TomeLanguageAPI().removeWordAlternative('danish', wordId, alt.id)
            .catch((e) => {
                console.error('removeWordAlternative failed:', e);
                // Revert on error
                setWord((prev) => prev ? { ...prev, alternativeTranslations: [...prev.alternativeTranslations, alt] } : prev);
            });
    };

    const handleAddAlternative = async () => {
        const trimmed = newAlt.trim();
        if (!trimmed || !word || adding) return;
        setAdding(true);
        setNewAlt('');
        try {
            const created = await new TomeLanguageAPI().addWordAlternative('danish', wordId, trimmed);
            setWord((prev) => prev ? { ...prev, alternativeTranslations: [...prev.alternativeTranslations, created] } : prev);
        } catch (e) {
            console.error('addWordAlternative failed:', e);
            setNewAlt(trimmed); // restore on error
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    if (error || !word) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                <p className="text-destructive text-center">{error ?? 'Word not found'}</p>
                <button onClick={loadWord} className="px-4 py-2 rounded-md bg-primary text-primary-foreground">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col items-stretch px-6 pt-8 gap-6 overflow-y-auto">
            {/* Word header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-start gap-4">
                    <MaskedSvgIcon
                        src={word.knowledgeSource === 'tome-agent' ? '/images/agent.svg' : '/images/book.svg'}
                        alt={word.knowledgeSource}
                        size="w-5 h-5"
                        color="bg-cyan-800"
                    />
                    <div className='flex flex-col gap-1'>
                        <span className="text-xl font-bold text-foreground">{word.english}</span>
                        <span className="text-xs text-muted-foreground tracking-widest">{word.knowledgeSource}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Main Translation</span>
                <span className="text-lg font-bold">{word.translation}</span>
            </div>

            {/* Alternatives list */}
            <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Alternative Translations</span>
                {word.alternativeTranslations.length === 0 && (
                    <p className="text-sm text-muted-foreground">No alternatives yet.</p>
                )}
                {word.alternativeTranslations.map((alt) => (
                    <div key={alt.id} className="flex items-center justify-between border border-cyan-600 rounded-md px-4 py-2">
                        <span className="text-sm text-foreground">{alt.translation}</span>
                        <button
                            onClick={() => handleRemoveAlternative(alt)}
                            className="text-destructive text-xs ml-4 shrink-0"
                            aria-label="Remove"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Add new alternative */}
            <div className="flex flex-col gap-3 pb-8">
                <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Add Alternative</span>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newAlt}
                        onChange={(e) => setNewAlt(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddAlternative(); }}
                        placeholder="Type new translation…"
                        className="flex-1 border border-cyan-600 rounded-full px-4 py-2 text-sm text-cyan-900 placeholder:text-cyan-700/50 focus:outline-none focus:border-lime-200 bg-transparent"
                        disabled={adding}
                    />
                    <RoundButton
                        svgIconPath={{ src: '/images/point-right.svg', alt: 'Add', color: 'bg-lime-200' }}
                        onClick={handleAddAlternative}
                        type="primary"
                        loading={adding}
                    />
                </div>
            </div>
        </div>
    );
}
