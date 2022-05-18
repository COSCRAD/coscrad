import { InMemorySnapshot, resourceTypes } from '../domain/types/resourceTypes';
import buildBibliographicReferenceTestData from './buildBibliographicReferenceTestData';
import buildBookTestData from './buildBookTestData';
import buildCategoryTestData from './buildCategoryTestData';
import buildEdgeConnectionTestData from './buildEdgeConnectionTestData';
import buildPhotographTestData from './buildPhotographTestData';
import buildSpatialFeatureTestData from './buildSpatialFeatureTestData';
import buildTagTestData from './buildTagTestData';
import buildTermTestData from './buildTermTestData';
import buildTranscribedAudioTestData from './buildTranscribedAudioTestData';
import buildVocabularyListTestData from './buildVocabularyListTestData';

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): InMemorySnapshot => ({
    resources: {
        [resourceTypes.term]: buildTermTestData(),
        [resourceTypes.vocabularyList]: buildVocabularyListTestData(),
        [resourceTypes.transcribedAudio]: buildTranscribedAudioTestData(),
        [resourceTypes.book]: buildBookTestData(),
        [resourceTypes.photograph]: buildPhotographTestData(),
        [resourceTypes.spatialFeature]: buildSpatialFeatureTestData(),
        [resourceTypes.bibliographicReference]: buildBibliographicReferenceTestData(),
    },
    connections: buildEdgeConnectionTestData(),
    tags: buildTagTestData(),
    categoryTree: buildCategoryTestData(),
});
