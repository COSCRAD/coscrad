import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { renderResourceIndexPageForTest } from '../test-utils';
import { buildDummyBooks } from './test-utils/build-dummy-books';

const dummyBooks = buildDummyBooks();

const endpoint = `${getApiResourcesBaseRoute()}/books`;

const act = () => renderResourceIndexPageForTest(ResourceType.book);

describe('Book Index', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: buildMockIndexResponse(
                    dummyBooks.map((book) => [book, []]),
                    []
                ),
            })
        );

        it('should display the books', async () => {
            act();

            await assertElementWithEveryIdRenderedForIndex(dummyBooks, AggregateType.book);
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
