import {
    CategorizableType,
    IIndexQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { BibliographicReferenceIndexPresenter } from '../bibliographic-references/bibliographic-reference-index.presenter';
import { BookIndexPresenter } from '../books/book-index.presenter';
import { MediaItemIndexContainer } from '../media-items';
import { PhotographIndexPresenter } from '../photographs/photograph-index.presenter';
import { SongIndexPresenter } from '../songs/song-index.presenter';
import { CoscradLeafletMap } from '../spatial-features/leaflet';
import { SpatialFeatureIndexPresenter } from '../spatial-features/spatial-feature-index.presenter';
import { TermIndexPresenter } from '../terms/term-index.presenter';
import { TranscribedAudioIndexPresenter } from '../transcribed-audio/transcribed-audio-index.presenter';
import { VocabularyListIndexPresenter } from '../vocabulary-lists/vocabulary-list-index.presenter';
import {
    CategorizableIndexPresenterFactory,
    IndexPresenter,
} from './categorizable-index-presneter-factory.interface';
import { thumbnailCategorizableDetailPresenterFactory } from './thumbnail-categorizable-detail-presenter-factory';

/**
 * TODO Find a better way to inject the dependencies
 *
 * Note- this breaks! Fix me before merging in!
 */
const ConcreteSpatialFeaturePresenter = (
    result: IIndexQueryResult<ISpatialFeatureViewModel>
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
): IndexPresenter<T> => {
    switch (categorizableType) {
        case CategorizableType.bibliographicReference:
            return BibliographicReferenceIndexPresenter as IndexPresenter<T>;

        case CategorizableType.book:
            return BookIndexPresenter as IndexPresenter<T>;

        case CategorizableType.mediaItem:
            return MediaItemIndexContainer as IndexPresenter<T>;

        case CategorizableType.photograph:
            return PhotographIndexPresenter as IndexPresenter<T>;

        case CategorizableType.song:
            return SongIndexPresenter as IndexPresenter<T>;

        case CategorizableType.spatialFeature:
            // throw new Error('not implemented');
            return ConcreteSpatialFeaturePresenter as IndexPresenter<T>;

        case CategorizableType.term:
            return TermIndexPresenter as IndexPresenter<T>;

        case CategorizableType.transcribedAudio:
            return TranscribedAudioIndexPresenter as IndexPresenter<T>;

        case CategorizableType.vocabularyList:
            return VocabularyListIndexPresenter as IndexPresenter<T>;

        default:
            throw new Error(`Failed to build index presenter for: ${categorizableType}`);
    }
};
