'use client'

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";

export default function LanguageLearningPage() {

    const router = useRouter();
    const { setConfig } = useHeader();

    useEffect(() => {
        setConfig({
            title: 'Language Learning',
            backButton: {
                enabled: true,
                onClick: () => router.back(),
            },
        });
    }, [setConfig, router]);

    return (
        <div className="flex flex-1 flex-col items-stretch justify-start">
            <div className="flex-1 app-content flex flex-col">
                {/* Practice Buttons section */}
                <div className="flex-1">
                    {/* TODO: Practice Buttons */}
                </div>

                {/* Learning Stats section */}
                <div>
                    {/* TODO: Learning Stats */}
                </div>
            </div>
        </div>
    );
}
