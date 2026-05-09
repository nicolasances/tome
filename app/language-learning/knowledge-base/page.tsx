'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { MaskedSvgIcon } from "@/app/components/MaskedSvgIcon";

export default function KnowledgeBasePage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: 'Knowledge Base',
            backButton: {
                enabled: true,
                onClick: () => router.push('/language-learning'),
            },
        });
    }, [setConfig, router]);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start px-4 pt-8">
            <div className="flex flex-col gap-3">
                <KnowledgeBaseRow
                    icon="/images/book.svg"
                    label="Vocabulary"
                    description="Browse all vocabulary words"
                    onClick={() => router.push('/language-learning/vocabulary')}
                />
                <KnowledgeBaseRow
                    icon="/images/sentences.svg"
                    label="Sentences"
                    description="Browse and generate example sentences"
                    onClick={() => router.push('/language-learning/sentences')}
                />
            </div>
        </div>
    );
}

function KnowledgeBaseRow({
    icon,
    label,
    description,
    onClick,
}: {
    icon: string;
    label: string;
    description: string;
    onClick: () => void;
}) {
    const [pressed, setPressed] = useState(false);

    return (
        <button
            className="flex items-center gap-3 rounded-lg border border-cyan-700 p-3 text-left hover:bg-accent transition-colors transition-transform duration-100"
            style={{ transform: pressed ? "scale(0.95)" : "scale(1)" }}
            onClick={onClick}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
        >
            <MaskedSvgIcon
                src={icon}
                alt={label}
                size="w-8 h-8"
                color="bg-cyan-800"
            />
            <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
            </div>
        </button>
    );
}
