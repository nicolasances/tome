import { DateFlashcard, MultipleOptionsFlashcard, SectionTimelineFlashcard } from "@/api/TomeFlashcardsAPI";
import { HistoricalGraphFC } from "./api/GraphFlashcard";



export type Flashcard = MultipleOptionsFlashcard | SectionTimelineFlashcard | DateFlashcard | HistoricalGraphFC;