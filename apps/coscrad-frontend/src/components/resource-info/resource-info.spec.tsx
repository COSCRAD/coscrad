import { CategorizableType, HttpStatusCode, ResourceType } from '@coscrad/api-interfaces';
import { screen, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { getConfig } from '../../config';
import { DetailViewType } from '../../configurable-front-matter/data/configurable-content-schema';
import { hexToRgb } from '../../utils/math/colors';
import { getDummyConfigurableContent } from '../../utils/test-utils/get-dummy-configurable-content';
import { renderWithProviders } from '../../utils/test-utils/render-with-providers';
import { buildDummyResourceInfos } from './build-dummy-resource-info';
import { ResourceInfoContainer } from './resource-info.container';

const ARTIFICIAL_DELAY = 150;

const widgetLabel = 'Widget';

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
            return res(ctx.json(buildDummyResourceInfos()), ctx.delay(ARTIFICIAL_DELAY));

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

describe('Resource Index Page', () => {
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

        it('should use the custom label', async () => {
            const dummyLabel = 'My resources';

            const dummyConfig = getDummyConfigurableContent({
                resourceIndexLabel: dummyLabel,
                indexToDetailFlows: [
                    {
                        categorizableType: CategorizableType.digitalText,
                        labelOverrides: {
                            label: 'Widget',
                            pluralLabel: 'Widgets',
                            route: 'WIDGETZ',
                        },
                        // TODO remove this property all together!
                        detailViewType: DetailViewType.fullView,
                    },
                ],
            });

            renderWithProviders(
                <MemoryRouter>
                    <ResourceInfoContainer />
                </MemoryRouter>,
                {
                    contentConfig: dummyConfig,
                }
            );

            const searchPattern = new RegExp(dummyLabel);

            await waitFor(() => expect(screen.getByText(searchPattern)).toBeTruthy());
        });

        it('should apply the custom backgroundColor', () => {
            const dummyColor = '#3440eb';

            const expectedColor = hexToRgb(dummyColor);

            const dummyConfigurableContent = getDummyConfigurableContent({
                themeOverrides: {
                    palette: {
                        primary: {
                            main: dummyColor,
                        },
                    },
                },
            });

            renderWithProviders(
                <MemoryRouter>
                    <ResourceInfoContainer />
                </MemoryRouter>,
                {
                    contentConfig: dummyConfigurableContent,
                }
            );

            const AllResourcesEl = document.querySelector(`svg`).parentElement;

            const style = window.getComputedStyle(AllResourcesEl);

            expect(style.color).toBe(expectedColor);
        });

        it('should display the resource info', async () => {
            const dummyConfig = getDummyConfigurableContent({
                resourceIndexLabel: 'Super Widgets',
                indexToDetailFlows: [
                    {
                        categorizableType: CategorizableType.digitalText,
                        labelOverrides: {
                            label: 'Widget',
                            pluralLabel: 'Widgets',
                            route: 'WIDGETZ',
                        },
                        // TODO remove this property all together!
                        detailViewType: DetailViewType.fullView,
                    },
                ],
            });

            renderWithProviders(
                <MemoryRouter>
                    <ResourceInfoContainer />
                </MemoryRouter>,
                {
                    contentConfig: dummyConfig,
                }
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
                            <ResourceInfoContainer />
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
                    <ResourceInfoContainer />
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
                    <ResourceInfoContainer />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId('error')).toBeTruthy());
        });
    });

    describe(`when custom index-to-detail flows are defined`, () => {
        describe(`when there is a single index-to-detail flow defined for a resource type`, () => {
            beforeAll(() => {
                responseType = ResponseType.ok;
            });

            afterAll(() => {
                responseType = null;
            });

            it(`should leverage the labels from the custom index-to-detail-flow`, async () => {
                const customPluralLabel = 'Super Deluxe Widgets';

                const dummyConfig = getDummyConfigurableContent({
                    indexToDetailFlows: [
                        {
                            // todo save reference to this for clarity
                            categorizableType: ResourceType.digitalText,
                            labelOverrides: {
                                label: 'Super Deluxe Widget',
                                pluralLabel: customPluralLabel,
                                route: `WIDGETZ`,
                            },
                            // @ts-expect-error fix types
                            detailViewType: 'full-view',
                        },
                    ],
                });

                renderWithProviders(
                    <MemoryRouter>
                        <ResourceInfoContainer />
                    </MemoryRouter>,
                    {
                        contentConfig: dummyConfig,
                    }
                );

                const searchPattern = new RegExp(customPluralLabel);

                await waitFor(() => expect(screen.getByText(searchPattern)).toBeTruthy());
            });

            it(`should leverage the routes from the custom index-to-detail-flow`, async () => {
                const dummyConfig = getDummyConfigurableContent({
                    indexToDetailFlows: [
                        {
                            categorizableType: ResourceType.digitalText,
                            labelOverrides: {
                                label: 'Widget',
                                pluralLabel: 'Widgets',
                                route: 'WIDGETZ',
                            },
                            detailViewType: DetailViewType.fullView,
                        },
                    ],
                });

                const { baseElement } = renderWithProviders(
                    <MemoryRouter>
                        <ResourceInfoContainer />
                    </MemoryRouter>,
                    {
                        contentConfig: dummyConfig,
                    }
                );

                await waitFor(() => {
                    const el = baseElement.querySelector('a');

                    expect(el.href.includes('WIDGETZ')).toBe(true);
                });
            });
        });
    });
});
