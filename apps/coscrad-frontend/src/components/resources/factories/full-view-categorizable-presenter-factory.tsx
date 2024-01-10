import {
    CategorizableType
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { NoteDetailFullViewPresenter } from '../../notes/note-detail.full-view.presenter';
import { AudioItemDetailFullViewPresenter } from '../audio-item/audio-item-detail.full-view.presenter';
import { BibliographicCitationDetailPresenter } from '../bibliographic-citations/bibliographic-citation-detail.presenter';
import { DigitalTextDetailFullViewPresenter } from '../digital-text/digital-text-detail.full-view.presenter';
import { MediaItemDetailFullViewPresenter } from '../media-items/media-item-detail.full-view.presenter';
import { PhotographDetailFullViewPresenter } from '../photographs/photograph-detail.full-view.presenter';
import { PlaylistDetailFullViewPresenter } from '../playlists/playlist-detail.full-view.presenter';
import { SongDetailFullViewPresenter } from '../songs/song-detail.full-view.presenter';
import { SpatialFeatureDetailFullViewPresenter } from '../spatial-features/spatial-feature-detail.full-view.presenter';
import { TermDetailFullViewPresenter } from '../terms/term-detail.full-view.presenter';
import { VideoDetailFullViewPresenter } from '../videos/video-detail.full-view.presenter';
import { VocabularyListDetailFullViewPresenter } from '../vocabulary-lists/vocabulary-list-detail.full-view.presenter';

/**
 * TODO We could have a mapped type if we need type safety here.
 */
const lookupTable: { [K in CategorizableType]: FunctionalComponent } = {
    [CategorizableType.bibliographicCitation]: BibliographicCitationDetailPresenter,
    [CategorizableType.digitalText]: DigitalTextDetailFullViewPresenter,
    [CategorizableType.mediaItem]: MediaItemDetailFullViewPresenter,
    [CategorizableType.photograph]: PhotographDetailFullViewPresenter,
    [CategorizableType.song]: SongDetailFullViewPresenter,
    [CategorizableType.spatialFeature]: SpatialFeatureDetailFullViewPresenter,
    [CategorizableType.term]: TermDetailFullViewPresenter,
    [CategorizableType.audioItem]: AudioItemDetailFullViewPresenter,
    [CategorizableType.video]: VideoDetailFullViewPresenter,
    [CategorizableType.vocabularyList]: VocabularyListDetailFullViewPresenter,
    [CategorizableType.playlist]: PlaylistDetailFullViewPresenter,
    [CategorizableType.note]: NoteDetailFullViewPresenter,
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
