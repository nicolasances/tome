'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton, MaskedSvgIcon } from "toto-react";
import { TomeSourcesAPI, Source, ExtractionResult, sourceTypeIcon, sourceTypeLabel } from "@/api/TomeSourcesAPI";

export default function SourceDetailPage() {

    const router = useRouter();
    const { sourceId } = useParams<{ sourceId: string }>();
    const { setConfig } = useHeader();

    const [source, setSource] = useState<Source | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
    const [extractionError, setExtractionError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Source',
            backButton: {
                enabled: true,
                onClick: () => router.back(),
            },
        });
    }, [setConfig, router]);

    useEffect(() => {
        loadSource();
    }, [sourceId]);

    const loadSource = () => {
        setLoadError(null);
        setSource(null);
        new TomeSourcesAPI()
            .getSources('danish')
            .then((res) => {
                const found = res.sources.find((s) => s.id === sourceId);
                if (!found) {
                    setLoadError('Source not found.');
                    setSource(null);
                } else {
                    setSource(found);
                }
            })
            .catch(() => {
                setLoadError('Could not load source. Please try again.');
            });
    };

    const handleIngest = async () => {
        setExtracting(true);
        setExtractionResult(null);
        setExtractionError(null);
        try {
            const result = await new TomeSourcesAPI().extractSource(sourceId);
            setExtractionResult(result);
        } catch {
            setExtractionError('Extraction failed. The document may be inaccessible or the AI service returned an error.');
        } finally {
            setExtracting(false);
        }
    };

    // --- Loading state ---
    if (source === null && !loadError) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    // --- Error state ---
    if (loadError) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4">
                <p className="text-sm text-destructive text-center">{loadError}</p>
                <button className="text-sm underline" onClick={loadSource}>Retry</button>
            </div>
        );
    }

    const lastIngested = source!.lastExtractedAt
        ? new Date(source!.lastExtractedAt).toLocaleString()
        : 'Never';

    return (
        <div className="flex flex-1 flex-col items-stretch">
            <div className="flex flex-col px-4 pt-6 gap-6 flex-1">

                {/* Source header */}
                <div className="flex items-center gap-3">
                    <MaskedSvgIcon
                        src={sourceTypeIcon(source!.type)}
                        alt={source!.type}
                        size="32px"
                        color="var(--foreground)"
                    />
                    <div className="flex flex-col">
                        <span className="text-base font-semibold">{source!.name}</span>
                        <span className="text-xs text-muted-foreground">{sourceTypeLabel(source!.type)}</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3">
                    <DetailRow label="Document ID" value={source!.resourceId} />
                    <DetailRow label="Language" value={source!.language} />
                    <DetailRow label="Last Ingested" value={lastIngested} />
                    <DetailRow
                        label="Created"
                        value={new Date(source!.createdAt).toLocaleDateString()}
                    />
                </div>

                {/* Extraction spinner */}
                {extracting && (
                    <div className="flex flex-col items-center gap-3 py-6">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground text-center">
                            Extracting vocabulary… this may take a minute.
                        </p>
                    </div>
                )}

                {/* Extraction result */}
                {extractionResult && !extracting && (
                    <div className="flex flex-col gap-2 rounded-2xl border border-border p-4">
                        <p className="text-sm font-semibold">Extraction complete</p>
                        <ExtractionStat label="Words extracted" value={extractionResult.wordsExtracted} />
                        <ExtractionStat label="New words created" value={extractionResult.wordsCreated} />
                        {extractionResult.wordsErrored > 0 && (
                            <ExtractionStat
                                label="Words with errors"
                                value={extractionResult.wordsErrored}
                                danger
                            />
                        )}
                    </div>
                )}

                {/* Extraction error */}
                {extractionError && !extracting && (
                    <p className="text-sm text-destructive text-center">{extractionError}</p>
                )}

                <div className="flex-1" />
            </div>

            {/* Ingest button */}
            {!extracting && (
                <div className="fixed bottom-6 right-6">
                    <RoundButton
                        svgIconPath={{ src: "/images/magic.svg", alt: "Ingest" }}
                        onClick={handleIngest}
                        type="primary"
                    />
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
            <span className="text-sm text-right break-all">{value}</span>
        </div>
    );
}

function ExtractionStat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className={`text-sm font-semibold ${danger ? 'text-destructive' : ''}`}>{value}</span>
        </div>
    );
}
