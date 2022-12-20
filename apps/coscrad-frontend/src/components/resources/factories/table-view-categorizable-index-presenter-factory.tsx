import {
    CategorizableType,
    ICategorizableIndexQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { BibliographicReferenceIndexPresenter } from '../bibliographic-references/bibliographic-reference-index.presenter';
import { BookIndexPresenter } from '../books/book-index.presenter';
import { MediaItemIndexPresenter } from '../media-items/media-item-index.presenter';
import { PhotographIndexPresenter } from '../photographs/photograph-index.presenter';
import { SongIndexPresenter } from '../songs/song-index.presenter';
import { CoscradLeafletMap } from '../spatial-features/leaflet';
import { SpatialFeatureIndexPresenter } from '../spatial-features/spatial-feature-index.presenter';
import { TermIndexPresenter } from '../terms/term-index.presenter';
import { TranscribedAudioIndexPresenter } from '../transcribed-audio/transcribed-audio-index.presenter';
import { VocabularyListIndexPresenter } from '../vocabulary-lists/vocabulary-list-index.presenter';
import {
    CategorizableIndexPresenter,
    CategorizableIndexPresenterFactory,
} from './categorizable-index-presneter-factory.interface';
import { thumbnailCategorizableDetailPresenterFactory } from './thumbnail-categorizable-detail-presenter-factory';

/**
 * TODO Find a better way to inject the dependencies
 */
const ConcreteSpatialFeaturePresenter = (
    result: ICategorizableIndexQueryResult<ISpatialFeatureViewModel>
): JSX.Element => (
    <SpatialFeatureIndexPresenter
        MapComponent={CoscradLeafletMap}
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

        case CategorizableType.transcribedAudio:
            return TranscribedAudioIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        case CategorizableType.vocabularyList:
            return VocabularyListIndexPresenter as unknown as CategorizableIndexPresenter<T>;

        default:
            throw new Error(`Failed to build index presenter for: ${categorizableType}`);
    }
};
