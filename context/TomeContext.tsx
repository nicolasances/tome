"use client";

import { TopicReviewQuestion } from "@/model/questions";
import { TopicReview } from "@/model/topicReview";
import { createContext, ReactNode, useContext, useState } from "react";

interface TomeContextContent {
  topicReviewContext: TopicReviewContext | undefined
  updateTopicReviewContext: (trc: TopicReviewContext) => void
}

interface TopicReviewContext {
  topicReview: TopicReview 
  questions: TopicReviewQuestion[]
}

const TomeContext = createContext<TomeContextContent | undefined>(undefined);

// Define the provider props type
interface TomeContextProviderProps {
  children: ReactNode;
}

// Create the provider component
export const TomeContextProvider: React.FC<TomeContextProviderProps> = ({ children }) => {
  const [topicReviewContext, setTopicReviewContext] = useState<TopicReviewContext | undefined>(undefined);

  const updateTopicReviewContext = (newValue: TopicReviewContext) => {
    setTopicReviewContext(newValue)
  };

  return (
    <TomeContext.Provider value={{ topicReviewContext, updateTopicReviewContext }}>
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
