'use client'

import { useEffect } from "react";
import RoundButton from "../ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";
import { SHORTCUTS } from "@/utils/keyboardShortcuts";

export default function KeyboardShortcuts() {

  const router = useRouter();
  const { setConfig } = useHeader()

  useEffect(() => {
    setConfig({
      title: "Keyboard Shortcuts"
    })
  }, [setConfig])

  return (
    <div className="w-full px-8">
      <div className="space-y-3 pt-10">
        {SHORTCUTS.map(shortcut => (
          <div key={shortcut.id} className="flex items-center justify-between gap-4 py-3 border-b border-cyan-700/20">
            <span className="text-base text-gray-800">{shortcut.label}</span>
            <span className="inline-flex items-center rounded-lg border-2 border-cyan-700 px-3 py-1 text-sm font-bold text-cyan-800 whitespace-nowrap">
              {shortcut.combo}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-center fixed bottom-6 left-0 right-0">
        <RoundButton svgIconPath={{ src: "/images/home.svg", alt: "Home" }} onClick={() => { router.push("/") }} />
      </div>
    </div>
  );
}
