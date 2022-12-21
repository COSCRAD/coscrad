import { ResourceType } from '@coscrad/api-interfaces';
import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummyMediaItems } from './test-utils/build-dummy-media-items';

jest.spyOn(window.HTMLMediaElement.prototype, 'pause')
    /* eslint-disable-next-line */
    .mockImplementation(() => {});

jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());

const dummyMediaItems = buildDummyMediaItems();

const mediaItemToFind = dummyMediaItems[0];
const { id: idToFind } = mediaItemToFind;

const endpoint = `${getApiResourcesBaseRoute()}/mediaItems`;

const dummyIndexResponse = buildMockIndexResponse(
    dummyMediaItems.map((item) => [item, []]),
    []
);

const act = buildCategorizableDetailPageRendererForTest(ResourceType.mediaItem);
const mockGetNotesHandler = buildMockGetNotesHandler();

describe('media item detail', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyIndexResponse,
            }),
            mockGetNotesHandler
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
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
