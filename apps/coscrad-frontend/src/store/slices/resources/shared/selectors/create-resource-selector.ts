import { IBaseViewModel, IIndexQueryResult, ResourceType } from '@coscrad/api-interfaces';
import { createSelector } from '@reduxjs/toolkit';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { selectLoadableBibliographicReferences } from '../../bibliographic-references/selectors';
import { selectLoadableBooks } from '../../books/selectors';
import { selectLoadableMediaItems } from '../../media-items/selectors';
import { selectLoadablePhotographs } from '../../photographs';
import { selectLoadableSongs } from '../../songs/selectors';
import { selectLoadableSpatialFeatures } from '../../spatial-features/selectors';
import { selectLoadableTerms } from '../../terms/selectors';
import { selectLoadableTranscribedAudioItems } from '../../transcribed-audio/selectors';
import { selectLoadableVocabularyLists } from '../../vocabulary-lists/selectors';

type AllResources = {
    [K in ResourceType]: ILoadable<IIndexQueryResult<IBaseViewModel>>;
};

const emptyLoadable: ILoadable<IBaseViewModel[]> = {
    isLoading: false,
    errorInfo: null,
    data: [],
};

export const createResourceSelector = () => {
    const compoundSelector = createSelector(
        [
            selectLoadableBibliographicReferences,
            selectLoadableBooks,
            selectLoadableMediaItems,
            selectLoadablePhotographs,
            selectLoadableSongs,
            selectLoadableSpatialFeatures,
            selectLoadableTerms,
            selectLoadableTranscribedAudioItems,
            selectLoadableVocabularyLists,
        ],
        (
            loadableBibliographicReferences,
            loadableBooks,
            loadableMediaItems,
            loadablePhotographs,
            loadableSongs,
            loadableSpatialFeatures,
            loadableTerms,
            loadableTranscribedAudioItems,
            loadableVocabularyLists
        ) =>
            ({
                [ResourceType.bibliographicReference]: loadableBibliographicReferences,
                [ResourceType.book]: loadableBooks,
                [ResourceType.mediaItem]: loadableMediaItems,
                [ResourceType.photograph]: loadablePhotographs,
                [ResourceType.song]: loadableSongs,
                [ResourceType.spatialFeature]: loadableSpatialFeatures,
                [ResourceType.term]: loadableTerms,
                [ResourceType.transcribedAudio]: loadableTranscribedAudioItems,
                [ResourceType.vocabularyList]: loadableVocabularyLists,
            } as AllResources)
    );

    return compoundSelector;
};
