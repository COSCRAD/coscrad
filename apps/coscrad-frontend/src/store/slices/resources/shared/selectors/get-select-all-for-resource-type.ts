import { IBaseViewModel, IIndexQueryResult, ResourceType } from '@coscrad/api-interfaces';
import { RootState } from '../../../..';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { selectLoadableBooks } from '../../books/selectors';
import { selectLoadablePhotographs } from '../../photographs';
import { selectLoadableSongs } from '../../songs/selectors';
import { selectLoadableSpatialFeatures } from '../../spatial-features/selectors';
import { selectLoadableTerms } from '../../terms/selectors';
import { selectLoadableTranscribedAudioItems } from '../../transcribed-audio/selectors';
import { selectLoadableVocabularyLists } from '../../vocabulary-lists/selectors';

const loookupTable: Record<
    ResourceType,
    (state: RootState) => ILoadable<IIndexQueryResult<IBaseViewModel>>
> = {
    [ResourceType.bibliographicReference]: selectLoadableBooks,
    [ResourceType.book]: selectLoadableBooks,
    [ResourceType.mediaItem]: selectLoadableBooks,
    [ResourceType.photograph]: selectLoadablePhotographs,
    [ResourceType.song]: selectLoadableSongs,
    [ResourceType.spatialFeature]: selectLoadableSpatialFeatures,
    [ResourceType.term]: selectLoadableTerms,
    [ResourceType.transcribedAudio]: selectLoadableTranscribedAudioItems,
    [ResourceType.vocabularyList]: selectLoadableVocabularyLists,
};

export const getSelectAllByResourceType = (resourceType: ResourceType) => {
    const lookupResult = loookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(
            `No selector is registered to select many of resource type: ${resourceType}`
        );
    }

    return lookupResult;
};
