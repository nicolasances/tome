'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton, TotoList, TotoListItem } from "toto-react";
import { TomeSourcesAPI, Source, sourceTypeIcon } from "@/api/TomeSourcesAPI";

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

    const listItems: TotoListItem[] = (sources ?? []).map((source) => {
        const lastIngested = source.lastExtractedAt
            ? new Date(source.lastExtractedAt).toLocaleDateString()
            : 'Never';
        return {
            id: source.id,
            icon: {
                src: sourceTypeIcon(source.type),
                alt: source.type,
                color: 'bg-cyan-800',
            },
            title: source.name,
            subtitle: `Last ingested: ${lastIngested}`,
            onClick: () => router.push(`/language-learning/sources/${source.id}`),
        };
    });

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

                {/* Loading + list (TotoList handles both states) */}
                {!error && (
                    <div className="mt-4">
                        <TotoList
                            items={listItems}
                            loading={sources === null}
                        />
                    </div>
                )}

                {/* Empty state */}
                {sources !== null && sources.length === 0 && !error && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-sm text-muted-foreground text-center">
                            No sources yet. Add your first source to start extracting vocabulary.
                        </p>
                    </div>
                )}

                <div className="flex-1" />
            </div>
        </div>
    );
}

