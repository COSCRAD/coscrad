import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { VOCABULARY_LISTS } from '../constants';
import { VocabularyListIndexState } from '../types/vocabulary-list-index-state';

export const fetchVocabularyLists = createFetchThunk<VocabularyListIndexState>(
    buildResourceFetchActionPrefix(VOCABULARY_LISTS),
    `${getApiResourcesBaseRoute()}/vocabularyLists`
);
