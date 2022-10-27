import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';

const buildTermsEndpoint = () => `${getApiResourcesBaseRoute()}/terms`;

export const fetchTerms = createFetchThunk(`${RESOURCES}/${TERMS}/fetch`, buildTermsEndpoint());
