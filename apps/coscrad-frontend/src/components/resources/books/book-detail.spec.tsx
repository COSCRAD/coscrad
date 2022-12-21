import { ResourceType } from '@coscrad/api-interfaces';
import { getApiResourcesBaseRoute } from '../../../store/slices/resources/shared';
import { assertElementWithTestIdOnScreen, assertNotFound } from '../../../utils/test-utils';
import { buildMockSuccessfulGETHandler } from '../../../utils/test-utils/build-mock-successful-get-handler';
import { testContainerComponentErrorHandling } from '../../../utils/test-utils/common-test-cases/test-container-component-error-handling';
import { setupTestServer } from '../../../utils/test-utils/setup-test-server';
import { buildMockIndexResponse } from '../../../utils/test-utils/test-data';
import { buildMockGetNotesHandler } from '../../notes/test-utils/buildMockGetNotesHandler';
import { buildCategorizableDetailPageRendererForTest } from '../test-utils';
import { buildDummyBooks } from './test-utils/build-dummy-books';

const dummyBooks = buildDummyBooks();

const bookToFind = dummyBooks[0];

const { id: idToFind } = bookToFind;

const endpoint = `${getApiResourcesBaseRoute()}/books`;

const dummyIndexResponse = buildMockIndexResponse(
    dummyBooks.map((book) => [book, []]),
    []
);

const mockGetNotesHandler = buildMockGetNotesHandler();

const act = buildCategorizableDetailPageRendererForTest(ResourceType.book);

describe('book detail', () => {
    describe('when the API request succeeds', () => {
        setupTestServer(
            buildMockSuccessfulGETHandler({
                endpoint,
                response: dummyIndexResponse,
            }),
            mockGetNotesHandler
        );

        describe('when the ID in the route corresponds to an existing book', () => {
            it('should display the book', async () => {
                act(idToFind);

                await assertElementWithTestIdOnScreen(idToFind);
            });
        });

        describe('when there is no book that matches the ID in the route', () => {
            it('should render Not Found', async () => {
                act('blah-blah-id');

                await assertNotFound();
            });
        });
    });

    describe('when the API request fails or is pending', () => {
        testContainerComponentErrorHandling(() => act(idToFind), endpoint, mockGetNotesHandler);
    });
});
