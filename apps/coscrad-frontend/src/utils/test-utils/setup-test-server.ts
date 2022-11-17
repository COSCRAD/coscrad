import { RequestHandler } from 'msw';
import { setupServer } from 'msw/node';

export const setupTestServer = (...handlers: RequestHandler[]) => {
    const server = setupServer(...handlers);

    beforeAll(() =>
        server.listen({
            onUnhandledRequest: 'error',
        })
    );

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());
};
