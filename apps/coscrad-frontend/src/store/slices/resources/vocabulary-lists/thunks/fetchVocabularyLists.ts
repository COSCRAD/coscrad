import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { VOCABULARY_LIST } from '../constants';

export const fetchVocabularyLists = createFetchThunk<IIndexQueryResult<IVocabularyListViewModel>>(
    buildResourceFetchActionPrefix(VOCABULARY_LIST),
    `${getApiResourcesBaseRoute()}/vocabularyLists`
);
