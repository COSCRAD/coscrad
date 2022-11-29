import { ResourceType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { BibliographicReferenceDetailThumbnailPresenter } from '../bibliographic-references/bibliographic-reference-detail-thumbnail-presenters';
import { BookDetailThumbnailPresenter } from '../books';
import { MediaItemDetailPresenter } from '../media-items/media-item-detail.presenter';
import { PhotographDetailThumbnailPresenter } from '../photographs/photograph-detail.thumbnail.presenter';
import { SongDetailPresenter } from '../songs/song-detail.presenter';
import { SpatialFeatureDetailThumbnailPresenter } from '../spatial-features/thumbnail-presenters';
import { TermDetailThumbnailPresenter } from '../terms/term-detail.thumbnail.presenter';
import { TranscribedAudioDetailThumbnailPresenter } from '../transcribed-audio/transcribed-audio-detail.thumbnail.presenter';
import { VocabularyListDetailThumbnailPresenter } from '../vocabulary-lists/vocabulary-list-detail.thumbnail.presenter';

// TODO Define thumbnail specific presenters
const lookupTable: { [K in ResourceType]: FunctionalComponent } = {
    [ResourceType.bibliographicReference]: BibliographicReferenceDetailThumbnailPresenter,
    [ResourceType.book]: BookDetailThumbnailPresenter,
    [ResourceType.mediaItem]: MediaItemDetailPresenter,
    [ResourceType.photograph]: PhotographDetailThumbnailPresenter,
    [ResourceType.song]: SongDetailPresenter,
    [ResourceType.spatialFeature]: SpatialFeatureDetailThumbnailPresenter,
    [ResourceType.term]: TermDetailThumbnailPresenter,
    [ResourceType.transcribedAudio]: TranscribedAudioDetailThumbnailPresenter,
    [ResourceType.vocabularyList]: VocabularyListDetailThumbnailPresenter,
};

/**
 * This concrete Resource Detail Presenter Factory provides a thumbnail view of
 * a single resource for each resource type. It is used for the connected
 * resources flow.
 */
export const thumbnailResourceDetailPresenterFactory = <T extends ResourceType>(
    resourceType: T
): typeof lookupTable[T] => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(
            `Failed to build a full format detail view for resource type: ${resourceType}`
        );
    }

    return lookupResult;
};
