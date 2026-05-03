'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { getVocabularyPracticeAPI } from "@/api/VocabularyPracticeAPIFactory";
import { TomeLanguageAPI } from "@/api/TomeLanguageAPI";
import { DayStat, LanguageLearningWeeklyStats } from "@/components/graph/LanguageLearningWeeklyStats";

export default function LanguageLearningPage() {

    const router = useRouter();
    const { setConfig } = useHeader();
    const [hasActiveSession, setHasActiveSession] = useState<boolean | null>(null);
    // null = loading, [] = error/empty, populated = data ready
    const [rollingStats, setRollingStats] = useState<DayStat[] | null>(null);

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

    useEffect(() => {
        new TomeLanguageAPI()
            .getRollingStats(7)
            .then((res) => setRollingStats(res.days))
            .catch(() => setRollingStats([]));
    }, []);

    const handlePracticeClick = () => {
        router.push('/language-learning/vocabulary-practice');
    };

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 flex flex-col px-4">
                {/* Practice Buttons section */}
                <div className="flex items-center justify-center mt-8 gap-4">
                    {/* Vocabulary list button */}
                    <RoundButton
                        svgIconPath={{ src: "/images/book.svg", alt: "Vocabulary" }}
                        onClick={() => router.push('/language-learning/vocabulary')}
                    />

                    {/* Manage Sources button */}
                    <RoundButton
                        svgIconPath={{ src: "/images/sources.svg", alt: "Manage Sources" }}
                        onClick={() => router.push('/language-learning/sources')}
                    />
                </div>
                <div className="text-sm text-center tracking-widest uppercase mt-6 mb-1">Practice</div>
                <div className="bg-cyan-700/60 rounded-full py-4">
                    {/* Start / Resume Practice button */}
                    <div className="flex flex-col items-center gap-2">
                        <RoundButton
                            loading={hasActiveSession === null}
                            disabled={hasActiveSession === null}
                            svgIconPath={{ src: "/images/language.svg", alt: hasActiveSession ? 'Resume Vocabulary Practice' : 'Vocabulary Practice' }}
                            onClick={handlePracticeClick}
                            type={hasActiveSession ? 'filled' : 'primary'}
                        />
                    </div>
                </div>

                <div className="flex-1"></div>

                {/* Learning Stats section */}
                <div className="mt-8 mb-6">
                    {rollingStats === null ? (
                        <div className="flex items-center justify-center text-sm text-muted-foreground" style={{ height: 160 }}>
                            Loading stats…
                        </div>
                    ) : (
                        <LanguageLearningWeeklyStats days={rollingStats} />
                    )}
                </div>
            </div>
        </div>
    );
}
