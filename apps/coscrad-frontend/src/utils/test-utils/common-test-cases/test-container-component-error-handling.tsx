import { assertElementWithTestIdOnScreen } from '../assertions/assert-element-with-test-id-on-screen';
import {
    buildMockGETHandlerWithError,
    MockErrorResponseType,
} from '../build-mock-get-handler-with-error';
import { TestId } from '../constants';
import { setupTestServer } from '../setup-test-server';

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

            await assertElementWithTestIdOnScreen(TestId.error);
        });
    });

    describe(`when the request returns an 'Internal Error' (500)`, () => {
        setupTestServer(
            buildMockGETHandlerWithError(MockErrorResponseType.internalError, endpoint)
        );

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(TestId.error);
        });
    });

    describe(`when there is a network error`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.networkError, endpoint));

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(TestId.error);
        });
    });

    describe(`when the request returns a 'Bad Request' (400)`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.badRequest, endpoint));

        it('should render an error', async () => {
            act();

            await assertElementWithTestIdOnScreen(TestId.error);
        });
    });

    describe(`when the request is pending`, () => {
        setupTestServer(buildMockGETHandlerWithError(MockErrorResponseType.badRequest, endpoint));

        it('should render the loading message', async () => {
            act();

            await assertElementWithTestIdOnScreen(TestId.loading);
        });
    });
};
