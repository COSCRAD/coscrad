import {
    CategorizableType,
    ICategorizableIndexQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { NoteIndexPresenter } from '../../notes/note-index.presenter';
import { TranscribedAudioIndexPresenter } from '../audio-item/audio-item-index.presenter';
import { BibliographicReferenceIndexPresenter } from '../bibliographic-references/bibliographic-reference-index.presenter';
import { BookIndexPresenter } from '../books/book-index.presenter';
import { MediaItemIndexPresenter } from '../media-items/media-item-index.presenter';
import { PhotographIndexPresenter } from '../photographs/photograph-index.presenter';
import { PlaylistIndexPresenter } from '../playlists/playlist-index.presenter';
import { SongIndexPresenter } from '../songs/song-index.presenter';
import { CoscradLeafletMap } from '../spatial-features/leaflet';
import { SpatialFeatureIndexPresenter } from '../spatial-features/spatial-feature-index.presenter';
import { TermIndexPresenter } from '../terms/term-index.presenter';
import { VideoIndexPresenter } from '../videos';
import { VocabularyListIndexPresenter } from '../vocabulary-lists/vocabulary-list-index.presenter';
import {
    CategorizableIndexPresenter,
    CategorizableIndexPresenterFactory,
} from './categorizable-index-presenter-factory.interface';
import { thumbnailCategorizableDetailPresenterFactory } from './thumbnail-categorizable-detail-presenter-factory';

/**
 * TODO Find a better way to inject the dependencies
 */
const ConcreteSpatialFeaturePresenter = (
    result: ICategorizableIndexQueryResult<ISpatialFeatureViewModel>
): JSX.Element => (
    <SpatialFeatureIndexPresenter
        MapComponent={CoscradLeafletMap}
        // @ts-expect-error fix this when we refactor the presenters
        DetailPresenter={thumbnailCategorizableDetailPresenterFactory(
            CategorizableType.spatialFeature
        )}
        {...result}
    />
);

export const tableViewCategorizableIndexPresenterFactory: CategorizableIndexPresenterFactory = <
    T extends CategorizableType
>(
    categorizableType: T
): CategorizableIndexPresenter<T> => {
    /**
     * We decided to use a switch here after experiencing issues with circular
     * dependencies using a lookup table approach.
     *
     * We may want to isolate switching on the `categorizableType` to a single point
     * of entry in the front-end. Perhaps there should be a single `PresenterFactory`
     * that has methods to build index and detail views of various types.
     */
    switch (categorizableType) {
        case CategorizableType.bibliographicReference:
            return BibliographicReferenceIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.book:
            return BookIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.mediaItem:
            return MediaItemIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.photograph:
            return PhotographIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.song:
            return SongIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.spatialFeature:
            return ConcreteSpatialFeaturePresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.term:
            return TermIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.audioItem:
            return TranscribedAudioIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.video:
            return VideoIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.vocabularyList:
            return VocabularyListIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.playlist:
            return PlaylistIndexPresenter as unknown as CategorizableIndexPresenter<T>;
        // throw new Error(`We do not yet support playlist index views.`);

        case CategorizableType.note:
            return NoteIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        default:
            throw new Error(`Failed to build index presenter for: ${categorizableType}`);
    }
};
