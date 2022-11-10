import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { PHOTOGRAPHS } from '../constants';

export const fetchPhotographs = createFetchThunk<IIndexQueryResult<IPhotographViewModel>>(
    buildResourceFetchActionPrefix(PHOTOGRAPHS),
    `${getApiResourcesBaseRoute()}/photographs`
);
