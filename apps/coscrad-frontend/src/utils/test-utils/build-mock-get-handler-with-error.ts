import { HttpStatusCode } from '@coscrad/api-interfaces';
import { rest } from 'msw';
import { DEFAULT_ARTIFICIAL_DELAY } from './constants';

export enum MockErrorResponseType {
    badRequest = 'badRequest',
    internalError = 'internalError',
    indefiniteLoading = 'indefiniteLoading',
    networkError = 'networkError',
    notFound = 'notFound',
}

const MOCK_INFINITE_DELAY = 1000 * DEFAULT_ARTIFICIAL_DELAY;

/**
 * Builds a GET handler that mimics the prescribed error response.
 */
export const buildMockGETHandlerWithError = (
    responseType: MockErrorResponseType,
    endpoint: string,
    artificialDelay = DEFAULT_ARTIFICIAL_DELAY
) => {
    return rest.get(endpoint, (_, res, ctx) => {
        if (responseType === MockErrorResponseType.badRequest)
            return res(
                ctx.json({
                    statusCode: HttpStatusCode.badRequest,
                    error: 'Something went wrong',
                }),
                ctx.status(HttpStatusCode.badRequest),
                ctx.delay(artificialDelay)
            );

        if (responseType === MockErrorResponseType.notFound)
            return res(
                ctx.json({
                    statusCode: HttpStatusCode.notFound,
                    error: 'Not Found',
                }),
                ctx.status(HttpStatusCode.notFound),
                ctx.delay(artificialDelay)
            );

        if (responseType === MockErrorResponseType.internalError)
            return res(
                ctx.json({
                    statusCode: HttpStatusCode.internalError,
                    error: 'Something went wrong',
                }),
                ctx.status(HttpStatusCode.internalError),
                ctx.delay(artificialDelay)
            );

        if (responseType === MockErrorResponseType.networkError) {
            throw new Error(`Simulated Network Error!`);
        }

        if (responseType === MockErrorResponseType.indefiniteLoading)
            return res(
                ctx.json('I should never load'),
                ctx.status(HttpStatusCode.internalError),
                ctx.delay(MOCK_INFINITE_DELAY)
            );

        const exhaustiveCheck: never = responseType;

        throw new Error(`Failed to create a mock error response of type: ${exhaustiveCheck}`);
    });
};
