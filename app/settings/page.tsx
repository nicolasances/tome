'use client'

import { useEffect } from "react";
import { useHeader } from "@/context/HeaderContext";

export default function Settings() {

  const { setConfig } = useHeader();

  useEffect(() => {
    setConfig({
      title: 'Settings',
      actions: undefined,
    });
  }, [setConfig]);

  return (
    <div className="w-full">
      {/* Settings page content will go here */}
    </div>
  );
}
