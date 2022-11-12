import { rest } from 'msw';
import { DEFAULT_ARTIFICIAL_DELAY } from './constants';

export type EndpointAndResponse<T = unknown> = {
    endpoint: string;
    response: T;
};

export const buildMockSuccessfulGETHandler = (
    mockEndpointsAndResponses: EndpointAndResponse,
    delay = DEFAULT_ARTIFICIAL_DELAY
) => {
    const { endpoint, response } = mockEndpointsAndResponses;

    return rest.get(endpoint, (_, res, ctx) => {
        return res(ctx.json(response), ctx.delay(delay));
    });
};
