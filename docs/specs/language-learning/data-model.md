# Tome — Language Learning: Data Model

This document defines the data models for the Tome Language Learning system.

---

## User
```
User {
  id
  name
  email
  cefrLevel          // A1 | A2 | B1 | B2 | C1 | C2
  createdAt
  lastActiveAt
}
```

## VocabularyItem
```
VocabularyItem {
  id
  danish
  english
  type               // noun | verb | adjective | ... (see idea.md §3.2.1)
  tags               // string[]
  cefrLevel          // level at which this item is typically introduced
}
```

*Note: VocabularyItem is a canonical definition shared across all users and modules. The same word (e.g., "kaffe") is stored once and can be referenced by multiple modules. User-specific progress is tracked separately in UserVocabularyProgress.*

## UserVocabularyProgress
```
UserVocabularyProgress {
  userId
  vocabularyItemId   // references VocabularyItem.id
  masteryScore       // float 0.0–1.0
  lastReviewed       // timestamp | null
  exerciseHistory    // ExerciseResult[]
}
```

*Note: One record per user per vocabulary item. This separation allows a single global mastery score per word while enabling modules to reuse existing vocabulary. Vocabulary review can still be filtered by module by joining on which modules reference which vocabulary items.*

## Exercise
```
Exercise {
  id
  moduleId           // the module this exercise belongs to
  type               // translation_active | multiple_choice |
                     // fill_blank | sentence_reorder | error_correction | conjugation_drill
  prompt             // the question or sentence shown to the user
  answer             // the canonical correct answer (shown in feedback)
  alternativeAnswers // string[] — other accepted translations (translation_active only; empty for other types)
  distractors        // string[] (multiple choice only — the wrong options)
  vocabularyItemId   // primary vocab item being tested (nullable for grammar-only exercises)
  grammarConceptId   // grammar concept being tested (nullable for vocab-only exercises)
  difficulty         // float 0–1 (within the module's CEFR level)
  timesShown         // int (incremented each time this exercise appears in a session)
}
```

## ExerciseBank
```
ExerciseBank {
  id
  moduleId
  exercises          // Exercise[]
  generatedAt        // timestamp (of the most recent generation)
  totalGenerated     // int (cumulative exercises ever generated for this module)
}
```

## ExerciseResult
```
ExerciseResult {
  exerciseId         // references Exercise.id
  exerciseType
  isCorrect
  userAnswer
  correctAnswer
  timestamp
  moduleId           // null if from review session
}
```

## Module
```
Module {
  id
  title
  theme
  communicationGoal
  cefrLevel
  vocabularyItemIds  // string[] — references to VocabularyItem.id
  grammarConceptIds  // string[] — references to GrammarConcept.id
  createdAt
  isUserGenerated    // boolean
}
```

*Note: Modules reference vocabulary items and grammar concepts by ID rather than embedding them. This allows vocabulary reuse across modules while maintaining a single global mastery score per word.*

## UserModuleProgress
```
UserModuleProgress {
  userId
  moduleId
  status             // locked | available | in_progress | completed
  startedAt          // timestamp | null
  completedAt        // timestamp | null
  testAttempts       // ModuleTestAttempt[] (all test attempts, failed and passed)
}
```

*Note: Module status is user-specific (one user may have completed a module while another hasn't started it), so it belongs in a separate progress table rather than on the Module entity itself.*

## ModuleTestAttempt
```
ModuleTestAttempt {
  id
  userId
  moduleId
  score              // float 0–1
  passed             // boolean
  takenAt            // timestamp
}
```

*Note: Every test attempt (both failed and the eventual passing attempt) is recorded here. This provides a full history of a user's progression on a given module test and enables future features such as improvement tracking, difficulty analytics, or adaptive retry strategies.*

## GrammarConcept
```
GrammarConcept {
  id
  name               // e.g. "Inversion"
  category           // tenses | sentence_structure | verbs | nouns | ...
  cefrLevelIntroduced
  explanation        // short text (AI-generated or authored)
  examples           // DanishExample[] — each with danish + english
}
```

*Note: Like VocabularyItem, GrammarConcept is a canonical definition referenced by modules via grammarConceptIds. Grammar concepts are shared across modules and users.*

## LevelTest
```
LevelTest {
  id
  cefrLevel          // the level being tested
  userId
  score              // float 0–1
  passed             // boolean
  takenAt            // timestamp
  weakAreas          // GrammarConcept[] | VocabularyItem[]
}
```

## DialogSession
```
DialogSession {
  id
  userId
  cefrLevel          // user's level at the time of the session
  topic              // free-text description
  persona            // peer | challenger | interviewer | expert
  correctionMode     // silent | inline | strict
  messages           // DialogMessage[]
  startedAt          // timestamp
  endedAt            // timestamp | null
  feedback           // DialogFeedback | null (generated after session ends)
}
```

## DialogMessage
```
DialogMessage {
  role               // user | assistant
  content            // string (Danish)
  timestamp
  corrections        // GrammarCorrection[] (populated when correction mode is inline/strict)
}
```

## GrammarCorrection
```
GrammarCorrection {
  errorText          // what the user wrote
  correctedText      // the correct form
  rule               // one-line explanation in English
}
```

## DialogFeedback
```
DialogFeedback {
  grammarIssues      // GrammarCorrection[] (all issues from the session)
  vocabularyGaps     // VocabularyItem[] (words the user could have used)
  vocabularyUsed     // VocabularyItem[] (words the user used correctly)
  suggestedModules   // Module[] (modules addressing observed weaknesses)
  overallNote        // string (qualitative assessment)
}
```

## ContentReport
```
ContentReport {
  id
  userId
  inputText          // the pasted content
  estimatedCefrLevel // A1 | A2 | B1 | B2 | C1 | C2
  vocabularyCoverage // float 0–1 (% of content vocab the user knows)
  newVocabularyItems // VocabularyItem[] (items in text not in user's set)
  grammarPatterns    // GrammarPatternResult[]
  suggestedModules   // Module[] (existing modules that address gaps)
  customModulePrompt // string | null (if a custom module is generated)
  createdAt          // timestamp
}
```

## GrammarPatternResult
```
GrammarPatternResult {
  conceptName        // e.g. "Subordinate clause word order"
  status             // covered | ahead_in_curriculum | not_in_curriculum
  coveredByModule    // Module | null
}
```
