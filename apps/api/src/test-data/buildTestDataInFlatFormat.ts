import { AggregateType } from '../domain/types/AggregateType';
import { PartialSnapshot } from '../domain/types/PartialSnapshot';
import { ResourceType } from '../domain/types/ResourceType';
import buildAudioItemTestData from './buildAudioItemTestData';
import buildBibliographicCitationTestData from './buildBibliographicCitationTestData';
import buildBookTestData from './buildBookTestData';
import buildCategoryTestData from './buildCategoryTestData';
import buildDigitalTextTestData from './buildDigitalTextTestData';
import buildEdgeConnectionTestData from './buildEdgeConnectionTestData';
import buildMediaItemTestData from './buildMediaItemTestData';
import buildPhotographTestData from './buildPhotographTestData';
import buildPlayListTestData from './buildPlaylistTestData';
import buildSongTestData from './buildSongTestData';
import buildSpatialFeatureTestData from './buildSpatialFeatureTestData';
import buildTagTestData from './buildTagTestData';
import buildTermTestData from './buildTermTestData';
import buildUserGroupTestData from './buildUserGroupTestData';
import buildUserTestData from './buildUserTestData';
import buildVideoTestData from './buildVideoTestData';
import buildVocabularyListTestData from './buildVocabularyListTestData';

export default (): PartialSnapshot => ({
    // Resources
    [ResourceType.term]: buildTermTestData(),
    [ResourceType.vocabularyList]: buildVocabularyListTestData(),
    [ResourceType.audioItem]: buildAudioItemTestData(),
    [ResourceType.video]: buildVideoTestData(),
    [ResourceType.book]: buildBookTestData(),
    [ResourceType.photograph]: buildPhotographTestData(),
    [ResourceType.spatialFeature]: buildSpatialFeatureTestData(),
    [ResourceType.bibliographicCitation]: buildBibliographicCitationTestData(),
    [ResourceType.digitalText]: buildDigitalTextTestData(),
    [ResourceType.song]: buildSongTestData(),
    [ResourceType.mediaItem]: buildMediaItemTestData(),
    [ResourceType.playlist]: buildPlayListTestData(),
    // Non-Resource Aggregates
    [AggregateType.note]: buildEdgeConnectionTestData(),
    [AggregateType.tag]: buildTagTestData(),
    [AggregateType.category]: buildCategoryTestData(),
    [AggregateType.user]: buildUserTestData(),
    [AggregateType.userGroup]: buildUserGroupTestData(),
});
