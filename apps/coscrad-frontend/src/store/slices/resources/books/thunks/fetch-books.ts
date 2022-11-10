import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { BOOKS } from '../constants';
import { BookIndexState } from '../types';

export const fetchBooks = createFetchThunk<BookIndexState>(
    buildResourceFetchActionPrefix(BOOKS),
    `${getApiResourcesBaseRoute()}/books`
);
