'use client'

import { useEffect, useState } from "react";
import { useHeader } from "@/context/HeaderContext";

export default function Settings() {

  const { setConfig } = useHeader();
  const [whisperingModel, setWhisperingModel] = useState<'openai' | 'toto'>('openai');

  useEffect(() => {
    setConfig({
      title: 'Settings',
      actions: undefined,
    });

    // Load saved preference from localStorage
    const saved = localStorage.getItem('whisperingModel');
    if (saved === 'toto' || saved === 'openai') {
      setWhisperingModel(saved);
    }
  }, [setConfig]);

  const handleWhisperingModelChange = (value: 'openai' | 'toto') => {
    setWhisperingModel(value);
    localStorage.setItem('whisperingModel', value);
  };

  return (
    <div className="w-full px-4">
      <div className="space-y-6 pt-6">
        {/* Whispering Model Setting */}
        <div className="">
          <div className="text-lg mb-4 text-gray-800">Whisper Model</div>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="whisperingModel"
                value="openai"
                checked={whisperingModel === 'openai'}
                onChange={(e) => handleWhisperingModelChange(e.target.value as 'openai')}
                className="w-4 h-4 text-cyan-600 cursor-pointer"
              />
              <span className="ml-3 text-gray-700">Open AI Whisper</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="whisperingModel"
                value="toto"
                checked={whisperingModel === 'toto'}
                onChange={(e) => handleWhisperingModelChange(e.target.value as 'toto')}
                className="w-4 h-4 text-cyan-600 cursor-pointer"
              />
              <span className="ml-3 text-gray-700">Toto Whisper</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadioButton({label, selected, onClick}: {label: string, selected: boolean, onClick: () => void}) {

  return (
    <div className="flex items-center">
      <div className={"w-4 h-4 min-w-4 ${selected ? 'bg-green-200' : ''}"}></div>
      <div className="">{label}</div>
    </div>
  )
} 