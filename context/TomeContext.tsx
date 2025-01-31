"use client";

import { TopicMemLevel } from "@/api/TomeAPI";
import { TopicReviewQuestion } from "@/model/questions";
import { TopicReview } from "@/model/topicReview";
import { createContext, ReactNode, useContext, useState } from "react";

interface TomeContextContent {
  topicReviewContext: TopicReviewContext | undefined
  topicMemLevels: TopicMemorizationLevels | undefined
  updateTopicReviewContext: (trc: TopicReviewContext) => void
  updateTopicMemLevels: (tml: TopicMemorizationLevels) => void
}

interface TopicReviewContext {
  topicReview: TopicReview 
  questions: TopicReviewQuestion[]
}

interface TopicMemorizationLevels {
  memLevels: TopicMemLevel[]
}

const TomeContext = createContext<TomeContextContent | undefined>(undefined);

// Define the provider props type
interface TomeContextProviderProps {
  children: ReactNode;
}

// Create the provider component
export const TomeContextProvider: React.FC<TomeContextProviderProps> = ({ children }) => {
  const [topicReviewContext, setTopicReviewContext] = useState<TopicReviewContext | undefined>(undefined);
  const [topicMemLevels, setTopicMemLevels] = useState<TopicMemorizationLevels | undefined>(undefined);

  const updateTopicReviewContext = (newValue: TopicReviewContext) => {
    setTopicReviewContext(newValue)
  };

  const updateTopicMemLevels = (newValue: TopicMemorizationLevels) => {
    setTopicMemLevels(newValue)
  }

  return (
    <TomeContext.Provider value={{ topicReviewContext, updateTopicReviewContext, topicMemLevels, updateTopicMemLevels }}>
      {children}
    </TomeContext.Provider>
  );
};

// Custom hook to use the context
export const useTomeContext = (): TomeContextContent => {
  const context = useContext(TomeContext);
  if (!context) {
    throw new Error("useTomeContext must be used within a TomeContextProvider");
  }
  return context;
};
