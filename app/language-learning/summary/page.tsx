'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { SessionSummary } from '@/model/VocabularyPractice';
import { RoundButton } from 'toto-react';

export default function SessionSummaryPage() {
    const router = useRouter();
    const { setConfig } = useHeader();
    const [summary, setSummary] = useState<SessionSummary | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Session Complete',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    useEffect(() => {
        const raw = sessionStorage.getItem('vocab-practice-summary');
        if (!raw) {
            router.push('/language-learning');
            return;
        }
        try {
            const parsed: SessionSummary = JSON.parse(raw);
            setSummary(parsed);
        } catch {
            router.push('/language-learning');
        }
    }, [router]);

    if (!summary) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    const failedWords = summary.wordResults.filter((w) => w.failedAttempts > 0);

    return (
        <div className="flex flex-1 flex-col items-stretch px-6 py-8 gap-8">
            {/* Score summary */}
            <div className="flex flex-col items-center gap-4">
                <div className="text-6xl font-bold text-primary">{summary.accuracy}%</div>
                <div className="text-muted-foreground text-sm">Accuracy</div>

                <div className="flex gap-8 mt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{summary.totalWords}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Words</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold text-green-600">{summary.firstAttemptCorrect}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">First Attempt</span>
                    </div>
                </div>
            </div>

            {/* Words with errors */}
            {failedWords.length > 0 && (
                <div className="flex flex-col gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Words to Review
                    </h2>
                    <ul className="flex flex-col gap-2">
                        {failedWords.map((w) => (
                            <li
                                key={w.wordId}
                                className="flex justify-between items-center bg-muted rounded-lg px-4 py-3"
                            >
                                <span className="text-sm">
                                    <span className="font-medium">{w.english}</span>
                                    <span className="text-muted-foreground"> → </span>
                                    <span className="font-medium">{w.translation}</span>
                                </span>
                                <span className="text-xs text-red-500">
                                    {w.failedAttempts} {w.failedAttempts === 1 ? 'mistake' : 'mistakes'}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Return button */}
            <div className="flex flex-col items-center gap-2 mt-auto">
                <RoundButton
                    svgIconPath={{ src: "/images/home.svg", alt: "Return to Language Learning" }}
                    onClick={() => router.push('/language-learning')}
                />
                <span className="text-xs text-muted-foreground">Return to Language Learning</span>
            </div>
        </div>
    );
}
