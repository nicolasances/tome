'use client'

import TomeLogo from "../graphics/TomeLogo";

export default function Header() {

    return (
        <div className="app-header flex flex-row items-center px-4">
            <div className="flex-1">
                <TomeLogo />
            </div>
        </div>
    )
}