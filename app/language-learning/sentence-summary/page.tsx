'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { SentenceSessionSummary } from '@/model/SentencePractice';
import { RoundButton } from 'toto-react';

export default function SentenceSummaryPage() {
    const router = useRouter();
    const { setConfig } = useHeader();
    const [summary, setSummary] = useState<SentenceSessionSummary | null>(null);

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
        const raw = sessionStorage.getItem('sentence-practice-summary');
        if (!raw) {
            router.push('/language-learning');
            return;
        }
        try {
            const parsed: SentenceSessionSummary = JSON.parse(raw);
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

    const failedSentences = summary.sentenceResults.filter((s) => s.failedAttempts > 0);

    return (
        <div className="flex flex-1 flex-col items-stretch px-6 py-8 gap-8">
            {/* Score summary */}
            <div className="flex flex-col items-center gap-4">
                <div className="text-muted-foreground text-xs uppercase tracking-widest">You scored</div>
                <div className="text-4xl font-bold text-primary">{summary.accuracy}%</div>

                <div className="flex gap-8 mt-2">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold">{summary.totalSentences}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Total Sentences</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-semibold text-green-300">{summary.firstAttemptCorrect}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">First Attempt</span>
                    </div>
                </div>
            </div>

            {/* Sentences with errors */}
            {failedSentences.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        Sentences to Review
                    </div>
                    <div className="flex flex-col gap-2">
                        {failedSentences.map((s) => (
                            <div
                                key={s.sentenceId}
                                className="flex flex-col gap-1 bg-muted rounded-lg px-4 py-3"
                            >
                                <div className="text-base font-medium">{s.sentence}</div>
                                <div className="text-sm text-muted-foreground">{s.translation}</div>
                                <div className="text-sm text-red-800 mt-1">
                                    <span className="font-bold">{s.failedAttempts}</span>{' '}
                                    {s.failedAttempts === 1 ? 'mistake' : 'mistakes'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Return button */}
            <div className="flex flex-col items-center gap-2 mt-auto">
                <RoundButton
                    svgIconPath={{ src: '/images/home.svg', alt: 'Return to Language Learning' }}
                    onClick={() => router.push('/language-learning')}
                />
            </div>
        </div>
    );
}
