import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { getConfig } from '../../../config';
import {
    assertElementWithTestIdOnScreen,
    assertNotFound,
    renderWithProviders,
} from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { withDetailRoute } from '../../../utils/test-utils/with-detail-route';
import { PhotographDetailContainer } from './photograph-detail.container';

const idToFind = '123';

const photographToFind: IPhotographViewModel = {
    id: idToFind,
    photographer: 'Johnny Blue',
    imageURL: 'https://jazzysnaps.images.com/doghouse.png',
};

// TODO we still need a dummy (system) config and its provider
const endpoint = `${getConfig().apiUrl}/resources/photographs`;

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(idInLocation, `/Resources/Photographs/`, <PhotographDetailContainer />)
    );

describe('photograph detail', () => {
    describe('when the API request is valid', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                // TODO add detail scoped actions and check that they are displayed
                response: buildMockIndexResponse([[photographToFind, []]], []),
            })
        );

        describe('when the photograph ID in the route corresponds to an existing photograph', () => {
            it('should display the photograph', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when there is no photograph that matches the ID in the route', () => {
            it('should render not found', async () => {
                act('bogus-photo-id-1243');

                await assertNotFound();
            });
        });
    });

    describe('when the API fails or is pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
