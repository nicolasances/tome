'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { TomeLearningDashboardAPI } from '@/api/TomeLearningDashboardAPI';
import { TomeWordsPracticeAPI, WordsPracticeError } from '@/api/TomeWordsPracticeAPI';
import { deriveWordsResults, WordsResults } from '@/utils/wordsPracticeResults';
import { MiniStat } from '@/components/practice/MiniStat';
import { SavedChip } from '@/components/practice/SavedChip';

type LoadState = 'loading' | 'error' | 'notFound' | 'loaded';

export default function WordsPracticeResultsPage() {
    const params = useParams();
    const router = useRouter();
    const { setConfig } = useHeader();
    const sessionId = params.sessionId as string;

    const [userId, setUserId] = useState('');
    const [results, setResults] = useState<WordsResults | null>(null);
    const [loadState, setLoadState] = useState<LoadState>('loading');
    const [isStarting, setIsStarting] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({ title: 'Words Practice', backButton: { enabled: true, onClick: () => router.push('/language-learning') } });
    }, [setConfig, router]);

    useEffect(() => {
        async function load() {
            const me = await new TomeLearningDashboardAPI().getMe();
            const session = await new TomeWordsPracticeAPI().getSession(me.id, sessionId);

            if (!session) { setLoadState('notFound'); return; }
            if (session.status !== 'completed') { router.replace(`/language-learning/words-practice/${sessionId}`); return; }

            setUserId(me.id);
            setResults(deriveWordsResults(session.words));
            setLoadState('loaded');
        }
        load().catch(() => setLoadState('error'));
    }, [sessionId, router]);

    async function handlePracticeMore() {
        if (isStarting) return;
        setIsStarting(true);
        setStartError(null);
        try {
            const { sessionId: nextId } = await new TomeWordsPracticeAPI().startSession(userId);
            router.push(`/language-learning/words-practice/${nextId}`);
        } catch (e) {
            setStartError(e instanceof WordsPracticeError && e.reason === 'emptyPool' ? 'Complete a module to unlock Words Practice' : 'Could not start a new session. Please try again.');
            setIsStarting(false);
        }
    }

    const backToHome = () => router.push('/language-learning');

    if (loadState === 'error' || loadState === 'notFound') {
        return (
            <div className="flex flex-1 flex-col items-start gap-4 px-5 pt-4 md:self-center md:max-w-2xl md:w-full">
                <p className="text-sm text-cyan-600">{loadState === 'notFound' ? 'This Words Practice session could not be found.' : 'Failed to load the results. Please try again.'}</p>
                <button onClick={backToHome} className="rounded-full border border-cyan-400 px-5 py-2.5 text-base font-bold text-cyan-900">Back to home</button>
            </div>
        );
    }

    const loading = loadState === 'loading' || !results;

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full lg:mt-8">
            <div className="flex flex-1 flex-col items-center px-6 pt-1 text-center overflow-y-auto" aria-busy={loading} aria-label={loading ? 'Loading Words Practice results' : undefined}>

                {loading ? (
                    <>
                        <div className="h-9 w-56 rounded-md skeleton-shimmer mt-8" />
                        <div className="h-5 w-72 max-w-full rounded-md skeleton-shimmer mt-3" />
                        <div className="flex gap-8 mt-6">
                            {[0, 1, 2].map(i => <div key={i} className="h-14 w-16 rounded-md skeleton-shimmer" />)}
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-3xl font-bold text-black mt-8 anim-pc-rise">{results.headline}</p>
                        <p className="text-lg text-black/50 mt-1.5 leading-relaxed anim-pc-rise">{results.subline}</p>

                        <div className="flex gap-8 mt-6">
                            <MiniStat value={String(results.total)} label="words" delay={240} />
                            <MiniStat value={String(results.firstTry)} label="first try" green delay={300} />
                            <MiniStat value={`${results.accuracyPct}%`} label="accuracy" delay={360} />
                        </div>

                        <div className="mt-5">
                            <SavedChip />
                        </div>

                        <div className="w-full mt-8 text-left">
                            {results.missed.length === 0 ? (
                                <p className="text-center text-base font-semibold text-black/60">No misses — every word right first time</p>
                            ) : (
                                <>
                                    <h2 className="text-sm font-semibold uppercase tracking-widest text-black/50 mb-2">Words to review</h2>
                                    <ul className="flex flex-col">
                                        {results.missed.map(w => (
                                            <li key={w.wordKey} className="flex items-baseline justify-between gap-4 border-b border-cyan-300 py-3">
                                                <span className="text-base text-black break-words min-w-0">{w.english}</span>
                                                <span className="text-base font-bold text-black break-words min-w-0 text-right">{w.danish}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </>
                )}

                <div className="flex-1" />
            </div>

            <div className="w-full px-6 pb-4 pt-3 flex flex-col gap-2.5">
                {startError && <p role="alert" className="text-sm text-red-800 text-center">{startError}</p>}
                <button onClick={handlePracticeMore} disabled={loading || isStarting}
                    className="w-full rounded-full bg-lime-200 text-cyan-900 font-bold text-xl py-4 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-default">
                    Practice more words
                </button>
                <button onClick={backToHome}
                    className="w-full rounded-full border-2 border-cyan-700 bg-transparent text-black font-bold text-lg py-3 cursor-pointer">
                    Back to home
                </button>
            </div>
        </div>
    );
}
