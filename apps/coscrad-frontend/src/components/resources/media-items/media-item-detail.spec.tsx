import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
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
import { MediaItemDetailContainer } from './media-item-detail.container';
import { buildDummyMediaItems } from './test-utils/build-dummy-media-items';

const dummyMediaItems = buildDummyMediaItems();

const mediaItemToFind = dummyMediaItems[0];
const { id: idToFind } = mediaItemToFind;

const endpoint = `${getApiResourcesBaseRoute()}/mediaItems`;

const dummyIndexResponse = buildMockIndexResponse(
    dummyMediaItems.map((item) => [item, []]),
    []
);

const act = (idInLocation: string) =>
    renderWithProviders(
        withDetailRoute(idInLocation, `/Resources/MediaItems/`, <MediaItemDetailContainer />)
    );

describe('media item detail', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyIndexResponse,
            })
        );

        describe('when the ID in the route corresponds to an existing media item', () => {
            it('should display the media item', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when there is no media item that matches the ID in the route', () => {
            it('should render Not Found', async () => {
                act('bogus-media-item-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request has failed or is pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint);
    });
});
