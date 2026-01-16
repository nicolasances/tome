'use client'

import { useContext, useEffect } from "react";
import { SettingsContext } from "@/context/SettingsContext";
import { MaskedSvgIcon } from "../components/MaskedSvgIcon";
import RoundButton from "../ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import { useHeader } from "@/context/HeaderContext";

export default function Settings() {

  const { whisperHost, setWhisperHost } = useContext(SettingsContext)!;
  const router = useRouter();
  const { setConfig } = useHeader()

  useEffect(() => {
    setConfig({
      title: "Settings" 
    })
  }, [setConfig])

  const handleWhisperingModelChange = (value: 'openai' | 'toto') => {
    setWhisperHost(value);
  };

  return (
    <div className="w-full px-8">
      <div className="space-y-6 pt-10">
        {/* Whispering Model Setting */}
        <div className="">
          <div className="text-lg mb-4 text-gray-800">Whisper Model</div>
          <div className="space-y-3">
            <RadioButton label="OpenAI Whisper" selected={whisperHost === 'openai'} onClick={() => handleWhisperingModelChange('openai')} />
            <RadioButton label="Toto Whisper" selected={whisperHost === 'toto'} onClick={() => handleWhisperingModelChange('toto')} />
          </div>
        </div>
      </div>
      <div className="flex justify-center fixed bottom-6 left-0 right-0">
        <RoundButton svgIconPath={{ src: "/images/home.svg", alt: "Home" }} onClick={() => { router.push("/") }} />
      </div>
    </div>
  );
}

function RadioButton({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {

  return (
    <div className="flex items-center text-base" onClick={onClick}>
      <div className={`w-6 h-6 min-w-6 border-2 rounded-full ${selected ? 'bg-cyan-300 border-cyan-300' : 'border-cyan-700'}`}>
        {selected && <MaskedSvgIcon src="/images/tick.svg" alt="Selected" />}
      </div>
      <div className={`ml-2 ${selected ? 'text-cyan-300' : ''}`}>{label}</div>
    </div>
  )
} 