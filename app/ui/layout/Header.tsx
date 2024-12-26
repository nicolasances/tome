'use client'

import { usePathname, useRouter } from "next/navigation";
import BackSVG from "../graphics/icons/Back";
import TomeLogo from "../graphics/TomeLogo";

export default function Header() {

    const pathname = usePathname()
    const router = useRouter()

    const isRoot = pathname == '/'

    return (
        <div className="flex flex-row px-4">
            <div className="w-8 h-8 fill-cyan-200">
                {!isRoot && <div onClick={() => { router.back() }}><BackSVG /></div>}
            </div>
            <div className="flex-1">
                <TomeLogo />
            </div>
            <div className="w-8"></div>
        </div>
    )
}