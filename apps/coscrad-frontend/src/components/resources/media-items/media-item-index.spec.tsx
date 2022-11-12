import { MemoryRouter } from 'react-router-dom';
import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { MediaItemIndexContainer } from './media-item-index.container';
import { buildDummyMediaItems } from './test-utils/build-dummy-media-items';

const dummyMediaItems = buildDummyMediaItems();

const endpoint = `${getApiResourcesBaseRoute()}/mediaItems`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <MediaItemIndexContainer />
        </MemoryRouter>
    );

describe('media item index', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyMediaItems.map((item) => [item, []]),
                    []
                ),
            })
        );

        it('should display the media items', async () => {
            act();
            await assertElementWithEveryIdRenderedForIndex(dummyMediaItems);
        });
    });

    describe('when the API request has failed or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
