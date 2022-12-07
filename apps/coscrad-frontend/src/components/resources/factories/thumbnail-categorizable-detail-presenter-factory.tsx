import { CategorizableType, IDetailQueryResult, INoteViewModel } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { NoteDetailPresenter } from '../../notes/note-detail.presenter';
import { BibliographicReferenceDetailThumbnailPresenter } from '../bibliographic-references/bibliographic-reference-detail-thumbnail-presenters';
import { BookDetailThumbnailPresenter } from '../books';
import { MediaItemDetailPresenter } from '../media-items/media-item-detail.presenter';
import { PhotographDetailThumbnailPresenter } from '../photographs/photograph-detail.thumbnail.presenter';
import { SongDetailThumbnailPresenter } from '../songs';
import { SpatialFeatureDetailThumbnailPresenter } from '../spatial-features/thumbnail-presenters';
import { TermDetailThumbnailPresenter } from '../terms/term-detail.thumbnail.presenter';
import { TranscribedAudioDetailThumbnailPresenter } from '../transcribed-audio/transcribed-audio-detail.thumbnail.presenter';
import { VocabularyListDetailThumbnailPresenter } from '../vocabulary-lists/vocabulary-list-detail.thumbnail.presenter';

// TODO Define thumbnail specific presenters
const lookupTable: { [K in CategorizableType]: FunctionalComponent } = {
    [CategorizableType.bibliographicReference]: BibliographicReferenceDetailThumbnailPresenter,
    [CategorizableType.book]: BookDetailThumbnailPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailPresenter,
    [CategorizableType.photograph]: PhotographDetailThumbnailPresenter,
    [CategorizableType.song]: SongDetailThumbnailPresenter,
    [CategorizableType.spatialFeature]: SpatialFeatureDetailThumbnailPresenter,
    [CategorizableType.term]: TermDetailThumbnailPresenter,
    [CategorizableType.transcribedAudio]: TranscribedAudioDetailThumbnailPresenter,
    [CategorizableType.vocabularyList]: VocabularyListDetailThumbnailPresenter,
    // TODO remove this hack
    [CategorizableType.note]: ({ data: note }: IDetailQueryResult<INoteViewModel>) =>
        NoteDetailPresenter(note),
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
