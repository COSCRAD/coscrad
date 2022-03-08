import { InMemorySnapshot } from '../domain/types/entityType';
import buildTagTestData from './buildTagTestData';
import buildTermTestData from './buildTermTestData';
import buildVocabularyListTestData from './buildVocabularyListTestData';

export default (): InMemorySnapshot =>
  ({
    ...buildTagTestData(),
    ...buildTermTestData(),
    ...buildVocabularyListTestData(),
    // TODO fix types
  } as InMemorySnapshot);
