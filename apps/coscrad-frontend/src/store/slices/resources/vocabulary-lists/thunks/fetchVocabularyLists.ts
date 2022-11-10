import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { VOCABULARY_LISTS } from '../constants';

export const fetchVocabularyLists = createFetchThunk<IIndexQueryResult<IVocabularyListViewModel>>(
    buildResourceFetchActionPrefix(VOCABULARY_LISTS),
    `${getApiResourcesBaseRoute()}/vocabularyLists`
);
