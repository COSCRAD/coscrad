import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';

interface AssertQueryResultParams<TResponseBody = unknown> {
    app: INestApplication;
    seedInitialState: () => Promise<void>;
    endpoint: string;
    expectedStatus: HttpStatusCode;
    checkResponseBody?: (body: TResponseBody) => Promise<void>;
}

export const assertQueryResult = async ({
    app,
    seedInitialState,
    endpoint,
    expectedStatus,
    checkResponseBody,
}: AssertQueryResultParams) => {
    await seedInitialState();

    const res = await request(app.getHttpServer()).get(endpoint);

    expect(res.status).toBe(expectedStatus);

    if (typeof checkResponseBody === 'function') {
        await checkResponseBody(res.body);
    }
};
