'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { getVocabularyPracticeAPI } from "@/api/VocabularyPracticeAPIFactory";

export default function LanguageLearningPage() {

    const router = useRouter();
    const { setConfig } = useHeader();
    const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);

    useEffect(() => {
        setConfig({
            title: 'Language Learning',
            backButton: {
                enabled: true,
                onClick: () => router.back(),
            },
        });
    }, [setConfig, router]);

    useEffect(() => {
        getVocabularyPracticeAPI()
            .getActiveSession()
            .then((session) => setHasActiveSession(session !== null))
            .catch(() => setHasActiveSession(false));
    }, []);

    const handlePracticeClick = () => {
        router.push('/language-learning/vocabulary-practice');
    };

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 app-content flex flex-col px-4">
                {/* Practice Buttons section */}
                <div className="flex items-center justify-center mt-8 gap-4">
                    {/* Vocabulary list button */}
                    <RoundButton
                        svgIconPath={{ src: "/images/tome.svg", alt: "Vocabulary" }}
                        onClick={() => router.push('/language-learning/vocabulary')}
                    />

                    {/* Start / Resume Practice button */}
                    {hasActiveSession === null ? (
                        <div className="text-sm text-muted-foreground">Loading…</div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <RoundButton
                                svgIconPath={{ src: "/images/language.svg", alt: hasActiveSession ? 'Resume Practice' : 'Start Practice' }}
                                onClick={handlePracticeClick}
                                type={hasActiveSession ? 'filled' : 'primary'}
                            />
                        </div>
                    )}
                </div>

                {/* Learning Stats section */}
                <div>
                    {/* TODO: Learning Stats */}
                </div>
            </div>
        </div>
    );
}
