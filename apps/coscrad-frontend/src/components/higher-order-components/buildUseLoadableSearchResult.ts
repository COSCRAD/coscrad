import { AggregateType } from '@coscrad/api-interfaces';
import { useLoadableCategoryTree } from '../../store/slices/categories/hooks/use-loadable-category-tree';
import { IMaybeLoadable } from '../../store/slices/interfaces/maybe-loadable.interface';
import { useLoadableNoteById } from '../../store/slices/notes/hooks';
import {
    useLoadableBibliographicReferenceById,
    useLoadableSongById,
    useLoadableSpatialFeatureById,
    useLoadableTermById,
} from '../../store/slices/resources';
import { useLoadableAudioItemById } from '../../store/slices/resources/audio-item/hooks/use-loadable-audio-item-by-id';
import { useLoadableBookById } from '../../store/slices/resources/books';
import { useLoadableMediaItemById } from '../../store/slices/resources/media-items';
import { useLoadablePhotographById } from '../../store/slices/resources/photographs/hooks';
import { useLoadablePlaylistsById } from '../../store/slices/resources/playlists/hooks/use-Loadable-Playlist-By-Id';
import { useLoadableVideoById } from '../../store/slices/resources/video/hooks';
import { useLoadableVocabularyListById } from '../../store/slices/resources/vocabulary-lists/hooks/useLoadableVocabularyListById';
import { useLoadableTagById } from '../../store/slices/tagSlice/hooks/use-loadable-tag-by-id';

type UseLoadableById = (id: string) => IMaybeLoadable<unknown>;

/**
 * TODO Force the ID param to be passed to the hook from above. It's the
 * resource detail container's responsibility to know what ID it is a container
 * for.
 *
 * TODO Support users and user groups here when adding corresponding slices to Redux.
 */
const lookupTable: { [K in Exclude<AggregateType, 'user' | 'userGroup'>]: UseLoadableById } = {
    // Resources
    [AggregateType.bibliographicReference]: useLoadableBibliographicReferenceById,
    [AggregateType.book]: useLoadableBookById,
    [AggregateType.mediaItem]: useLoadableMediaItemById,
    [AggregateType.photograph]: useLoadablePhotographById,
    [AggregateType.song]: useLoadableSongById,
    [AggregateType.spatialFeature]: useLoadableSpatialFeatureById,
    [AggregateType.term]: useLoadableTermById,
    [AggregateType.audioItem]: useLoadableAudioItemById,
    [AggregateType.video]: useLoadableVideoById,
    [AggregateType.vocabularyList]: useLoadableVocabularyListById,
    [AggregateType.playlist]: useLoadablePlaylistsById,
    // Notes (Edge Connections)
    [AggregateType.note]: useLoadableNoteById,
    // System Aggregates
    [AggregateType.category]: useLoadableCategoryTree,
    [AggregateType.tag]: useLoadableTagById,
};

/**
 * We might want to bring the search logic here, and out of `SelectedResourcesContainer`
 */
export const buildUseLoadableSearchResult = (aggregateType: AggregateType): UseLoadableById => {
    const lookupResult = lookupTable[aggregateType];

    if (!lookupResult) {
        throw new Error(
            `Failed to find a custom hook for searching by ID for aggregate of type: ${aggregateType}`
        );
    }

    return lookupResult;
};
