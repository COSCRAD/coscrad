import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';

interface AssertQueryResultParams<
    TResponseBody = unknown,
    THeaders extends Record<string, unknown> = Record<string, unknown>
> {
    app: INestApplication;
    seedInitialState: () => Promise<void>;
    endpoint: string;
    expectedStatus: HttpStatusCode;
    checkResponseBody?: (body: TResponseBody) => Promise<void>;
    checkHeaders?: (headers: THeaders) => Promise<void>;
}

export const assertQueryResult = async ({
    app,
    seedInitialState,
    endpoint,
    expectedStatus,
    checkResponseBody,
    checkHeaders,
}: AssertQueryResultParams) => {
    await seedInitialState();

    const res = await request(app.getHttpServer()).get(endpoint);

    expect(res.status).toBe(expectedStatus);

    if (typeof checkResponseBody === 'function') {
        await checkResponseBody(res.body);
    }

    if (typeof checkHeaders === 'function') {
        await checkHeaders(res.header);
    }
};
