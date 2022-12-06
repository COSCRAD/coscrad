import { CategorizableType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { NoteDetailPresenter } from '../../notes/note-detail.presenter';
import { BibliographicReferenceDetailPresenter } from '../bibliographic-references/bibliographic-reference-detail.presenter';
import { BookDetailFullViewPresenter } from '../books';
import { MediaItemDetailPresenter } from '../media-items/media-item-detail.presenter';
import { PhotographDetailFullViewPresenter } from '../photographs/photograph-detail.full-view.presenter';
import { SongDetailFullViewPresenter } from '../songs/song-detail.full-view.presenter';
import { SpatialFeatureDetailPresenter } from '../spatial-features/spatial-feature-detail.presenter';
import { TermDetailFullViewPresenter } from '../terms/term-detail.full-view.presenter';
import { TranscribedAudioDetailFullViewPresenter } from '../transcribed-audio/transcribed-audio-detail.full-view.presenter';
import { VocabularyListDetailFullViewPresenter } from '../vocabulary-lists/vocabulary-list-detail.full-view.presenter';

/**
 * TODO We could have a mapped type if we need type safety here.
 */
const lookupTable: { [K in CategorizableType]: FunctionalComponent } = {
    [CategorizableType.bibliographicReference]: BibliographicReferenceDetailPresenter,
    [CategorizableType.book]: BookDetailFullViewPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailPresenter,
    [CategorizableType.photograph]: PhotographDetailFullViewPresenter,
    [CategorizableType.song]: SongDetailFullViewPresenter,
    [CategorizableType.spatialFeature]: SpatialFeatureDetailPresenter,
    [CategorizableType.term]: TermDetailFullViewPresenter,
    [CategorizableType.transcribedAudio]: TranscribedAudioDetailFullViewPresenter,
    [CategorizableType.vocabularyList]: VocabularyListDetailFullViewPresenter,
    [CategorizableType.note]: NoteDetailPresenter,
};

/**
 * This concrete Resource Detail Presenter Factory provides a full-view of
 * a single resource for each resource type. It is used for the standard detail
 * view in the big index-to-detail flow.
 */
export const fullViewCategorizablePresenterFactory = <T extends CategorizableType>(
    typeOfCategorizable: T
): typeof lookupTable[T] => {
    const DetailPresenter = lookupTable[typeOfCategorizable];

    if (!DetailPresenter) {
        throw new Error(
            `Failed to build a full format detail view for resource type: ${typeOfCategorizable}`
        );
    }

    return DetailPresenter;
};
