import { AggregateType } from '../../aggregate-type.enum';
import { ICategoryTreeViewModel } from '../../category-tree';
import { INoteViewModel } from '../../note';
import { ITagViewModel } from '../../tag.view-model.interface';
import { ICoscradContributorViewModel, ICoscradUserGroupViewModel } from '../../user-management';
import { ICoscradUserViewModel } from '../../user-management/coscrad-user';
import { IVideoViewModel } from '../audio-item';
import { IAudioItemViewModel } from '../audio-item/audio-item.view-model.interface';
import { IBibliographicCitationViewModel } from '../bibliographic-citation';
import { IDigitalTextViewModel } from '../digital-text/digital-text.view-model.interface';
import { IMediaItemViewModel } from '../media-items';
import { IPhotographViewModel } from '../photograph.view-model.interface';
import { IPlayListViewModel } from '../playlist';
import { ISongViewModel } from '../song.view-model.interface';
import { ISpatialFeatureViewModel } from '../spatial-feature';
import { ITermViewModel } from '../term.view-model.interface';
import { IVocabularyListViewModel } from '../vocabulary-list';

export type AggregateTypeToViewModel = {
    // Resources
    [AggregateType.bibliographicCitation]: IBibliographicCitationViewModel;
    [AggregateType.digitalText]: IDigitalTextViewModel;
    [AggregateType.mediaItem]: IMediaItemViewModel;
    [AggregateType.photograph]: IPhotographViewModel;
    [AggregateType.song]: ISongViewModel;
    [AggregateType.spatialFeature]: ISpatialFeatureViewModel;
    [AggregateType.term]: ITermViewModel;
    [AggregateType.audioItem]: IAudioItemViewModel;
    [AggregateType.video]: IVideoViewModel;
    [AggregateType.vocabularyList]: IVocabularyListViewModel;
    [AggregateType.playlist]: IPlayListViewModel;
    // Notes, which along with Resources form "Categorizables"
    [AggregateType.note]: INoteViewModel;
    // Non-categorizable (system) aggregates
    [AggregateType.tag]: ITagViewModel;
    [AggregateType.category]: ICategoryTreeViewModel;
    [AggregateType.user]: ICoscradUserViewModel;
    [AggregateType.userGroup]: ICoscradUserGroupViewModel;
    [AggregateType.contributor]: ICoscradContributorViewModel;
};

/**
 * We should be careful not to overzealously program to this union. Often,
 * programming to `IBaseViewModel` is cleaner.
 *
 * One benefit of defining this mapped type is that it will alert us statically if
 * we forget an entry in the `AggregateTypeToViewModel`, as will happen each
 * time we add a new aggregate type.
 */
export type AggregateViewModelUnion = AggregateTypeToViewModel[AggregateType];
