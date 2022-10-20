import { ITag } from '@coscrad/api-interfaces';
import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/createFetchThunk';
import { TAGS } from '../constants';

export const fetchTags = createFetchThunk<ITag[]>(`${TAGS}/fetch`, `${getConfig().apiUrl}/tags`);
