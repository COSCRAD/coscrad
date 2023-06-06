import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../config';
import { buildMockSuccessfulGETHandler } from '../../utils/test-utils/build-mock-successful-get-handler';

/**
 * This is useful when mocking out the `/resources` (resource info) endpoint for tests.
 * In the future, we may want to simply use the snapshot of the contract test
 * with the backend as a fixture for front-end tests.
 *
 * Note that the dummy data is meant to be correct in type only.
 */
export const buildDummyResourceInfos = (): IAggregateInfo[] => {
    const allResourceTypes = Object.values(ResourceType);

    return allResourceTypes.map((resourceType) => ({
        label: `mock label for ${resourceType}`,
        pluralLabel: `mock plural label for ${resourceType}`,
        type: resourceType,
        link: `${getConfig().apiUrl}/resources/${resourceType}`,
        description: `test ${resourceType} description`,
        schema: {},
    }));
};

export const buildMockResourceInfoHandler = () =>
    buildMockSuccessfulGETHandler({
        endpoint: `${getConfig().apiUrl}/resources`,
        response: [buildDummyResourceInfos()],
    });
