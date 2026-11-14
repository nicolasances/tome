'use client';

import { useState } from 'react';
import { userInitial } from '@/utils/userProfile';

/**
 * Circular avatar of the signed-in user.
 * Shows the Google profile picture when available, otherwise (or if the picture fails to load) the user's initial.
 *
 * @param user - The user to display (name, email, optional picture)
 * @param size - Tailwind size classes of the circle (default: "w-10 h-10")
 * @param textSize - Tailwind text size class of the initial (default: "text-base")
 */
export function UserAvatar({user, size = 'w-10 h-10', textSize = 'text-base'}: {user: {name?: string, email?: string, picture?: string} | null, size?: string, textSize?: string}) {

    const [pictureFailed, setPictureFailed] = useState(false);

    if (user?.picture && !pictureFailed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.picture} alt={user.name ?? 'User'} referrerPolicy="no-referrer" onError={() => setPictureFailed(true)} className={`${size} rounded-full object-cover flex-shrink-0 border-2 border-lime-200`} />
        );
    }

    return (
        <div aria-hidden="true" className={`${size} rounded-full flex items-center justify-center flex-shrink-0 border-2 border-lime-200 bg-lime-200/10`}>
            <span className={`${textSize} font-bold text-white`}>{userInitial(user)}</span>
        </div>
    );
}
