import { CategorizableType } from '../../categorizable-type.enum';
import { INoteViewModel } from '../../note';
import { IBibliographicReferenceViewModel } from '../bibliographic-reference';
import { IBookViewModel } from '../book';
import { IMediaItemViewModel } from '../media-items';
import { IPhotographViewModel } from '../photograph.view-model.interface';
import { ISongViewModel } from '../song.view-model.interface';
import { ISpatialFeatureViewModel } from '../spatial-feature';
import { ITermViewModel } from '../term.view-model.interface';
import { ITranscribedAudioViewModel } from '../transcribed-audio.view-model.interface';
import { IVocabularyListViewModel } from '../vocabulary-list';

/**
 * Can we avoid this? It seems to make our system a little less extensible to
 * adding new resource types.
 */
export type CategorizableTypeToViewModel = {
    [CategorizableType.bibliographicReference]: IBibliographicReferenceViewModel;
    [CategorizableType.book]: IBookViewModel;
    [CategorizableType.mediaItem]: IMediaItemViewModel;
    [CategorizableType.photograph]: IPhotographViewModel;
    [CategorizableType.song]: ISongViewModel;
    [CategorizableType.spatialFeature]: ISpatialFeatureViewModel;
    [CategorizableType.term]: ITermViewModel;
    [CategorizableType.transcribedAudio]: ITranscribedAudioViewModel;
    [CategorizableType.vocabularyList]: IVocabularyListViewModel;
    [CategorizableType.note]: INoteViewModel;
};
