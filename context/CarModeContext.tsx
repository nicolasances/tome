"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { useAudio } from "./AudioContext";
import { useVoiceRecording } from "@/app/hooks/useVoiceRecording";
import { useSpeechRecognition } from "@/app/hooks/useSpeechRecognition";

interface CarModeContextContent {
  carMode: boolean;
  setCarMode: (carMode: boolean) => void;
  toggleCarMode: () => void;
}

const CarModeContext = createContext<CarModeContextContent | undefined>(undefined);

// Define the provider props type
interface CarModeContextProviderProps {
  children: ReactNode;
}

// Create the provider component
export const CarModeContextProvider: React.FC<CarModeContextProviderProps> = ({ children }) => {
  const [carMode, setCarMode] = useState(false);
  const { stop: stopAudio } = useAudio();
  const { stopRecording: stopVoiceRecording } = useVoiceRecording();
  const { stopListening: stopSpeechRecognition } = useSpeechRecognition();

  const toggleCarMode = () => {

    const stoppingCarMode = carMode;

    // When toggling car mode, also stop any ongoing speech or microphone recording
    if (stoppingCarMode) {
      // Stop running audio
      stopAudio();

      // Stop running voice recording 
      stopVoiceRecording();
      stopSpeechRecognition();
    }


    setCarMode(!carMode);

  };

  return (
    <CarModeContext.Provider value={{ carMode, setCarMode, toggleCarMode }}>
      {children}
    </CarModeContext.Provider>
  );
};

// Custom hook to use the context
export const useCarMode = (): CarModeContextContent => {
  const context = useContext(CarModeContext);
  if (!context) {
    throw new Error("useCarMode must be used within a CarModeContextProvider");
  }
  return context;
};
