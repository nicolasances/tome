"use client";

import { Topic } from "@/api/TomeTopicsAPI";
import { PracticeStats } from "@/app/ui/complex/FlashCardsSession";
import { Practice } from "@/model/Practice";
import { PracticeFlashcard } from "@/model/PracticeFlashcard";
import { TopicReviewQuestion } from "@/model/questions";
import { TopicReview } from "@/model/topicReview";
import { createContext, ReactNode, useContext, useState } from "react";

interface TomeContextContent {
  topicReviewContext: TopicReviewContext | undefined
  
  segmentPractice: SegmentPracticeData | undefined
  
  updateSegmentPractice: (data: SegmentPracticeData) => void
  updateTopicReviewContext: (trc: TopicReviewContext) => void
}

interface TopicReviewContext {
  topicReview: TopicReview 
  questions: TopicReviewQuestion[]
}

interface SegmentPracticeData {
  practice: Practice, 
  topic: Topic, 
  flashcards: PracticeFlashcard[], 
  segmentId: PracticeSegmentId, 
  practiceStats?: PracticeStats
}

interface PracticeSegmentId {
  sectionCode: string
  type: string
}

const TomeContext = createContext<TomeContextContent | undefined>(undefined);

// Define the provider props type
interface TomeContextProviderProps {
  children: ReactNode;
}

// Create the provider component
export const TomeContextProvider: React.FC<TomeContextProviderProps> = ({ children }) => {
  const [topicReviewContext, setTopicReviewContext] = useState<TopicReviewContext | undefined>(undefined);
  const [segmentPractice, setSegmentPractice] = useState<SegmentPracticeData | undefined>(undefined);

  const updateTopicReviewContext = (newValue: TopicReviewContext) => {
    setTopicReviewContext(newValue)
  };

  const updateSegmentPractice = (newValue: SegmentPracticeData) => {
    setSegmentPractice(newValue)
  };
  
  return (
    <TomeContext.Provider value={{ topicReviewContext, updateTopicReviewContext, segmentPractice, updateSegmentPractice }}>
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
