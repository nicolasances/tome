'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton, MaskedSvgIcon } from "toto-react";
import { TomeSourcesAPI, SUPPORTED_SOURCE_TYPES } from "@/api/TomeSourcesAPI";

type SourceType = typeof SUPPORTED_SOURCE_TYPES[number];

export default function NewSourcePage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [showTypePopup, setShowTypePopup] = useState(false);
    const [selectedType, setSelectedType] = useState<SourceType>(SUPPORTED_SOURCE_TYPES[0]);
    const [name, setName] = useState('');
    const [resourceId, setResourceId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Add Source',
            backButton: {
                enabled: true,
                onClick: () => router.back(),
            },
        });
    }, [setConfig, router]);

    const canSave = name.trim().length > 0 && resourceId.trim().length > 0 && !saving;

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        setError(null);
        try {
            await new TomeSourcesAPI().createSource({
                type: selectedType.type,
                language: 'danish',
                name: name.trim(),
                resourceId: resourceId.trim(),
            });
            router.replace('/language-learning/sources');
        } catch {
            setError('Failed to create source. Please check your inputs and try again.');
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col items-stretch">
            <div className="flex flex-col px-4 pt-8 gap-8 flex-1">

                {/* Source type — centered icon + label */}
                <div className="flex flex-col items-center gap-2">
                    <RoundButton
                        svgIconPath={{ src: selectedType.icon, alt: selectedType.label }}
                        onClick={() => setShowTypePopup(true)}
                        type="primary"
                        size="car"
                    />
                    <span className="text-base text-muted-foreground">{selectedType.label}</span>
                </div>

                {/* Name input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs pl-2 text-muted-foreground uppercase tracking-wide">
                        Name
                    </label>
                    <input
                        className="rounded-xl border border-cyan-400 bg-background px-4 py-3 text-base text-cyan-900 placeholder:text-cyan-300 outline-none focus:border-lime-300"
                        placeholder="e.g. Danish News Article"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={saving}
                    />
                </div>

                {/* Resource ID input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs pl-2 text-muted-foreground uppercase tracking-wide">
                        Document ID
                    </label>
                    <input
                        className="rounded-xl border border-cyan-400 bg-background px-4 py-3 text-base text-cyan-900 placeholder:text-cyan-300 outline-none focus:border-lime-300"
                        placeholder="Google Doc ID (no slashes)"
                        value={resourceId}
                        onChange={(e) => setResourceId(e.target.value)}
                        disabled={saving}
                    />
                    <p className="text-sm pl-2 text-muted-foreground">
                        The bare document ID from the Google Docs URL (no slashes).
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <div className="flex-1" />
            </div>

            {/* Save button */}
            <div className="flex items-center justify-center mb-8">
                <RoundButton
                    svgIconPath={{ src: "/images/tick.svg", alt: "Save" }}
                    onClick={handleSave}
                    type="primary"
                    disabled={!canSave}
                    loading={saving}
                />
            </div>

            {/* Full-page source type popup */}
            {showTypePopup && (
                <SourceTypePopup
                    selected={selectedType}
                    onSelect={(t) => {
                        setSelectedType(t);
                        setShowTypePopup(false);
                    }}
                    onClose={() => setShowTypePopup(false)}
                />
            )}
        </div>
    );
}

function SourceTypePopup({
    selected,
    onSelect,
    onClose,
}: {
    selected: SourceType;
    onSelect: (t: SourceType) => void;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                <span className="text-sm font-semibold">Select source type</span>
                <button onClick={onClose}>
                    <MaskedSvgIcon
                        src="/images/close.svg"
                        alt="Close"
                        size="20px"
                        color="var(--muted-foreground)"
                    />
                </button>
            </div>

            {/* Type grid */}
            <div className="flex flex-wrap justify-center gap-8 p-8">
                {SUPPORTED_SOURCE_TYPES.map((t) => (
                    <SourceTypeItem
                        key={t.type}
                        sourceType={t}
                        selected={selected.type === t.type}
                        onSelect={() => !t.disabled && onSelect(t)}
                    />
                ))}
            </div>
        </div>
    );
}

function SourceTypeItem({
    sourceType,
    selected,
    onSelect,
}: {
    sourceType: SourceType;
    selected: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            className={`flex flex-col items-center gap-2 ${sourceType.disabled ? 'opacity-30 pointer-events-none' : ''}`}
        >
            <RoundButton
                svgIconPath={{ src: sourceType.icon, alt: sourceType.label }}
                onClick={onSelect}
                type={selected ? 'filled' : 'primary'}
            />
            <span className="text-xs text-muted-foreground">{sourceType.label}</span>
        </div>
    );
}
