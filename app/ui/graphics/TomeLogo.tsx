import { Texturina as LogoFont } from "next/font/google";

const logoFont = LogoFont({
    subsets: ["latin"],
});

export default function TomeLogo() {

    return (
        <div className="flex flex-row justify-center items-center space-x-1">
            <div className="w-6 h-6">
                <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 1H8V15H5V1Z" className="fill-cyan-200" />
                    <path d="M0 3H3V15H0V3Z" className="fill-cyan-200" />
                    <path d="M12.167 3L9.34302 3.7041L12.1594 15L14.9834 14.2959L12.167 3Z" className="fill-cyan-700" />
                </svg>
            </div>
            <div className={`${logoFont.className} font-medium text-2xl text-cyan-200 pb-1`}>
                Tome
            </div>
        </div>
    )
}