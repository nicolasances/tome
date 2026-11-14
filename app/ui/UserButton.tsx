'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserAvatar } from '@/app/components/UserAvatar';
import { MaskedSvgIcon } from '@/app/components/MaskedSvgIcon';

/**
 * Desktop sidebar button showing the signed-in user.
 * Clicking it opens a popover (anchored above the button) with the user's details and a Log off button.
 * The popover closes on outside click and on Esc.
 */
export function UserButton() {

    const { user, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (!user) return null;

    return (
        <div ref={containerRef} className="relative mt-2">
            {open && (
                <div role="dialog" aria-label="Account" style={{ zIndex: 1000 }} className="absolute bottom-full left-0 right-0 mb-2 flex flex-col items-center gap-3 p-4 rounded-2xl border-[1.5px] border-cyan-500/30 bg-cyan-950">
                    <UserAvatar user={user} size="w-16 h-16" textSize="text-2xl" />
                    <div className="w-full text-center min-w-0">
                        <div className="text-xs text-white/50 font-semibold">Logged in as</div>
                        <div className="text-sm font-bold text-white truncate">{user.name}</div>
                        <div className="text-xs text-white/50 font-semibold truncate">{user.email}</div>
                    </div>
                    <button onClick={signOut} className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-lime-200 text-cyan-900 text-sm font-bold cursor-pointer">
                        <MaskedSvgIcon src="/images/log-off.svg" alt="" size="w-4 h-4" color="bg-cyan-900" />
                        Log off
                    </button>
                </div>
            )}

            <button onClick={() => setOpen((prev) => !prev)} aria-haspopup="dialog" aria-expanded={open} title={`Logged in as ${user.name}`} className={`flex items-center gap-3 w-full text-left px-2.5 py-3 rounded-2xl border-[1.5px] cursor-pointer ${open ? 'border-lime-200' : 'border-cyan-500/30'}`}>
                <UserAvatar user={user} />
                <div className="min-w-0">
                    <div className="text-xs text-white/50 font-semibold">Logged in as</div>
                    <div className="text-sm font-bold text-white truncate">{user.name}</div>
                </div>
            </button>
        </div>
    );
}
