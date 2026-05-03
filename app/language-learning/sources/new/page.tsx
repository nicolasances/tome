'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton, MaskedSvgIcon } from "toto-react";
import { TomeSourcesAPI, SUPPORTED_SOURCE_TYPES } from "@/api/TomeSourcesAPI";

export default function NewSourcePage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    const [showTypeSheet, setShowTypeSheet] = useState(false);
    const [selectedType, setSelectedType] = useState(SUPPORTED_SOURCE_TYPES[0]);
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
            <div className="flex flex-col px-4 pt-6 gap-6 flex-1">

                {/* Type selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Source Type
                    </label>
                    <button
                        className="flex items-center gap-3 rounded-2xl border border-border p-4 text-left"
                        onClick={() => setShowTypeSheet(true)}
                    >
                        <MaskedSvgIcon
                            src={selectedType.icon}
                            alt={selectedType.label}
                            size="24px"
                            color="var(--foreground)"
                        />
                        <span className="flex-1 text-sm">{selectedType.label}</span>
                        <MaskedSvgIcon
                            src="/images/point-right.svg"
                            alt="Change"
                            size="16px"
                            color="var(--muted-foreground)"
                        />
                    </button>
                </div>

                {/* Name input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Name
                    </label>
                    <input
                        className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        placeholder="e.g. Danish News Article"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={saving}
                    />
                </div>

                {/* Resource ID input */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Document ID
                    </label>
                    <input
                        className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                        placeholder="Google Doc ID (no slashes)"
                        value={resourceId}
                        onChange={(e) => setResourceId(e.target.value)}
                        disabled={saving}
                    />
                    <p className="text-xs text-muted-foreground">
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
            <div className="fixed bottom-6 right-6">
                <RoundButton
                    svgIconPath={{ src: "/images/tick.svg", alt: "Save" }}
                    onClick={handleSave}
                    type="primary"
                    disabled={!canSave}
                    loading={saving}
                />
            </div>

            {/* Type selector bottom sheet */}
            {showTypeSheet && (
                <BottomSheet
                    title="Select Source Type"
                    onClose={() => setShowTypeSheet(false)}
                >
                    {SUPPORTED_SOURCE_TYPES.map((t) => (
                        <button
                            key={t.type}
                            className="flex items-center gap-3 p-4 rounded-xl hover:bg-accent transition-colors text-left w-full"
                            onClick={() => {
                                setSelectedType(t);
                                setShowTypeSheet(false);
                            }}
                        >
                            <MaskedSvgIcon
                                src={t.icon}
                                alt={t.label}
                                size="24px"
                                color="var(--foreground)"
                            />
                            <span className="text-sm">{t.label}</span>
                            {selectedType.type === t.type && (
                                <MaskedSvgIcon
                                    src="/images/tick.svg"
                                    alt="Selected"
                                    size="16px"
                                    color="var(--primary)"
                                />
                            )}
                        </button>
                    ))}
                </BottomSheet>
            )}
        </div>
    );
}

function BottomSheet({ title, onClose, children }: {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            onClick={onClose}
        >
            <div
                className="bg-background rounded-t-3xl px-4 pt-4 pb-8 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{title}</span>
                    <button onClick={onClose}>
                        <MaskedSvgIcon
                            src="/images/close.svg"
                            alt="Close"
                            size="20px"
                            color="var(--muted-foreground)"
                        />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
