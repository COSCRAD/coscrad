import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import * as request from 'supertest';
import { HttpStatusCode } from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CoscradUserGroup } from '../../user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';

const mediaItemUploadEndpoint = `/resources/mediaItems/upload`;

const inputDir = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly`;

const testFileName = `station`;

const extension = 'png';

const testFilePath = `${inputDir}/${testFileName}.${extension}`;

const staticAssetDestinationDirectory = '__static__';

const userId = buildDummyUuid(117);

const groupId = buildDummyUuid(118);

const dummyUser = new CoscradUser({
    type: AggregateType.user,
    id: userId,
    username: 'Blake',
    authProviderUserId: `auth0|${userId}`,
    roles: [CoscradUserRole.viewer],
});

const userGroup = new CoscradUserGroup({
    type: AggregateType.userGroup,
    id: groupId,
    userIds: [userId],
    label: 'developers',
    description: 'this group is for software developers',
});

describe(`File Upload`, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    describe(`when an authenticated user uploads a file`, () => {
        beforeAll(async () => {
            const testUserWithGroups =
                dummyUser && new CoscradUserWithGroups(dummyUser, [userGroup]);

            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                {
                    testUserWithGroups,
                }
            ));

            if (!existsSync(staticAssetDestinationDirectory)) {
                mkdirSync(staticAssetDestinationDirectory);
            }

            await testRepositoryProvider.testTeardown();
        });

        beforeEach(async () => {
            await testRepositoryProvider.testTeardown();
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        it(`should return 200`, async () => {
            if (!existsSync(testFilePath)) {
                throw new InternalError(`File does not exist`);
            }

            const res = await request(app.getHttpServer())
                .post(mediaItemUploadEndpoint)
                .attach(testFileName, testFilePath);

            expect(res.status).toBe(HttpStatusCode.ok);
        });
    });
});
