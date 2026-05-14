'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";
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
                    <div className="border-2 border-cyan-700 rounded-full p-2 flex items-center justify-center">
                        <MaskedSvgIcon
                            src={sourceTypeIcon(source!.type)}
                            alt={source!.type}
                            size="w-6 h-6"
                            color="bg-cyan-800"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold">{source!.name}</span>
                        <span className="text-sm text-muted-foreground">{sourceTypeLabel(source!.type)}</span>
                    </div>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-3 pl-2">
                    <DetailRow label="Document ID" value={source!.resourceId} />
                    <DetailRow label="Language" value={source!.language} />
                    <DetailRow label="Last Ingested" value={lastIngested} />
                    <DetailRow
                        label="Created"
                        value={new Date(source!.createdAt).toLocaleDateString()}
                    />
                </div>


                {/* Extraction result */}
                {extractionResult && !extracting && (
                    <div className="flex flex-col gap-2 rounded-2xl border border-border p-4">
                        <p className="text-xl text-center">Extraction complete</p>
                        <ExtractionStat label="Words extracted" value={extractionResult.wordsExtracted} />
                        <ExtractionStat label="New words created" value={extractionResult.wordsCreated} />
                        {extractionResult.wordsErrored > 0 && (<ExtractionStat label="Words with errors" value={extractionResult.wordsErrored} danger />)}
                        <ExtractionStat label="Sentences extracted" value={extractionResult.sentencesExtracted} />
                        <ExtractionStat label="New sentences created" value={extractionResult.sentencesCreated} />
                    </div>
                )}

                {/* Extraction error */}
                {extractionError && !extracting && (
                    <p className="text-sm text-destructive text-center">{extractionError}</p>
                )}

                <div className="flex-1" />
            </div>

            {/* Ingest button */}
            <div className="flex flex-col items-center justify-center mb-8">
                {/* Extraction spinner */}
                {extracting && (
                    <p className="text-sm text-muted-foreground text-center mb-2">
                        Extracting vocabulary… this may take a minute.
                    </p>
                )}
                <div className="flex items-center justify-center mb-8">
                    <RoundButton
                        svgIconPath={{ src: "/images/magic.svg", alt: "Ingest" }}
                        onClick={handleIngest}
                        loading={extracting}
                        type="primary"
                    />
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col items-start justify-between">
            <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
            <span className="text-base text-right break-all">{value}</span>
        </div>
    );
}

function ExtractionStat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-base text-muted-foreground">{label}</span>
            <div className={`bg-cyan-300 rounded-full px-3 flex items-center justify-center text-base font-semibold ${danger ? 'text-destructive' : ''}`}>{value}</div>
        </div>
    );
}
