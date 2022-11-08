import { MemoryRouter } from 'react-router-dom';
import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
import { renderWithProviders } from '../../../utils/test-utils';
import { assertElementWithEveryIdRenderedForIndex } from '../../../utils/test-utils/assertions/assert-element-with-every-id-rendered-for-index';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/buildMockSuccessfulGETHandler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setupTestServer';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { BookIndexContainer } from './book-index.container';
import { buildDummyBooks } from './test-utils/build-dummy-books';

const dummyBooks = buildDummyBooks();

const endpoint = `${getApiResourcesBaseRoute()}/books`;

const act = () =>
    renderWithProviders(
        <MemoryRouter>
            <BookIndexContainer />
        </MemoryRouter>
    );

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

            await assertElementWithEveryIdRenderedForIndex(dummyBooks);
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(act, endpoint);
    });
});
