import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { TAGS } from '../constants';
import { TagIndexState } from '../types/tag-index-state';

export const fetchTags = createFetchThunk<TagIndexState>(
    `${TAGS}/fetch`,
    `${getConfig().apiUrl}/tags`
);
