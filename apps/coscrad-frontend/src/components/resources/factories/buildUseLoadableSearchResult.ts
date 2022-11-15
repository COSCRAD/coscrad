import { ResourceType } from '@coscrad/api-interfaces';
import { IMaybeLoadable } from '../../../store/slices/interfaces/maybe-loadable.interface';
import {
    useLoadableBibliographicReferenceById,
    useLoadableSongById,
    useLoadableSpatialFeatureById,
    useLoadableTermById,
} from '../../../store/slices/resources';
import { useLoadableBookById } from '../../../store/slices/resources/books';
import { useLoadableMediaItemById } from '../../../store/slices/resources/media-items';
import { useLoadablePhotographById } from '../../../store/slices/resources/photographs/hooks';
import { useLoadableTranscribedAudioItemById } from '../../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-item-by-id';
import { useLoadableVocabularyListById } from '../../../store/slices/resources/vocabulary-lists/hooks/useLoadableVocabularyListById';

type UseLoadableById = (id: string) => IMaybeLoadable<unknown>;

/**
 * TODO Force the ID param to be passed to the hook from above. It's the
 * resource detail container's responsibility to know what ID it is a container
 * for.
 */
const lookupTable: { [K in ResourceType]: UseLoadableById } = {
    [ResourceType.bibliographicReference]: useLoadableBibliographicReferenceById,
    [ResourceType.book]: useLoadableBookById,
    [ResourceType.mediaItem]: useLoadableMediaItemById,
    [ResourceType.photograph]: useLoadablePhotographById,
    [ResourceType.song]: useLoadableSongById,
    [ResourceType.spatialFeature]: useLoadableSpatialFeatureById,
    [ResourceType.term]: useLoadableTermById,
    [ResourceType.transcribedAudio]: useLoadableTranscribedAudioItemById,
    [ResourceType.vocabularyList]: useLoadableVocabularyListById,
};

export const buildUseLoadableSearchResult = (resourceType: ResourceType): UseLoadableById => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(
            `Failed to find a custom hook for searching by ID for resource type: ${resourceType}`
        );
    }

    return lookupResult;
};
