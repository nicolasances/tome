'use client'

import BottomFade from "./BottomFade";

export default function Footer({ children, }: Readonly<{ children: React.ReactNode; }>) {

    return (
        <div className="w-full xl:w-[80vw] 2xl:w-[60vw] -mx-12">
            <div className="relative">
                <BottomFade height="xl" />
            </div>
            <div className="app-footer">
                {children}
            </div>
        </div>

    )

}