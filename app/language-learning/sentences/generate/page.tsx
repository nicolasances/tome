'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { TomeSourcesAPI, GenerateSentencesResult } from "@/api/TomeSourcesAPI";

const MIN_COUNT = 1;
const MAX_COUNT = 50;
const DEFAULT_COUNT = 10;

export default function GenerateSentencesPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [count, setCount] = useState<number>(DEFAULT_COUNT);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<GenerateSentencesResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Generate Sentences',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning/sentences'),
            },
        });
    }, [setConfig, router]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setResult(null);
        setError(null);
        try {
            const res = await new TomeSourcesAPI().generateSentences('danish', count);
            setResult(res);
        } catch (err) {
            console.error('Error generating sentences:', err);
            setError('Failed to generate sentences. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
            setCount(Math.min(MAX_COUNT, Math.max(MIN_COUNT, val)));
        }
    };

    return (
        <div className="flex flex-1 flex-col items-center justify-start px-6 pt-12 gap-8">

            {/* Count input */}
            <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                <label className="text-sm tracking-widest uppercase text-muted-foreground">
                    Number of sentences
                </label>
                <input
                    type="number"
                    min={MIN_COUNT}
                    max={MAX_COUNT}
                    value={count}
                    onChange={handleCountChange}
                    disabled={isGenerating}
                    className="w-full text-center text-3xl font-bold bg-transparent border-b-2 border-cyan-400 text-cyan-100 focus:outline-none focus:border-cyan-300 py-2"
                />
                <span className="text-xs text-muted-foreground">{MIN_COUNT}–{MAX_COUNT} sentences</span>
            </div>

            {/* Generate button */}
            <RoundButton
                svgIconPath={{ src: "/images/magic.svg", alt: "Generate" }}
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={isGenerating}
                type="primary"
            />

            {/* Result summary */}
            {result && !isGenerating && (
                <div className="flex flex-col items-center gap-2 mt-4 text-center">
                    <p className="text-lg font-semibold text-cyan-100">
                        {result.sentencesCreated} sentence{result.sentencesCreated !== 1 ? 's' : ''} added
                    </p>
                    {result.sentencesGenerated > result.sentencesCreated && (
                        <p className="text-xs text-muted-foreground">
                            {result.sentencesGenerated} generated · {result.sentencesErrored} failed to save
                        </p>
                    )}
                    <button
                        className="mt-4 text-sm text-cyan-300 underline"
                        onClick={() => router.push('/language-learning/sentences')}
                    >
                        View sentences
                    </button>
                </div>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
            )}
        </div>
    );
}
