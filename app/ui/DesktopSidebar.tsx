'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import {
    TomeLearningDashboardAPI,
    MeProgressResponse,
    CEFR_LEVEL_NAMES,
    CefrLevel,
} from '@/api/TomeLearningDashboardAPI';

const NAV_ITEMS = [
    { id: 'home', icon: '/images/home.svg', label: 'Home', href: '/language-learning' },
    { id: 'modules', icon: '/images/book.svg', label: 'Modules', href: null },
    { id: 'analyze', icon: '/images/magic.svg', label: 'Analyze', href: null },
    { id: 'knowledge', icon: '/images/knowledge-base.svg', label: 'Knowledge', href: null },
    { id: 'sources', icon: '/images/sources.svg', label: 'Sources', href: null },
] as const;

function deriveActiveNav(pathname: string): string {
    if (pathname.startsWith('/language-learning/level') || pathname.startsWith('/language-learning/module')) return 'modules';
    if (pathname === '/language-learning' || pathname === '/') return 'home';
    return '';
}

export function DesktopSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const activeNav = deriveActiveNav(pathname);

    const [progress, setProgress] = useState<MeProgressResponse | null>(null);

    useEffect(() => {
        new TomeLearningDashboardAPI()
            .getMeProgress()
            .then(setProgress)
            .catch(() => {});
    }, []);

    const cefrLevel = progress?.currentCefrLevel as CefrLevel | undefined;
    const levelName = cefrLevel ? CEFR_LEVEL_NAMES[cefrLevel] : undefined;
    const currentLevelSummary = progress?.levels.find((l) => l.status === 'current');

    const handleNav = (item: typeof NAV_ITEMS[number]) => {
        if (item.id === 'home') {
            router.push('/language-learning');
        } else if (item.id === 'modules') {
            router.push(`/language-learning/level/${cefrLevel ?? 'A1'}`);
        }
    };

    return (
        <aside className="flex flex-col w-60 self-stretch py-6 px-4 gap-1 bg-cyan-900/20 border-r border-cyan-500/30">
            {/* Brand */}
            <div className="flex items-center gap-3 px-2 pb-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-800 flex items-center justify-center flex-shrink-0">
                    <MaskedSvgIcon src="/images/book.svg" alt="Tome" color="bg-lime-200" size="w-5 h-5" />
                </div>
                <div className="min-w-0">
                    <div className="text-xl font-bold text-white leading-none">Tome</div>
                    <div className="text-xs text-white/50 font-semibold mt-0.5">
                        {cefrLevel ? `Danish · ${cefrLevel}` : 'Danish'}
                    </div>
                </div>
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map((item) => (
                <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeNav === item.id}
                    onClick={() => handleNav(item)}
                />
            ))}

            <div className="flex-1" />

            {/* Settings */}
            <NavItem icon="/images/settings.svg" label="Settings" active={false} onClick={() => router.push('/settings')} />

            {/* Level badge */}
            <LevelBadge cefrLevel={cefrLevel} levelName={levelName} modulesCompleted={currentLevelSummary?.modulesCompleted} modulesTotal={currentLevelSummary?.modulesTotal} />
        </aside>
    );
}

function NavItem({icon, label, active, onClick}: {icon: string, label: string, active: boolean, onClick: () => void}) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`flex items-center gap-3.5 w-full text-left px-3.5 py-3 rounded-xl cursor-pointer border-[1.5px] bg-transparent ${active ? 'border-lime-200' : 'border-transparent'}`}
        >
            <MaskedSvgIcon src={icon} alt={label} size="w-5 h-5" color={active ? 'bg-cyan-800' : 'bg-white/70'} />
            <span className={`text-base font-semibold whitespace-nowrap ${active ? 'text-white font-bold' : 'text-white/70'}`}>
                {label}
            </span>
        </button>
    );
}

function LevelBadge({cefrLevel, levelName, modulesCompleted, modulesTotal}: {cefrLevel?: string, levelName?: string, modulesCompleted?: number, modulesTotal?: number}) {
    if (!cefrLevel) return null;

    return (
        <div className="flex items-center gap-3 px-2.5 py-3 mt-2 rounded-2xl border-[1.5px] border-cyan-500/30">
            <div className="w-10 h-10 rounded-full border-[2.5px] border-lime-200 flex items-center justify-center flex-shrink-0 bg-lime-200/10">
                <span className="text-base font-bold text-white">{cefrLevel}</span>
            </div>
            <div className="min-w-0">
                <div className="text-sm font-bold text-white">{levelName}</div>
                <div className="text-xs text-white/50 font-semibold">
                    {modulesCompleted ?? 0} / {modulesTotal ?? 0} modules
                </div>
            </div>
        </div>
    );
}
