import { getConfig } from '../../../../config';

export const getApiResourcesBaseRoute = () => `${getConfig().apiUrl}/resources`;
