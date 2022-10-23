import { HttpStatusCode, IAggregateInfo } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { renderWithProviders } from '../../utils/test-utils/renderWithProviders';
import { AllResources } from './AllResources';

const ARTIFICIAL_DELAY = 150;

const widgetLabel = 'Widget';

const dummyResourceInfo: IAggregateInfo[] = [
    {
        type: 'widget',
        schema: {},
        link: '/widgets',
        description: 'A widget is a cool part',
        label: widgetLabel,
    },
];

enum ResponseType {
    ok = 'ok',
    badRequest = 'badRequest',
    internalError = 'internalError',
    indefiniteLoading = 'indefiniteLoading',
    networkError = 'networkError',
}

let responseType: ResponseType;

const handlers = [
    rest.get(`${getConfig().apiUrl}/resources`, (_, res, ctx) => {
        if (!responseType) {
            throw new Error(`You must set a dummy response status in your test case`);
        }

        if (responseType === ResponseType.ok)
            return res(ctx.json(dummyResourceInfo), ctx.delay(ARTIFICIAL_DELAY));

        if (responseType === ResponseType.badRequest)
            return res(
                ctx.json({
                    code: HttpStatusCode.badRequest,
                    error: 'Something went wrong',
                }),
                ctx.status(HttpStatusCode.badRequest),
                ctx.delay(ARTIFICIAL_DELAY)
            );

        // Missing not found case

        if (responseType === ResponseType.internalError)
            return res(
                ctx.json({
                    code: HttpStatusCode.internalError,
                    error: 'Something went wrong',
                }),
                ctx.status(HttpStatusCode.internalError),
                ctx.delay(ARTIFICIAL_DELAY)
            );

        if (responseType === ResponseType.networkError) {
            throw new Error(`Simulated Network Error!`);
        }

        if (responseType === ResponseType.indefiniteLoading)
            return res(
                ctx.json('I should never load'),
                ctx.status(HttpStatusCode.internalError),
                ctx.delay(ARTIFICIAL_DELAY * 10000)
            );
    }),
];

const server = setupServer(...handlers);

describe('AllResources', () => {
    beforeAll(() => server.listen());

    afterEach(() => server.resetHandlers());

    afterAll(() => server.close());

    describe('when the request is sucessful', () => {
        beforeAll(() => {
            responseType = ResponseType.ok;
        });

        afterAll(() => {
            responseType = null;
        });

        it('should display the resource info', async () => {
            renderWithProviders(
                <MemoryRouter>
                    <AllResources></AllResources>
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId(widgetLabel)).toBeTruthy());

            expect(screen.queryByText(/[Ll]oading/i)).not.toBeTruthy();
        });
    });

    ([ResponseType.badRequest, ResponseType.internalError] as ResponseType[]).forEach(
        (returnErrorResponseType) =>
            describe(`when the request returns a non-200 response of type: ${returnErrorResponseType}`, () => {
                beforeAll(() => {
                    responseType = returnErrorResponseType;
                });

                afterAll(() => {
                    responseType = null;
                });

                it('should display an error message', async () => {
                    renderWithProviders(
                        <MemoryRouter>
                            <AllResources></AllResources>
                        </MemoryRouter>
                    );

                    await waitFor(() => expect(screen.getByTestId('error')).toBeTruthy());
                });
            })
    );

    describe('when the request is pending', () => {
        beforeAll(() => {
            responseType = ResponseType.indefiniteLoading;
        });

        afterAll(() => {
            responseType = null;
        });

        it('should render the loading component', async () => {
            renderWithProviders(
                <MemoryRouter>
                    <AllResources></AllResources>
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId('loading')).toBeTruthy());
        });
    });

    describe('when the request fails due to a network error', () => {
        beforeAll(() => {
            responseType = ResponseType.networkError;
        });

        afterAll(() => {
            responseType = null;
        });

        it('should render the loading component', async () => {
            renderWithProviders(
                <MemoryRouter>
                    <AllResources></AllResources>
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId('error')).toBeTruthy());
        });
    });
});
