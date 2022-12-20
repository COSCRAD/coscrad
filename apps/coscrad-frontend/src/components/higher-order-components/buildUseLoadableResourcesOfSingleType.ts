import {
    CategorizableType,
    CategorizableTypeToViewModel,
    IBaseViewModel,
    ICategorizableIndexQueryResult,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { useLoadableNotesWithStandardFormat } from '../../store/slices/notes/hooks/use-loadable-notes-with-standard-format';
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
    ICategorizableIndexQueryResult<T>
>;

const lookupTable: {
    [K in CategorizableType]: UseLoadableResourcesOfSingleType<CategorizableTypeToViewModel[K]>;
} = {
    [CategorizableType.bibliographicReference]: useLoadableBibliographicReferences,
    [CategorizableType.book]: useLoadableBooks,
    [CategorizableType.mediaItem]: useLoadableMediaItems,
    [CategorizableType.photograph]: useLoadablePhotographs,
    [CategorizableType.song]: useLoadableSongs,
    [CategorizableType.spatialFeature]: useLoadableSpatialFeatures,
    [CategorizableType.term]: useLoadableTerms,
    [CategorizableType.transcribedAudio]: useLoadableTranscribedAudioItems,
    [CategorizableType.vocabularyList]: useLoadableVocabularyLists,
    [CategorizableType.note]: useLoadableNotesWithStandardFormat,
};

/**
 * we might want to actually build the `useXXXById` hook here so that no lookup
 * table is required and new resources 'JUST WORK'. We'd need a link from
 * resource type to the selector that fetches many. At the heart of the matter
 * is the link from the resource type to it's state slice, but selectors
 * are meant to enapsulate that, so the selector seems like the natural
 * starting point.
 */
export const buildUseLoadableForSingleCategorizableType = <T extends CategorizableType>(
    resourceType: T
): UseLoadableResourcesOfSingleType<CategorizableTypeToViewModel[T]> => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(
            `Failed to find a custom hook for searching by ID for resource type: ${resourceType}`
        );
    }

    return lookupResult;
};
