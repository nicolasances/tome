'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { MaskedSvgIcon, RoundButton } from "toto-react";
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
                    <div className="flex flex-col mt-4">
                        {sentences.map((sentence) => (
                            <SentenceRow key={sentence.id} sentence={sentence} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function SentenceRow({ sentence }: { sentence: Sentence }) {
    return (
        <div className="border-b border-cyan-600 py-2 flex flex-row">
            <div className="mr-2">
                {sentence.knowledgeSource == 'tome-agent' && <MaskedSvgIcon src="/images/agent.svg" alt="Tome Agent" />}
                {sentence.knowledgeSource != 'tome-agent' && <MaskedSvgIcon src="/images/book.svg" alt="Golden Source"/>}
            </div>
            <div>
                <div className="text-sm font-medium text-grey-900">{sentence.sentence}</div>
                <div className="text-xs text-muted-foreground mt-1">{sentence.translation}</div>
            </div>
        </div>
    );
}
