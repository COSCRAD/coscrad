import { entityTypes, InMemorySnapshot } from '../domain/types/entityTypes';
import buildTagTestData from './buildTagTestData';
import buildTermTestData from './buildTermTestData';
import buildVocabularyListTestData from './buildVocabularyListTestData';

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): InMemorySnapshot => ({
    [entityTypes.tag]: buildTagTestData(),
    [entityTypes.term]: buildTermTestData(),
    [entityTypes.vocabularyList]: buildVocabularyListTestData(),
});
