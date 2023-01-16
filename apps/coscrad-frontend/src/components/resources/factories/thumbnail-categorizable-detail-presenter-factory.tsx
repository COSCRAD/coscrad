import { CategorizableType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { NoteDetailThumbnailPresenter } from '../../notes/note-detail.thumbnail.presenter';
import { BibliographicReferenceDetailThumbnailPresenter } from '../bibliographic-references/bibliographic-reference-detail-thumbnail-presenters';
import { BookDetailThumbnailPresenter } from '../books';
import { MediaItemDetailThumbnailPresenter } from '../media-items/media-item-detail.thumbnail.presenter';
import { PhotographDetailThumbnailPresenter } from '../photographs/photograph-detail.thumbnail.presenter';
import { SongDetailThumbnailPresenter } from '../songs';
import { SpatialFeatureDetailThumbnailPresenter } from '../spatial-features/thumbnail-presenters';
import { TermDetailThumbnailPresenter } from '../terms/term-detail.thumbnail.presenter';
import { TranscribedAudioDetailThumbnailPresenter } from '../transcribed-audio/transcribed-audio-detail.thumbnail.presenter';
import { VocabularyListDetailThumbnailPresenter } from '../vocabulary-lists/vocabulary-list-detail.thumbnail.presenter';

// TODO Define thumbnail specific presenters
const lookupTable: { [K in CategorizableType]: FunctionalComponent } = {
    [CategorizableType.bibliographicReference]: BibliographicReferenceDetailThumbnailPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailThumbnailPresenter,
    [CategorizableType.book]: BookDetailThumbnailPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailThumbnailPresenter,
    [CategorizableType.photograph]: PhotographDetailThumbnailPresenter,
    [CategorizableType.song]: SongDetailThumbnailPresenter,
    [CategorizableType.spatialFeature]: SpatialFeatureDetailThumbnailPresenter,
    [CategorizableType.term]: TermDetailThumbnailPresenter,
    [CategorizableType.transcribedAudio]: TranscribedAudioDetailThumbnailPresenter,
    [CategorizableType.vocabularyList]: VocabularyListDetailThumbnailPresenter,
    /**
     * TODO Investigate why importing this from the component file leads to a
     * circular dependency.
     */
    [CategorizableType.book]: BookDetailThumbnailPresenter,
    [CategorizableType.note]: NoteDetailThumbnailPresenter,
};

/**
 * This concrete Resource Detail Presenter Factory provides a thumbnail view of
 * a single resource for each resource type. It is used for the connected
 * resources flow.
 */
export const thumbnailCategorizableDetailPresenterFactory = <T extends CategorizableType>(
    typeOfCategorizable: T
): typeof lookupTable[T] => {
    const lookupResult = lookupTable[typeOfCategorizable];

    if (!lookupResult) {
        throw new Error(
            `Failed to build a full format detail view for resource type: ${typeOfCategorizable}`
        );
    }

    return lookupResult;
};
