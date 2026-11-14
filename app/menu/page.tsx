'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';
import { useCarMode } from '@/context/CarModeContext';
import { useHeader } from '@/context/HeaderContext';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/app/components/UserAvatar';

export default function Menu() {
    const { carMode, toggleCarMode } = useCarMode();
    const { setConfig } = useHeader();
    const { user, signOut } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setConfig({
            title: 'Menu',
            backButton: { enabled: true, onClick: () => router.back() },
        });
    }, [setConfig, router]);

    return (
        <div className="w-full px-8 pt-10">
            <div className="flex flex-col gap-4">
                <MenuItem onClick={() => router.push('/')} icon="/images/home.svg" iconColor="bg-cyan-700" label="Home" />
                <MenuItem onClick={toggleCarMode} icon="/images/car.svg" iconColor={carMode ? 'bg-red-700' : 'bg-cyan-700'} label="Car Mode" tag={carMode ? 'active' : undefined} />
                <MenuItem onClick={() => router.push('/settings')} icon="/images/settings.svg" iconColor="bg-cyan-700" label="Settings" />
                <div className="pt-4"></div>
                <MenuItem onClick={() => router.push('/new-topic')} icon="/images/plus.svg" iconColor="bg-cyan-700" label="New Topic" />
            </div>

            {user && (
                <div className="flex flex-col gap-4 mt-10 pt-6 border-t border-cyan-500/30">
                    <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar user={user} size="w-12 h-12" textSize="text-lg" />
                        <div className="min-w-0">
                            <div className="text-sm">Logged in as <span className="font-bold">{user.name}</span></div>
                            <div className="text-xs opacity-60 truncate">{user.email}</div>
                        </div>
                    </div>
                    <MenuItem onClick={signOut} icon="/images/log-off.svg" iconColor="bg-cyan-700" label="Log off" />
                </div>
            )}
        </div>
    );
}

function MenuItem({onClick, icon, iconColor, label, tag}: {onClick?: () => void, icon: string, iconColor: string, label: string, tag?: string}) {

    const [pressed, setPressed] = useState(false);

    return (
        <div className="flex items-center text-base gap-4 cursor-pointer" onClick={onClick}
            style={{ transform: pressed ? 'scale(0.95)' : 'scale(1)' }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setPressed(false)}
        >
            <div>
                <MaskedSvgIcon src={icon} alt={label} color={iconColor} />
            </div>
            <div className="pt-1">{label} {tag && (<span className="rounded-full bg-red-300 px-2 ml-2">{tag}</span>)}</div>
        </div>
    );
}
