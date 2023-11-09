import { buildResourceFetchActionPrefix } from '../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../shared';
import { DIGITAL_TEXTS } from './constants';
import { DigitalTextIndexState } from './types';

export const fetchDigitalTexts = createFetchThunk<DigitalTextIndexState>(
    buildResourceFetchActionPrefix(DIGITAL_TEXTS),
    `${getApiResourcesBaseRoute()}/digitalTexts`
);
