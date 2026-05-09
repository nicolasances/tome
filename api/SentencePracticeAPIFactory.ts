import { ISentencePracticeAPI } from './ISentencePracticeAPI';
import { MockSentencePracticeAPI } from './MockSentencePracticeAPI';
import { TomeSentencePracticeAPI } from './TomeSentencePracticeAPI';

export function getSentencePracticeAPI(): ISentencePracticeAPI {

  if (process.env.NEXT_PUBLIC_SENTENCE_PRACTICE_MOCK === 'true')
    return new MockSentencePracticeAPI();

  return new TomeSentencePracticeAPI();
}
