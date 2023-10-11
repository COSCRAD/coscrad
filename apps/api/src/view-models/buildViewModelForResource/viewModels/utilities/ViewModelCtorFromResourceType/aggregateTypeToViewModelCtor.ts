import { AggregateType } from '../../../../../domain/types/AggregateType';
import { CategorizableType } from '../../../../../domain/types/CategorizableType';
import { ResourceType } from '../../../../../domain/types/ResourceType';
import { Ctor } from '../../../../../lib/types/Ctor';
import { NoteViewModel } from '../../../../edgeConnectionViewModels/note.view-model';
import { AudioItemViewModel } from '../../audio-visual/audio-item.view-model';
import { VideoViewModel } from '../../audio-visual/video.view-model';
import { BaseViewModel } from '../../base.view-model';
import { BibliographicReferenceViewModel } from '../../bibliographic-reference/bibliographic-reference.view-model';
import { BookViewModel } from '../../book.view-model';
import { CategoryTreeViewModel } from '../../category-tree.view-model';
import { CoscradUserGroupViewModel } from '../../coscrad-user-group.view-model';
import { CoscradUserViewModel } from '../../coscrad-user.view-model';
import { MediaItemViewModel } from '../../media-item.view-model';
import { PhotographViewModel } from '../../photograph.view-model';
import { PlaylistViewModel } from '../../playlist.view-model';
import { SongViewModel } from '../../song.view-model';
import { SpatialFeatureViewModel } from '../../spatial-data/spatial-feature.view-model';
import { TagViewModel } from '../../tag.view-model';
import { TermViewModel } from '../../term.view-model';
import { VocabularyListViewModel } from '../../vocabulary-list.view-model';

export type AggregateTypesWhoseViewsAreSourcedFromSnapshots = Exclude<
    AggregateType,
    typeof AggregateType.digitalText
>;

export type ResourceTypesWhoseViewsAreSourcedFromSnapshots = Exclude<
    ResourceType,
    typeof ResourceType.digitalText
>;

export const aggregateTypeToViewModelCtor: {
    [K in AggregateTypesWhoseViewsAreSourcedFromSnapshots]: Ctor<BaseViewModel>;
} = {
    [ResourceType.bibliographicReference]: BibliographicReferenceViewModel,
    [ResourceType.book]: BookViewModel,
    [ResourceType.mediaItem]: MediaItemViewModel,
    [ResourceType.photograph]: PhotographViewModel,
    [ResourceType.song]: SongViewModel,
    [ResourceType.spatialFeature]: SpatialFeatureViewModel,
    [ResourceType.term]: TermViewModel,
    [ResourceType.audioItem]: AudioItemViewModel,
    [ResourceType.video]: VideoViewModel,
    [ResourceType.vocabularyList]: VocabularyListViewModel,
    [ResourceType.playlist]: PlaylistViewModel,
    [CategorizableType.note]: NoteViewModel,
    [AggregateType.category]: CategoryTreeViewModel,
    [AggregateType.tag]: TagViewModel,
    [AggregateType.user]: CoscradUserViewModel,
    [AggregateType.userGroup]: CoscradUserGroupViewModel,
};
