import { assertElementWithTestIdOnScreen } from '../assertions/assertElementWithTestIdOnScreen';
import {
    buildMockGETHandlerWithError,
    MockErrorResponseType,
} from '../buildMockGETHandlerWithError';
import { ERROR_TEST_ID, LOADING_TEST_ID } from '../constants';
import { setupTestServer } from '../setupTestServer';

/**
 * TODO we need to update the checks here to identify specific error codes. Otherwise,
 * the tests will pass when the route is not overridden and there is a network
 * error as a result.
 */
export const testContainerComponentErrorHandling = (act: () => void, endpoint: string) => {
    describe(`when the request resturns a 'Not Found' (404)`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.notFound, endpoint));

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(ERROR_TEST_ID);
        });
    });

    describe(`when the request returns an 'Internal Error' (500)`, () => {
        setupTestServer(
            buildMockGETHandlerWithError(MockErrorResponseType.internalError, endpoint)
        );

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(ERROR_TEST_ID);
        });
    });

    describe(`when there is a network error`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.networkError, endpoint));

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(ERROR_TEST_ID);
        });
    });

    describe(`when the request returns a 'Bad Request' (400)`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.badRequest, endpoint));

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(ERROR_TEST_ID);
        });
    });

    describe(`when the request is pending`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.badRequest, endpoint));

        it('should render the loading message', async () => {
            act();

            await assertElementWithTestIdOnScreen(LOADING_TEST_ID);
        });
    });
};
