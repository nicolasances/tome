import { Texturina as LogoFont } from "next/font/google";

const logoFont = LogoFont({
    subsets: ["latin"],
});

export default function TomeLogo() {

    return (
        <div className="flex flex-row justify-center items-center space-x-1">
            <div className={`font-bold text-xl text-cyan-900`}>
                Tome
            </div>
        </div>
    )
}