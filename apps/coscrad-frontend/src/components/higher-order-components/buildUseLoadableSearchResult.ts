import { CategorizableType } from '@coscrad/api-interfaces';
import { IMaybeLoadable } from '../../store/slices/interfaces/maybe-loadable.interface';
import { useLoadableNoteById } from '../../store/slices/notes/hooks';
import {
    useLoadableBibliographicReferenceById,
    useLoadableSongById,
    useLoadableSpatialFeatureById,
    useLoadableTermById,
} from '../../store/slices/resources';
import { useLoadableBookById } from '../../store/slices/resources/books';
import { useLoadableMediaItemById } from '../../store/slices/resources/media-items';
import { useLoadablePhotographById } from '../../store/slices/resources/photographs/hooks';
import { useLoadableTranscribedAudioItemById } from '../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-item-by-id';
import { useLoadableVocabularyListById } from '../../store/slices/resources/vocabulary-lists/hooks/useLoadableVocabularyListById';

type UseLoadableById = (id: string) => IMaybeLoadable<unknown>;

/**
 * TODO Force the ID param to be passed to the hook from above. It's the
 * resource detail container's responsibility to know what ID it is a container
 * for.
 */
const lookupTable: { [K in CategorizableType]: UseLoadableById } = {
    [CategorizableType.bibliographicReference]: useLoadableBibliographicReferenceById,
    [CategorizableType.book]: useLoadableBookById,
    [CategorizableType.mediaItem]: useLoadableMediaItemById,
    [CategorizableType.photograph]: useLoadablePhotographById,
    [CategorizableType.song]: useLoadableSongById,
    [CategorizableType.spatialFeature]: useLoadableSpatialFeatureById,
    [CategorizableType.term]: useLoadableTermById,
    [CategorizableType.transcribedAudio]: useLoadableTranscribedAudioItemById,
    [CategorizableType.vocabularyList]: useLoadableVocabularyListById,
    [CategorizableType.note]: useLoadableNoteById,
};

/**
 * We might want to bring the search logic here, and out of `SelectedResourcesContainer`
 */
export const buildUseLoadableSearchResult = (
    categorizableType: CategorizableType
): UseLoadableById => {
    const lookupResult = lookupTable[categorizableType];

    if (!lookupResult) {
        throw new Error(
            `Failed to find a custom hook for searching by ID for categorizable of type: ${categorizableType}`
        );
    }

    return lookupResult;
};
