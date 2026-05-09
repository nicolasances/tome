'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
import { TomeSourcesAPI, Source, sourceTypeIcon } from "@/api/TomeSourcesAPI";
import { SourcesListSkeleton } from "@/app/components/LanguageLearningListSkeletons";

export default function SourcesPage() {

    const router = useRouter();
    const { setConfig } = useHeader();
    const [sources, setSources] = useState<Source[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Sources',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    useEffect(() => {
        loadSources();
    }, []);

    const loadSources = () => {
        setError(null);
        setSources(null);
        new TomeSourcesAPI()
            .getSources('danish')
            .then((res) => setSources(res.sources))
            .catch(() => {
                setError('Could not load sources. Please try again.');
                setSources([]);
            });
    };

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">

            {/* Add source FAB */}
            <div className="flex items-center justify-center mt-8 gap-4">
                <RoundButton
                    svgIconPath={{ src: "/images/plus.svg", alt: "Add Source" }}
                    onClick={() => router.push('/language-learning/sources/new')}
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
                            onClick={loadSources}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading state */}
                {sources === null && !error && (
                    <SourcesListSkeleton rows={6} />
                )}

                {/* Empty state */}
                {sources !== null && sources.length === 0 && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-sm text-muted-foreground text-center">
                            No sources yet. Add your first source to start extracting vocabulary.
                        </p>
                    </div>
                )}

                {/* Sources list */}
                {sources !== null && sources.length > 0 && (
                    <div className="flex flex-col gap-2 mt-4">
                        {sources.map((source) => (
                            <SourceRow
                                key={source.id}
                                source={source}
                                onClick={() => router.push(`/language-learning/sources/${source.id}`)}
                            />
                        ))}
                    </div>
                )}

                <div className="flex-1" />
            </div>
        </div>
    );
}

function SourceRow({ source, onClick }: { source: Source; onClick: () => void }) {
    const [pressed, setPressed] = useState(false);

    const lastIngested = source.lastExtractedAt
        ? new Date(source.lastExtractedAt).toLocaleDateString()
        : 'Never';

    return (
        <button
            className="flex items-center gap-3 rounded-lg border border-cyan-700 p-2 text-left hover:bg-accent transition-colors transition-transform duration-100"
            style={{ transform: pressed ? "scale(0.95)" : "scale(1)" }}
            onClick={onClick}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
        >
            <MaskedSvgIcon
                src={sourceTypeIcon(source.type)}
                alt={source.type}
                size="w-8 h-8"
                color="bg-cyan-800"
            />
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium truncate">{source.name}</span>
                <span className="text-xs text-muted-foreground">Last ingested: {lastIngested}</span>
            </div>
        </button>
    );
}
