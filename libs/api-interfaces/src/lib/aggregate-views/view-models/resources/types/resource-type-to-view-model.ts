import { IBibliographicReferenceViewModel } from '../bibliographic-reference';
import { IBookViewModel } from '../book';
import { IMediaItemViewModel } from '../media-items';
import { IPhotographViewModel } from '../photograph.view-model.interface';
import { ResourceType } from '../resource-type.enum';
import { ISongViewModel } from '../song.view-model.interface';
import { ISpatialFeatureViewModel } from '../spatial-feature';
import { ITermViewModel } from '../term.view-model.interface';
import { ITranscribedAudioViewModel } from '../transcribed-audio.view-model.interface';
import { IVocabularyListViewModel } from '../vocabulary-list';

/**
 * Can we avoid this? It seems to make our system a little less extensible to
 * adding new resource types.
 */
export type ResourceTypeToViewModel = {
    [ResourceType.bibliographicReference]: IBibliographicReferenceViewModel;
    [ResourceType.book]: IBookViewModel;
    [ResourceType.mediaItem]: IMediaItemViewModel;
    [ResourceType.photograph]: IPhotographViewModel;
    [ResourceType.song]: ISongViewModel;
    [ResourceType.spatialFeature]: ISpatialFeatureViewModel;
    [ResourceType.term]: ITermViewModel;
    [ResourceType.transcribedAudio]: ITranscribedAudioViewModel;
    [ResourceType.vocabularyList]: IVocabularyListViewModel;
};
