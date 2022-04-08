import { entityTypes, InMemorySnapshot } from '../domain/types/entityTypes';
import buildAudioWithTranscriptTestData from './buildAudioWithTranscriptTestData';
import buildBookTestData from './buildBookTestData';
import buildPhotographTestData from './buildPhotographTestData';
import buildSpatialFeatureTestData from './buildSpatialFeatureTestData';
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
    [entityTypes.audioWithTranscript]: buildAudioWithTranscriptTestData(),
    [entityTypes.book]: buildBookTestData(),
    [entityTypes.photograph]: buildPhotographTestData(),
    [entityTypes.spatialFeature]: buildSpatialFeatureTestData(),
});
