import { ResourceType } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { renderResourceIndexPageForTest } from '../test-utils';

const endpoint = `${getConfig().apiUrl}/resources/songs`;

const act = () => renderResourceIndexPageForTest(ResourceType.song);

describe('Song Index', () => {
    // TODO Test error handling \ loading state with Cypress and remove this test
    describe('when the API requests fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
