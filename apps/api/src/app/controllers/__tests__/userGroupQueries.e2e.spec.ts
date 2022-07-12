import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';
import assertDetailQueryOkResponse from './sharedAssertions/assertDetailQueryOkResponse';
import assertIndexQueryOkResponse from './sharedAssertions/assertIndexQueryOkResponse';

describe('User Group Queries', () => {
    const endpointUnderTest = '/userGroups';

    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const { userGroups, users } = buildTestData();

    const popularUser = users[0];

    const snapshotWithUsersAndGroups = buildInMemorySnapshot({
        userGroups: userGroups.map((group) =>
            group.clone({
                userIds: [popularUser.id],
            })
        ),
        users,
    });

    beforeAll(async () => {
        ({ app, arangoConnectionProvider, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when fetching a group by ID', () => {
        describe('when there is no group with the given ID', () => {
            it('should return not found', async () => {
                await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

                return await request(app.getHttpServer())
                    .get(`${endpointUnderTest}/'BOGUS-GROUP-ID`)
                    .expect(httpStatusCodes.notFound);
            });
        });

        describe('when there is a group with the given ID', () => {
            it('should find the group', async () => {
                await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

                const idToFind = userGroups[0].id;

                const result = await request(app.getHttpServer()).get(
                    `${endpointUnderTest}/${idToFind}`
                );

                assertDetailQueryOkResponse(result, idToFind);
            });
        });
    });

    describe('when fetching all groups', () => {
        it('should return the expected result', async () => {
            await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

            const res = await request(app.getHttpServer()).get(endpointUnderTest);

            assertIndexQueryOkResponse(res);
        });
    });
});
