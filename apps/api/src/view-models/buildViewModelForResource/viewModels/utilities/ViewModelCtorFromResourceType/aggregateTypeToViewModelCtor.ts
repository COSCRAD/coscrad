import { CoscradUserGroup } from '../../../../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { AggregateType } from '../../../../../domain/types/AggregateType';
import { CategorizableType } from '../../../../../domain/types/CategorizableType';
import { ResourceType } from '../../../../../domain/types/ResourceType';
import { Ctor } from '../../../../../lib/types/Ctor';
import { NoteViewModel } from '../../../../edgeConnectionViewModels/note.view-model';
import { BaseViewModel } from '../../base.view-model';
import { BibliographicReferenceViewModel } from '../../bibliographic-reference/bibliographic-reference.view-model';
import { BookViewModel } from '../../book.view-model';
import { CateogryTreeViewModel } from '../../category-tree.view-model';
import { CoscradUserViewModel } from '../../coscrad-user.view-model';
import { MediaItemViewModel } from '../../media-item.view-model';
import { PhotographViewModel } from '../../photograph.view-model';
import { SongViewModel } from '../../song.view-model';
import { SpatialFeatureViewModel } from '../../spatial-data/spatial-feature.view-model';
import { TagViewModel } from '../../tag.view-model';
import { TermViewModel } from '../../term.view-model';
import { TranscribedAudioViewModel } from '../../transcribed-audio/transcribed-audio.view-model';
import { VocabularyListViewModel } from '../../vocabulary-list.view-model';

export const aggregateTypeToViewModelCtor: { [K in AggregateType]: Ctor<BaseViewModel> } = {
    [ResourceType.bibliographicReference]: BibliographicReferenceViewModel,
    [ResourceType.book]: BookViewModel,
    [ResourceType.mediaItem]: MediaItemViewModel,
    [ResourceType.photograph]: PhotographViewModel,
    [ResourceType.song]: SongViewModel,
    [ResourceType.spatialFeature]: SpatialFeatureViewModel,
    [ResourceType.term]: TermViewModel,
    [ResourceType.transcribedAudio]: TranscribedAudioViewModel,
    [ResourceType.vocabularyList]: VocabularyListViewModel,
    [CategorizableType.note]: NoteViewModel,
    [AggregateType.category]: CateogryTreeViewModel,
    [AggregateType.tag]: TagViewModel,
    [AggregateType.user]: CoscradUserViewModel,
    [AggregateType.userGroup]: CoscradUserGroup,
};
