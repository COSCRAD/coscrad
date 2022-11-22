import {
    IBaseViewModel,
    IIndexQueryResult,
    ResourceType,
    ResourceTypeToViewModel,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import {
    useLoadableBibliographicReferences,
    useLoadableSongs,
    useLoadableSpatialFeatures,
    useLoadableTerms,
} from '../../store/slices/resources';
import { useLoadableBooks } from '../../store/slices/resources/books';
import { useLoadableMediaItems } from '../../store/slices/resources/media-items';
import { useLoadablePhotographs } from '../../store/slices/resources/photographs/hooks';
import { useLoadableTranscribedAudioItems } from '../../store/slices/resources/transcribed-audio/hooks/use-loadable-transcribed-audio-items';
import { useLoadableVocabularyLists } from '../../store/slices/resources/vocabulary-lists/hooks';

type UseLoadableResourcesOfSingleType<T extends IBaseViewModel> = () => ILoadable<
    IIndexQueryResult<T>
>;

const lookupTable: {
    [K in ResourceType]: UseLoadableResourcesOfSingleType<ResourceTypeToViewModel[K]>;
} = {
    [ResourceType.bibliographicReference]: useLoadableBibliographicReferences,
    [ResourceType.book]: useLoadableBooks,
    [ResourceType.mediaItem]: useLoadableMediaItems,
    [ResourceType.photograph]: useLoadablePhotographs,
    [ResourceType.song]: useLoadableSongs,
    [ResourceType.spatialFeature]: useLoadableSpatialFeatures,
    [ResourceType.term]: useLoadableTerms,
    [ResourceType.transcribedAudio]: useLoadableTranscribedAudioItems,
    [ResourceType.vocabularyList]: useLoadableVocabularyLists,
};

/**
 * we might want to actually build the `useXXXById` hook here so that no lookup
 * table is required and new resources 'JUST WORK'. We'd need a link from
 * resource type to the selector that fetches many. At the heart of the matter
 * is the link from the resource type to it's state slice, but selectors
 * are meant to enapsulate that, so the selector seems like the natural
 * starting point.
 */
export const buildUseLoadableForSingleResourceType = <T extends ResourceType>(
    resourceType: T
): UseLoadableResourcesOfSingleType<ResourceTypeToViewModel[T]> => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(
            `Failed to find a custom hook for searching by ID for resource type: ${resourceType}`
        );
    }

    return lookupResult;
};
