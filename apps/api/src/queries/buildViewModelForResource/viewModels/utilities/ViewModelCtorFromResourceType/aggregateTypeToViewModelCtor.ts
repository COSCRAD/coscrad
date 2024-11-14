import { AggregateType } from '../../../../../domain/types/AggregateType';
import { CategorizableType } from '../../../../../domain/types/CategorizableType';
import { ResourceType } from '../../../../../domain/types/ResourceType';
import { Ctor } from '../../../../../lib/types/Ctor';
import { DigitalTextViewModel } from '../../../../digital-text';
import { NoteViewModel } from '../../../../edgeConnectionViewModels/note.view-model';
import { StateBasedAudioItemViewModel } from '../../audio-visual/audio-item.view-model.state-based';
import { VideoViewModel } from '../../audio-visual/video.view-model';
import { BaseViewModel } from '../../base.view-model';
import { BibliographicCitationViewModel } from '../../bibliographic-citation/bibliographic-citation.view-model';
import { CategoryTreeViewModel } from '../../category-tree.view-model';
import { CoscradContributorViewModel } from '../../coscrad-contributor.view-model';
import { CoscradUserGroupViewModel } from '../../coscrad-user-group.view-model';
import { CoscradUserViewModel } from '../../coscrad-user.view-model';
import { MediaItemViewModel } from '../../media-item.view-model';
import { PhotographViewModel } from '../../photograph.view-model';
import { PlaylistViewModel } from '../../playlist.view-model';
import { SongViewModel } from '../../song.view-model';
import { SpatialFeatureViewModel } from '../../spatial-data/spatial-feature.view-model';
import { VocabularyListViewModel } from '../../state-based-vocabulary-list.view-model';
import { TagViewModel } from '../../tag.view-model';
import { TermViewModel } from '../../term.view-model.state-based';

/**
 * TODO Remove this once all resource views are event sourced.
 */
export const aggregateTypeToViewModelCtor: {
    [K in AggregateType]: Ctor<BaseViewModel>;
} = {
    [ResourceType.bibliographicCitation]: BibliographicCitationViewModel,
    [ResourceType.digitalText]: DigitalTextViewModel,
    [ResourceType.mediaItem]: MediaItemViewModel,
    [ResourceType.photograph]: PhotographViewModel,
    [ResourceType.song]: SongViewModel,
    [ResourceType.spatialFeature]: SpatialFeatureViewModel,
    [ResourceType.term]: TermViewModel,
    [ResourceType.audioItem]: StateBasedAudioItemViewModel,
    [ResourceType.video]: VideoViewModel,
    [ResourceType.vocabularyList]: VocabularyListViewModel,
    [ResourceType.playlist]: PlaylistViewModel,
    [CategorizableType.note]: NoteViewModel,
    [AggregateType.category]: CategoryTreeViewModel,
    [AggregateType.tag]: TagViewModel,
    [AggregateType.user]: CoscradUserViewModel,
    [AggregateType.userGroup]: CoscradUserGroupViewModel,
    [AggregateType.contributor]: CoscradContributorViewModel,
};
