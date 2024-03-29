import { ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { CATEGORY_TREE } from '../constants';

export const fetchCategoryTree = createFetchThunk<ICategoryTreeViewModel>(
    `${CATEGORY_TREE}/fetch`,
    `${getConfig().apiUrl}/treeOfKnowledge`
);
