'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";

export default function LanguageLearningPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: 'Language Learning',
            backButton: {
                enabled: true,
                onClick: () => router.back(),
            },
        });
    }, [setConfig, router]);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 app-content flex flex-col px-4">
                {/* Practice Buttons section */}
                <div className="flex justify-center mt-8">
                    <RoundButton svgIconPath={{src: "/images/tome.svg", alt: "Vocabulary"}} onClick={() => router.push('/language-learning/vocabulary')} />
                </div>

                {/* Learning Stats section */}
                <div>
                    {/* TODO: Learning Stats */}
                </div>
            </div>
        </div>
    );
}

function NavigationButton({ label, onClick }: { label: string; onClick: () => void }) {
    const [pressed, setPressed] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg text-left font-medium"
            style={{ opacity: pressed ? 0.7 : 1 }}
        >
            {label}
        </button>
    );
}
