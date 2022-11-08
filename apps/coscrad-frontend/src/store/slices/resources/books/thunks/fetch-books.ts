import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { BOOK } from '../constants';
import { BookIndexState } from '../types';

export const fetchBooks = createFetchThunk<BookIndexState>(
    `${RESOURCES}/${BOOK}/fetch`,
    `${getApiResourcesBaseRoute()}/books`
);
