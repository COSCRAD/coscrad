import { ResourceType } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { BibliographicReferenceDetailPresenter } from '../bibliographic-references/bibliographic-reference-detail.presenter';
import { BookDetailFullViewPresenter } from '../books';
import { MediaItemDetailPresenter } from '../media-items/media-item-detail.presenter';
import { PhotographDetailFullViewPresenter } from '../photographs/photograph-detail.full-view.presenter';
import { SongDetailPresenter } from '../songs/song-detail.presenter';
import { SpatialFeatureDetailPresenter } from '../spatial-features/spatial-feature-detail.presenter';
import { TermDetailFullViewPresenter } from '../terms/term-detail.full-view.presenter';
import { TranscribedAudioDetailFullViewPresenter } from '../transcribed-audio/transcribed-audio-detail.full-view.presenter';
import { VocabularyListDetailFullViewPresenter } from '../vocabulary-lists/vocabulary-list-detail.full-view.presenter';
import { withCommands } from './with-commands';

/**
 * TODO We could have a mapped type if we need type safety here.
 */
const lookupTable: { [K in ResourceType]: FunctionalComponent } = {
    [ResourceType.bibliographicReference]: BibliographicReferenceDetailPresenter,
    [ResourceType.book]: BookDetailFullViewPresenter,
    [ResourceType.mediaItem]: MediaItemDetailPresenter,
    [ResourceType.photograph]: PhotographDetailFullViewPresenter,
    [ResourceType.song]: SongDetailPresenter,
    [ResourceType.spatialFeature]: SpatialFeatureDetailPresenter,
    [ResourceType.term]: TermDetailFullViewPresenter,
    [ResourceType.transcribedAudio]: TranscribedAudioDetailFullViewPresenter,
    [ResourceType.vocabularyList]: VocabularyListDetailFullViewPresenter,
};

/**
 * This concrete Resource Detail Presenter Factory provides a full-view of
 * a single resource for each resource type. It is used for the standard detail
 * view in the big index-to-detail flow.
 */
export const fullViewResourcePresenterFactory = <T extends ResourceType>(
    resourceType: T
): typeof lookupTable[T] => {
    const DetailPresenter = lookupTable[resourceType];

    if (!DetailPresenter) {
        throw new Error(
            `Failed to build a full format detail view for resource type: ${resourceType}`
        );
    }

    return withCommands(DetailPresenter);
};
