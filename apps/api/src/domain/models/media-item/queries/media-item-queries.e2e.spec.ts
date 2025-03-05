import { AggregateType, CoscradUserRole, HttpStatusCode, MIMEType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { INestApplication } from '@nestjs/common';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import * as request from 'supertest';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CoscradUserGroup } from '../../user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';

const mediaItemBaseEndpoint = `/resources/mediaItems`;

const buildFindByNameQueryUrl = (name: string) => `${mediaItemBaseEndpoint}/download?name=${name}`;

const staticAssetDestinationDirectory = '__static__';

const mediaItemName = 'biodynamic-theme-song-forever';

const extension = 'mp3';

const mediaItemPath = `${staticAssetDestinationDirectory}/${mediaItemName}.${extension}`;

const testFilePath = `__cli-command-test-inputs__/ingest-media-items/mediaItemsOnly/biodynamic-theme-song-forever.mp3`;

const mediaItemToFind = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    title: mediaItemName,
    published: true,
    // this lines up with the file name, which exists in __static__
    mimeType: MIMEType.mp3,
});

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

describe('when querying for a media item by name (/resources/mediaItems/download?name=foo)', () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    describe(`when there is no media item with the given name`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                {
                    testUserWithGroups: undefined,
                }
            ));

            if (!existsSync(staticAssetDestinationDirectory)) {
                mkdirSync(staticAssetDestinationDirectory);
            }

            if (!existsSync(mediaItemPath)) {
                copyFileSync(testFilePath, mediaItemPath);
            }

            await testRepositoryProvider.testTeardown();
        });

        beforeEach(async () => {
            await testRepositoryProvider.testTeardown();
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        const bogusName = 'I do not exist';

        it('should return a 404', () => {
            request(app.getHttpServer())
                .get(buildFindByNameQueryUrl(bogusName))
                .expect(HttpStatusCode.notFound);
        });
    });

    const testCases = [
        {
            description: 'when the user is public',
            expectedPrivateResourceResult: HttpStatusCode.notFound,
        },
        {
            description: 'when the user is an ordinary viewer (non admin)',
            userRole: CoscradUserRole.viewer,
            expectedPrivateResourceResult: HttpStatusCode.notFound,
        },
        {
            description: 'when the user is a project admin',
            userRole: CoscradUserRole.projectAdmin,
            expectedPrivateResourceResult: HttpStatusCode.ok,
        },
        {
            description: 'when the user is a COSCRAD admin',
            userRole: CoscradUserRole.superAdmin,
            expectedPrivateResourceResult: HttpStatusCode.ok,
        },
    ];

    describe(`when the media item exists`, () => {
        testCases.forEach((testCase) => {
            const { description, userRole, expectedPrivateResourceResult } = testCase;

            const user = isNullOrUndefined(userRole)
                ? undefined
                : dummyUser.clone({
                      roles: [userRole],
                  });

            describe(description, () => {
                beforeAll(async () => {
                    const testUserWithGroups = user && new CoscradUserWithGroups(user, [userGroup]);

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

                    if (!existsSync(mediaItemPath)) {
                        copyFileSync(testFilePath, mediaItemPath);
                    }

                    await testRepositoryProvider.testTeardown();
                });

                beforeEach(async () => {
                    await testRepositoryProvider.testTeardown();
                });

                afterAll(async () => {
                    databaseProvider.close();
                });

                describe(`when the media item is published`, () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.testTeardown();

                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.mediaItem]: [mediaItemToFind],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    });

                    it(`should return the expected binary`, async () => {
                        const endpoint = buildFindByNameQueryUrl(mediaItemName);

                        const res = await request(app.getHttpServer()).get(endpoint);

                        expect(res.status).toBe(HttpStatusCode.ok);

                        // TODO verify that the appropriate binary is there
                    });
                });

                describe(`when the media item is not published`, () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.testTeardown();

                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.mediaItem]: [
                                    mediaItemToFind.clone({
                                        published: false,
                                    }),
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    });

                    it(`should return the expected result (${expectedPrivateResourceResult})`, async () => {
                        const endpoint = buildFindByNameQueryUrl(mediaItemName);

                        const res = await request(app.getHttpServer()).get(endpoint);

                        expect(res.status).toBe(expectedPrivateResourceResult);
                    });
                });

                describe(`when the name parameter is invalidly formatted`, () => {
                    it(`should return a 400 (user error)`, async () => {
                        const whitespaceOnly = '%20'.repeat(4);

                        const invalidEndpoint = buildFindByNameQueryUrl(whitespaceOnly);

                        const res = await request(app.getHttpServer()).get(invalidEndpoint);

                        expect(res.status).toBe(HttpStatusCode.badRequest);
                    });
                });
            });
        });
    });
});
