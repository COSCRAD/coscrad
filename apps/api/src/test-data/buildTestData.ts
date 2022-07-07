import { InMemorySnapshot, ResourceType } from '../domain/types/ResourceType';
import buildBibliographicReferenceTestData from './buildBibliographicReferenceTestData';
import buildBookTestData from './buildBookTestData';
import buildCategoryTestData from './buildCategoryTestData';
import buildEdgeConnectionTestData from './buildEdgeConnectionTestData';
import buildMediaItemTestData from './buildMediaItemTestData';
import buildPhotographTestData from './buildPhotographTestData';
import buildSongTestData from './buildSongTestData';
import buildSpatialFeatureTestData from './buildSpatialFeatureTestData';
import buildTagTestData from './buildTagTestData';
import buildTermTestData from './buildTermTestData';
import buildTranscribedAudioTestData from './buildTranscribedAudioTestData';
import buildUserTestData from './buildUserTestData';
import buildVocabularyListTestData from './buildVocabularyListTestData';

/**
 * **note** When adding new test data \ modifying existing test data, be sure to
 * run `validateTestData.spec.ts` to ensure your test data satisfies all domain
 * invariants.
 */
export default (): InMemorySnapshot => ({
    resources: {
        [ResourceType.term]: buildTermTestData(),
        [ResourceType.vocabularyList]: buildVocabularyListTestData(),
        [ResourceType.transcribedAudio]: buildTranscribedAudioTestData(),
        [ResourceType.book]: buildBookTestData(),
        [ResourceType.photograph]: buildPhotographTestData(),
        [ResourceType.spatialFeature]: buildSpatialFeatureTestData(),
        [ResourceType.bibliographicReference]: buildBibliographicReferenceTestData(),
        [ResourceType.song]: buildSongTestData(),
        [ResourceType.mediaItem]: buildMediaItemTestData(),
    },
    connections: buildEdgeConnectionTestData(),
    tags: buildTagTestData(),
    categoryTree: buildCategoryTestData(),
    users: buildUserTestData(),
    uuids: [],
});
