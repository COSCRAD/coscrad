import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { BOOKS } from '../constants';
import { BookIndexState } from '../types';

export const fetchBooks = createFetchThunk<BookIndexState>(
    buildResourceFetchActionPrefix(BOOKS),
    `${getApiResourcesBaseRoute()}/books`
);
