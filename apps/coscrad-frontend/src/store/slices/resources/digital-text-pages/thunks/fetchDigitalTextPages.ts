import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { DIGITAL_TEXT_PAGES } from '../constants';
import { DigitalTextPagesState } from '../types';

export const fetchDigitalTextPages = createFetchThunk<DigitalTextPagesState>(
    buildResourceFetchActionPrefix(DIGITAL_TEXT_PAGES),
    `${getApiResourcesBaseRoute()}/digitalTextPages`
);
