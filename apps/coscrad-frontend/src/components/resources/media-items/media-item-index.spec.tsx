import { ResourceType } from '@coscrad/api-interfaces';
import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { renderResourceIndexPageForTest } from '../test-utils';
import { buildDummyMediaItems } from './test-utils/build-dummy-media-items';

const dummyMediaItems = buildDummyMediaItems();

const endpoint = `${getApiResourcesBaseRoute()}/mediaItems`;

const act = () => renderResourceIndexPageForTest(ResourceType.mediaItem);

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
