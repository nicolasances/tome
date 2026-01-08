"use client";

import { createContext, ReactNode, useContext, useState } from "react";

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

  const toggleCarMode = () => {
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
