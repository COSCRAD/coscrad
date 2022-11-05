import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { VOCABULARY_LIST } from '../constants';

export const fetchVocabularyLists = createFetchThunk<IIndexQueryResult<IVocabularyListViewModel>>(
    `${RESOURCES}/${VOCABULARY_LIST}/fetch`,
    `${getApiResourcesBaseRoute()}/vocabularyLists`
);
