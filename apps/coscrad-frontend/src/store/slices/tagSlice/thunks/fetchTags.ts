import { ITagViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../../config';
import { createFetchThunk } from '../../utils/createFetchThunk';
import { TAGS } from '../constants';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We will need to update the generic here once we are ready to consume
 * the tags via the standard API.
 */
export const fetchTags = createFetchThunk<ITagViewModel[]>(
    `${TAGS}/fetch`,
    `${getConfig().apiUrl}/tags`
);
