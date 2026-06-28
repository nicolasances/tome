'use client'

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";
import { BrainView } from "./components/BrainView";

export default function Home() {
  const { setConfig } = useHeader();

  useEffect(() => {
    setConfig({
      title: 'Tome',
      actions: undefined,
    });
  }, [setConfig]);

  return (
    <div className="flex flex-1 flex-col items-stretch justify-start px-4 h-full">
      <div className="mt-6 mx-4">
        <BrainView />
      </div>
    </div>
  );
}
