'use client'

import { usePathname, useRouter } from "next/navigation";
import TomeLogo from "../graphics/TomeLogo";

export default function Header() {

    const pathname = usePathname()
    const router = useRouter()

    const isRoot = pathname == '/'

    return (
        <div className="app-header flex flex-row items-center px-4">
            <div className="flex-1">
                <TomeLogo />
            </div>
        </div>
    )
}