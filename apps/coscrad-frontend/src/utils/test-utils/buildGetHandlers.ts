import { rest } from 'msw';

const DEFAULT_ARTIFICIAL_DELAY = 150;

export type EndpointAndResponse<T = unknown> = {
    endpoint: string;
    response: T;
};

export const buildGetHandlers = (
    mockEndpointsAndResponses: EndpointAndResponse[],
    delay = DEFAULT_ARTIFICIAL_DELAY
) =>
    mockEndpointsAndResponses.map(({ endpoint, response }) =>
        rest.get(endpoint, (_, res, ctx) => {
            return res(ctx.json(response), ctx.delay(delay));
        })
    );
