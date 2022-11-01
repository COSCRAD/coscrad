import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { PHOTOGRAPHS } from '../constants';

export const fetchPhotographs = createFetchThunk<IIndexQueryResult<IPhotographViewModel>>(
    `${RESOURCES}/${PHOTOGRAPHS}}/fetch`,
    `${getApiResourcesBaseRoute()}/photographs`
);
