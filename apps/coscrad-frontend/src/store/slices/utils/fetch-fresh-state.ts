import { AggregateType } from '@coscrad/api-interfaces';
import { AppDispatch } from '../..';
import { fetchCategoryTree } from '../categories';
import { fetchNotes } from '../notes/thunks';
import { fetchBibliographicReferences, fetchTerms } from '../resources';
import { fetchAudioItems } from '../resources/audio-item/thunks/fetch-audio-items';
import { fetchBooks } from '../resources/books/thunks';
import { fetchMediaItems } from '../resources/media-items/thunks';
import { fetchPhotographs } from '../resources/photographs/thunks';
import { fetchPlaylists } from '../resources/playlists/thunks';
import { fetchSongs } from '../resources/songs/thunks';
import { fetchSpatialFeatures } from '../resources/spatial-features/thunks';
import { fetchVideos } from '../resources/video/thunks';
import { fetchVocabularyLists } from '../resources/vocabulary-lists/thunks';
import { fetchTags } from '../tagSlice/thunks';

/**
 * TODO Find a pattern that is closed to modification.
 */
export const fetchFreshState = (dispatch: AppDispatch, aggregateType: AggregateType): void => {
    switch (aggregateType) {
        case AggregateType.bibliographicReference:
            dispatch(fetchBibliographicReferences());
            break;

        case AggregateType.book:
            dispatch(fetchBooks());
            break;

        case AggregateType.category:
            dispatch(fetchCategoryTree());
            break;

        case AggregateType.mediaItem:
            dispatch(fetchMediaItems());
            break;

        case AggregateType.note:
            dispatch(fetchNotes());
            break;

        case AggregateType.photograph:
            dispatch(fetchPhotographs());
            break;

        case AggregateType.song:
            dispatch(fetchSongs());
            break;

        case AggregateType.spatialFeature:
            dispatch(fetchSpatialFeatures());
            break;

        case AggregateType.tag:
            dispatch(fetchTags());
            break;

        case AggregateType.term:
            dispatch(fetchTerms());
            break;

        case AggregateType.audioItem:
            dispatch(fetchAudioItems());
            break;

        case AggregateType.vocabularyList:
            dispatch(fetchVocabularyLists());
            break;

        case AggregateType.video:
            dispatch(fetchVideos());
            break;

        case AggregateType.playlist:
            dispatch(fetchPlaylists());
            break;

        // TODO Support `User`, `UserGroup`

        default:
            throw new Error(
                `Failed to dispatch an update fetch for aggregate type: ${aggregateType}`
            );
    }
};
