'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { TomeLanguageAPI, Sentence } from "@/api/TomeLanguageAPI";

export default function SentencesPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [sentences, setSentences] = useState<Sentence[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Sentences',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning/knowledge-base'),
            },
        });
    }, [setConfig, router]);

    const loadSentences = () => {
        setError(null);
        setSentences(null);
        new TomeLanguageAPI()
            .getSentences('danish')
            .then((res) => setSentences(res.sentences))
            .catch(() => {
                setError('Could not load sentences. Please try again.');
                setSentences([]);
            });
    };

    useEffect(() => {
        loadSentences();
    }, []);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            {/* Generate FAB */}
            <div className="flex items-center justify-center mt-8 gap-4">
                <RoundButton
                    svgIconPath={{ src: "/images/magic.svg", alt: "Generate Sentences" }}
                    onClick={() => router.push('/language-learning/sentences/generate')}
                    type="primary"
                />
            </div>

            <div className="flex flex-col px-4 pt-4 gap-4 flex-1">

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-sm text-destructive text-center">{error}</p>
                        <button
                            className="text-sm text-primary-foreground underline"
                            onClick={loadSentences}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {sentences === null && !error && (
                    <div className="flex flex-col items-center justify-center flex-1">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                    </div>
                )}

                {/* Empty state */}
                {sentences !== null && sentences.length === 0 && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-sm text-muted-foreground text-center">
                            No sentences yet. Tap the wand above to generate some.
                        </p>
                    </div>
                )}

                {/* Sentences list */}
                {sentences !== null && sentences.length > 0 && (
                    <div className="flex flex-col gap-3 mt-4 pb-4">
                        {sentences.map((sentence) => (
                            <SentenceRow key={sentence.id} sentence={sentence} />
                        ))}
                    </div>
                )}

                <div className="flex-1" />
            </div>
        </div>
    );
}

function SentenceRow({ sentence }: { sentence: Sentence }) {
    return (
        <div className="rounded-2xl border border-cyan-700 p-3">
            <div className="text-sm font-medium text-grey-900">{sentence.sentence}</div>
            <div className="text-xs text-muted-foreground mt-1">{sentence.translation}</div>
        </div>
    );
}
