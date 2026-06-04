'use client';

import React from 'react';
import { CefrLevel } from '@/api/TomeLearningDashboardAPI';

const CEFR_LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Maximum number of module dots to render to avoid overflow on narrow screens. */
const MAX_DOTS = 16;

interface LevelTrackProps {
    /** User's current CEFR level */
    cefrLevel: CefrLevel;
    /** Human-readable name of the current level, e.g. "Foundation" */
    levelName: string;
    /** Total modules at the current level */
    totalModules: number;
    /** Number of completed modules at the current level */
    completedModules: number;
}

/**
 * Horizontal A1→C2 level track showing the user's progression.
 * Current level is enlarged and lime-filled.
 * Completed levels are lime-filled.
 * Future levels are outlined only.
 * Below: level name and a row of module-completion dots.
 * Static — not interactive.
 */
export function LevelTrack({ cefrLevel, levelName, totalModules, completedModules }: LevelTrackProps) {
    const activeIndex = CEFR_LEVELS.indexOf(cefrLevel);
    const visibleDots = Math.min(totalModules, MAX_DOTS);

    return (
        <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-black/50 mb-3.5">
                Your path to fluency
            </p>

            {/* ── Level nodes row ─────────────────────────────── */}
            <div className="flex items-center">
                {CEFR_LEVELS.map((level, i) => {
                    const isCompleted = i < activeIndex;
                    const isCurrent = i === activeIndex;

                    return (
                        <React.Fragment key={level}>
                            {/* Node */}
                            <LevelNode
                                label={level}
                                isCurrent={isCurrent}
                                isCompleted={isCompleted}
                            />

                            {/* Connector (not after last node) */}
                            {i < CEFR_LEVELS.length - 1 && (
                                <div
                                    className={`flex-1 rounded ${isCompleted ? 'bg-lime-300' : 'bg-black/15'}`}
                                    style={{ height: 2.5 }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ── Level name + module dots ─────────────────────── */}
            <div className="flex items-center justify-between mt-3.5">
                <span className="text-sm font-bold text-black/80">{levelName}</span>

                <div className="flex gap-1.5">
                    {Array.from({ length: visibleDots }).map((_, i) => (
                        <ModuleDot key={i} completed={i < completedModules} />
                    ))}
                </div>
            </div>
        </div>
    );
}

/** Single CEFR level node circle. */
function LevelNode({
    label,
    isCurrent,
    isCompleted,
}: {
    label: string;
    isCurrent: boolean;
    isCompleted: boolean;
}) {
    const size = isCurrent ? 44 : 34;
    const fontSize = isCurrent ? 15 : 12;

    const colorClasses = isCurrent
        ? 'bg-lime-200 border-[2.5px] border-lime-200 text-cyan-800'
        : isCompleted
        ? 'bg-lime-300 border-2 border-lime-300 text-cyan-800'
        : 'bg-transparent border-2 text-black/50';

    return (
        <div
            className={`flex-none rounded-full flex items-center justify-center font-bold ${colorClasses}`}
            style={{
                width: size,
                height: size,
                fontSize,
                ...((!isCurrent && !isCompleted) ? { borderColor: 'rgba(0,0,0,0.22)' } : {}),
            }}
        >
            {label}
        </div>
    );
}

/** Single module dot — filled when completed, outlined when pending. */
function ModuleDot({ completed }: { completed: boolean }) {
    return (
        <span
            className={`block rounded-full ${completed ? 'bg-lime-200' : 'bg-transparent'}`}
            style={{
                width: 7,
                height: 7,
                ...(completed ? {} : { border: '1.5px solid rgba(0,0,0,0.22)' }),
            }}
        />
    );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

/**
 * Skeleton placeholder for LevelTrack displayed while data is loading.
 */
export function LevelTrackSkeleton() {
    return (
        <div>
            <div className="skeleton-shimmer h-[11px] w-32 rounded mb-3.5" />

            {/* Node row skeleton */}
            <div className="flex items-center gap-1">
                {CEFR_LEVELS.map((level, i) => (
                    <React.Fragment key={level}>
                        <div
                            className="skeleton-shimmer flex-none rounded-full"
                            style={{ width: 34, height: 34 }}
                        />
                        {i < CEFR_LEVELS.length - 1 && (
                            <div className="flex-1 skeleton-shimmer rounded" style={{ height: 2.5 }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Level name + dots skeleton */}
            <div className="flex items-center justify-between mt-3.5">
                <div className="skeleton-shimmer h-4 w-24 rounded" />
                <div className="flex gap-1.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="skeleton-shimmer rounded-full"
                            style={{ width: 7, height: 7 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
