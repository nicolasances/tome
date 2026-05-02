import { IVocabularyPracticeAPI } from './IVocabularyPracticeAPI';
import { MockVocabularyPracticeAPI } from './MockVocabularyPracticeAPI';
import { TomeVocabularyPracticeAPI } from './TomeVocabularyPracticeAPI';

export function getVocabularyPracticeAPI(): IVocabularyPracticeAPI {
  
  if (process.env.NEXT_PUBLIC_VOCAB_PRACTICE_MOCK === 'true') 
    return new MockVocabularyPracticeAPI();
  
  return new TomeVocabularyPracticeAPI();
}
