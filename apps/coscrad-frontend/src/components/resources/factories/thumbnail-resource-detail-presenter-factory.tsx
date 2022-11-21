import { ResourceType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { BibliographicReferenceDetailPresenter } from '../bibliographic-references/bibliographic-reference-detail.presenter';
import { BookDetailPresenter } from '../books/book-detail.presenter';
import { MediaItemDetailPresenter } from '../media-items/media-item-detail.presenter';
import { PhotographDetailThumbnailPresenter } from '../photographs/photograph-detail.thumbnail.presenter';
import { SongDetailPresenter } from '../songs/song-detail.presenter';
import { SpatialFeatureDetailPresenter } from '../spatial-features/spatial-feature-detail.presenter';
import { TermDetailPresenter } from '../terms/term-detail.presenter';
import { TranscribedAudioDetailPresenter } from '../transcribed-audio/transcribed-audio-detail.presenter';
import { VocabularyListDetailPresenter } from '../vocabulary-lists/vocabulary-list-detail.presenter';

// TODO Define thumbnail specific presenters
const lookupTable: { [K in ResourceType]: FunctionalComponent } = {
    [ResourceType.bibliographicReference]: BibliographicReferenceDetailPresenter,
    [ResourceType.book]: BookDetailPresenter,
    [ResourceType.mediaItem]: MediaItemDetailPresenter,
    [ResourceType.photograph]: PhotographDetailThumbnailPresenter,
    [ResourceType.song]: SongDetailPresenter,
    [ResourceType.spatialFeature]: SpatialFeatureDetailPresenter,
    [ResourceType.term]: TermDetailPresenter,
    [ResourceType.transcribedAudio]: TranscribedAudioDetailPresenter,
    [ResourceType.vocabularyList]: VocabularyListDetailPresenter,
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
