'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { RoundButton } from "toto-react";
import { getAnyActiveSession, ActiveSessionInfo } from "@/api/PracticeSessionHelper";
import { TomeLanguageAPI } from "@/api/TomeLanguageAPI";
import { DayStat, LanguageLearningWeeklyStats } from "@/components/graph/LanguageLearningWeeklyStats";

export default function LanguageLearningPage() {

    const router = useRouter();
    const { setConfig } = useHeader();
    const [activeSession, setActiveSession] = useState<ActiveSessionInfo | null | undefined>(undefined);
    // undefined = loading, null = no active session, ActiveSessionInfo = session found
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
        getAnyActiveSession()
            .then((session) => setActiveSession(session))
            .catch(() => setActiveSession(null));
    }, []);

    useEffect(() => {
        new TomeLanguageAPI()
            .getRollingStats(7)
            .then((res) => setRollingStats(res.days))
            .catch(() => setRollingStats([]));
    }, []);

    const handlePracticeClick = () => {
        if (activeSession) {
            // Resume the existing session
            if (activeSession.practiceType === 'sentences') {
                router.push('/language-learning/sentence-practice');
            } else {
                router.push('/language-learning/vocabulary-practice');
            }
        } else {
            router.push('/language-learning/select');
        }
    };

    const hasActiveSession = activeSession !== null && activeSession !== undefined;
    const isLoading = activeSession === undefined;

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 flex flex-col items-center px-4">
                {/* Practice Buttons section */}
                <div className="flex items-center justify-center mt-8 gap-4">
                    {/* Knowledge Base button */}
                    <RoundButton
                        svgIconPath={{ src: "/images/book.svg", alt: "Knowledge Base" }}
                        onClick={() => router.push('/language-learning/knowledge-base')}
                    />

                    {/* Manage Sources button */}
                    <RoundButton
                        svgIconPath={{ src: "/images/sources.svg", alt: "Manage Sources" }}
                        onClick={() => router.push('/language-learning/sources')}
                    />
                </div>
                <div className="text-sm text-center tracking-widest uppercase mt-6 mb-1">Practice</div>
                <div className="bg-cyan-700/60 rounded-full py-2 px-8">
                    {/* Start / Resume Practice button */}
                    <div className="flex flex-col items-center gap-2">
                        <RoundButton
                            loading={isLoading}
                            disabled={isLoading}
                            svgIconPath={{ src: "/images/language.svg", alt: hasActiveSession ? 'Resume Practice' : 'Start Practice' }}
                            onClick={handlePracticeClick}
                            type={hasActiveSession ? 'filled' : 'primary'}
                        />
                    </div>
                </div>

                <div className="flex-1"></div>

                {/* Learning Stats section */}
                <div className="mt-8 mb-6 w-full">
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
