'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHeader } from '@/context/HeaderContext';
import { RoundButton } from 'toto-react';
import {
    TomeLearningDashboardAPI,
    UserLevelProgressResponse,
    CurrentModuleResponse,
    WeekDayStat,
} from '@/api/TomeLearningDashboardAPI';
import { LevelTrack, LevelTrackSkeleton } from './components/LevelTrack';
import { ContinueCard, ContinueCardSkeleton } from './components/ContinueCard';
import { WeeklyModuleStats } from './components/WeeklyModuleStats';

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LanguageLearningHomePage() {
    const router = useRouter();
    const { setConfig } = useHeader();

    // Dashboard data — undefined = loading, null = failed/not found
    const [levelProgress, setLevelProgress] = useState<UserLevelProgressResponse | null | undefined>(undefined);
    const [currentModule, setCurrentModule] = useState<CurrentModuleResponse | null | undefined>(undefined);
    const [weeklyStats, setWeeklyStats] = useState<WeekDayStat[] | null | undefined>(undefined);

    // ── Header ──────────────────────────────────────────────────────────────
    useEffect(() => {
        setConfig({
            title: 'Language Learning',
            backButton: { enabled: false, onClick: () => {} },
        });
    }, [setConfig]);

    // ── Data loading ─────────────────────────────────────────────────────────
    useEffect(() => {
        const api = new TomeLearningDashboardAPI();

        api.getUserLevelProgress()
            .then(setLevelProgress)
            .catch(() => setLevelProgress(null));

        api.getCurrentModule()
            .then((mod) => setCurrentModule(mod ?? null))
            .catch(() => setCurrentModule(null));

        api.getWeeklyModuleStats()
            .then((res) => setWeeklyStats(res.days))
            .catch(() => setWeeklyStats(null));
    }, []);

    // ── Derived ──────────────────────────────────────────────────────────────
    const isLevelLoading = levelProgress === undefined;
    const isModuleLoading = currentModule === undefined;
    const isWeeklyLoading = weeklyStats === undefined;

    return (
        <div className="flex flex-1 flex-col items-stretch md:self-center md:max-w-2xl md:w-full">
            <div className="flex flex-1 flex-col px-[18px] pt-4 pb-4 gap-6 overflow-y-auto">

                {/* ── Level track ─────────────────────────────────────────── */}
                {isLevelLoading ? (
                    <LevelTrackSkeleton />
                ) : levelProgress ? (
                    <LevelTrack
                        cefrLevel={levelProgress.cefrLevel}
                        levelName={levelProgress.levelName}
                        totalModules={levelProgress.totalModules}
                        completedModules={levelProgress.completedModules}
                    />
                ) : (
                    <LevelTrackError />
                )}

                {/* ── Continue CTA ─────────────────────────────────────────── */}
                {isModuleLoading ? (
                    <ContinueCardSkeleton />
                ) : (
                    <ContinueCard module={currentModule ?? null} />
                )}

                {/* ── Primary nav row ──────────────────────────────────────── */}
                <div className="flex justify-around items-start gap-2">
                    <NavButton
                        icon="/images/book.svg"
                        alt="Modules"
                        label="Modules"
                        onClick={() => router.push(`/language-learning/level/${levelProgress?.cefrLevel ?? 'A1'}`)}
                    />
                    <NavButton
                        icon="/images/magic.svg"
                        alt="Analyze"
                        label="Analyze"
                        onClick={() => {
                            // Analyze destination — skipped in v2.0 (no wireframe yet)
                        }}
                    />
                </div>

                {/* ── Spacer ───────────────────────────────────────────────── */}
                <div className="flex-1" />

                {/* ── Weekly stats ─────────────────────────────────────────── */}
                <div className="mb-3.5">
                    {isWeeklyLoading ? (
                        <WeeklyStatsSkeleton />
                    ) : weeklyStats && weeklyStats.length > 0 ? (
                        <WeeklyModuleStats days={weeklyStats} />
                    ) : (
                        <WeeklyStatsEmpty />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Nav button (RoundButton + label below) ───────────────────────────────────

function NavButton({
    icon,
    alt,
    label,
    onClick,
}: {
    icon: string;
    alt: string;
    label: string;
    onClick: () => void;
}) {
    return (
        <div className="flex flex-col items-center gap-2">
            <RoundButton
                svgIconPath={{ src: icon, alt }}
                type="primary"
                onClick={onClick}
            />
            <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-black/70">
                {label}
            </span>
        </div>
    );
}

// ─── Error / empty states ─────────────────────────────────────────────────────

function LevelTrackError() {
    return (
        <div className="text-sm text-black/50 text-center py-4">
            Could not load progress.
        </div>
    );
}

function WeeklyStatsSkeleton() {
    return (
        <div>
            <div className="skeleton-shimmer h-[11px] w-20 rounded mb-3" />
            <div className="flex items-end gap-2" style={{ height: 110 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1.5" style={{ height: '100%' }}>
                        <div
                            className="skeleton-shimmer w-full rounded-sm"
                            style={{ height: Math.floor(Math.random() * 50) + 20 }}
                        />
                        <div className="skeleton-shimmer h-2.5 w-3 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function WeeklyStatsEmpty() {
    return (
        <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-3">
                This week
            </p>
            <div
                className="flex items-center justify-center text-sm text-white/50"
                style={{ height: 110 }}
            >
                No modules completed yet
            </div>
        </div>
    );
}
