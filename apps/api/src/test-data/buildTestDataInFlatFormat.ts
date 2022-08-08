import { AggregateType } from '../domain/types/AggregateType';
import { PartialSnapshot } from '../domain/types/PartialSnapshot';
import { ResourceType } from '../domain/types/ResourceType';
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
import buildUserGroupTestData from './buildUserGroupTestData';
import buildUserTestData from './buildUserTestData';
import buildVocabularyListTestData from './buildVocabularyListTestData';

export default (): PartialSnapshot => ({
    // Resources
    [ResourceType.term]: buildTermTestData(),
    [ResourceType.vocabularyList]: buildVocabularyListTestData(),
    [ResourceType.transcribedAudio]: buildTranscribedAudioTestData(),
    [ResourceType.book]: buildBookTestData(),
    [ResourceType.photograph]: buildPhotographTestData(),
    [ResourceType.spatialFeature]: buildSpatialFeatureTestData(),
    [ResourceType.bibliographicReference]: buildBibliographicReferenceTestData(),
    [ResourceType.song]: buildSongTestData(),
    [ResourceType.mediaItem]: buildMediaItemTestData(),
    // Non-Resource Aggregates
    [AggregateType.note]: buildEdgeConnectionTestData(),
    [AggregateType.tag]: buildTagTestData(),
    [AggregateType.category]: buildCategoryTestData(),
    [AggregateType.user]: buildUserTestData(),
    [AggregateType.userGroup]: buildUserGroupTestData(),
});
