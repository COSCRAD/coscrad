import { AggregateType } from '@coscrad/api-interfaces';
import { AppDispatch } from '../..';
import { fetchCategoryTree } from '../categories';
import { fetchNotes } from '../notes/thunks';
import {
    fetchAudioItems,
    fetchBibliographicReferences,
    fetchBooks,
    fetchDigitalTexts,
    fetchMediaItems,
    fetchPhotographs,
    fetchPlaylists,
    fetchSongs,
    fetchSpatialFeatures,
    fetchTerms,
    fetchVideos,
    fetchVocabularyLists,
} from '../resources';
import { fetchTags } from '../tagSlice';
/**
 * TODO Find a pattern that is closed to modification.
 */
export const fetchFreshState = (dispatch: AppDispatch, aggregateType: AggregateType): void => {
    switch (aggregateType) {
        case AggregateType.bibliographicReference:
            dispatch(fetchBibliographicReferences());
            break;

        case AggregateType.digitalText:
            dispatch(fetchDigitalTexts());
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
