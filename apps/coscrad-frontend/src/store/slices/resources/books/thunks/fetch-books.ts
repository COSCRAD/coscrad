import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { BOOK } from '../constants';
import { BookIndexState } from '../types';

export const fetchBooks = createFetchThunk<BookIndexState>(
    buildResourceFetchActionPrefix(BOOK),
    `${getApiResourcesBaseRoute()}/books`
);
