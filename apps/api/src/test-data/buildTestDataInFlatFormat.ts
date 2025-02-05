import { AggregateType } from '../domain/types/AggregateType';
import { PartialSnapshot } from '../domain/types/PartialSnapshot';
import { ResourceType } from '../domain/types/ResourceType';
import buildAudioItemTestData from './buildAudioItemTestData';
import buildBibliographicCitationTestData from './buildBibliographicCitationTestData';
import buildCategoryTestData from './buildCategoryTestData';
import buildContributorTestData from './buildContributorTestData';
import buildDigitalTextTestData from './buildDigitalTextTestData';
import buildEdgeConnectionTestData from './buildEdgeConnectionTestData';
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
    [ResourceType.photograph]: buildPhotographTestData(),
    [ResourceType.spatialFeature]: buildSpatialFeatureTestData(),
    [ResourceType.bibliographicCitation]: buildBibliographicCitationTestData(),
    [ResourceType.digitalText]: buildDigitalTextTestData(),
    [ResourceType.song]: buildSongTestData(),
    [ResourceType.playlist]: buildPlayListTestData(),
    // Non-Resource Aggregates
    [AggregateType.note]: buildEdgeConnectionTestData(),
    [AggregateType.tag]: buildTagTestData(),
    [AggregateType.category]: buildCategoryTestData(),
    [AggregateType.user]: buildUserTestData(),
    [AggregateType.userGroup]: buildUserGroupTestData(),
    [AggregateType.contributor]: buildContributorTestData(),
});
