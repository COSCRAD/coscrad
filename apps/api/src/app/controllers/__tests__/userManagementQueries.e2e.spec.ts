import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { dummySystemUserId } from '../../../domain/models/__tests__/utilities/dummySystemUserId';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';
import assertDetailQueryOkResponse from './sharedAssertions/assertDetailQueryOkResponse';
import assertIndexQueryOkResponse from './sharedAssertions/assertIndexQueryOkResponse';

describe('User Management Queries', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    const userGroupIndexEndpoint = '/admin/userGroups';

    const userIndexEndpoint = '/admin/users';

    const { userGroup: userGroups, user: users } = buildTestData();

    const popularUser = users[0];

    const projectAdminUser = popularUser.clone({
        id: dummySystemUserId,
        username: 'project-admin',
        authProviderUserId: 'auth0|86868686868',
        roles: [CoscradUserRole.projectAdmin],
    });

    const coscradAdminUser = popularUser.clone({
        id: dummySystemUserId,
        username: 'coscrad-system-admin',
        authProviderUserId: 'auth0|86868686855',
        roles: [CoscradUserRole.superAdmin],
    });

    const nonAdminSystemUser = popularUser.clone({
        id: dummySystemUserId,
        username: 'ordinary-user',
        authProviderUserId: 'auth0|86868686859',
        roles: [CoscradUserRole.viewer],
    });

    const snapshotWithUsersAndGroups = buildInMemorySnapshot({
        userGroup: userGroups.map((group) =>
            group.clone({
                userIds: [popularUser.id],
            })
        ),
        user: users,
    });

    describe(`when fetching schemas (/admin)`, () => {
        let app: INestApplication;

        let testRepositoryProvider: TestRepositoryProvider;
        beforeAll(async () => {
            ({ app, testRepositoryProvider } = await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));
        });

        afterAll(async () => {
            await app.close();
        });

        beforeEach(async () => {
            await testRepositoryProvider.testSetup();
        });
        it('should return the expected result', async () => {
            const result = await request(app.getHttpServer()).get('/admin');

            expect(result.status).toBe(httpStatusCodes.ok);

            expect(result.body).toMatchSnapshot();
        });
    });

    describe('when the system user issuing the command is authorized', () => {
        (
            [
                [
                    new CoscradUserWithGroups(coscradAdminUser, []),
                    'when the user is a coscrad admin',
                ],
                [
                    new CoscradUserWithGroups(projectAdminUser, []),
                    'when the user is a project admin',
                ],
            ] as const
        ).forEach(([adminUserWithGroups, description]) => {
            describe(description, () => {
                const testDatabaseName = generateDatabaseNameForTestSuite();

                let app: INestApplication;

                let testRepositoryProvider: TestRepositoryProvider;
                beforeAll(async () => {
                    ({ app, testRepositoryProvider } = await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: testDatabaseName,
                        },
                        {
                            testUserWithGroups: adminUserWithGroups,
                        }
                    ));
                });

                afterAll(async () => {
                    await app.close();
                });

                beforeEach(async () => {
                    await testRepositoryProvider.testSetup();
                });

                afterEach(async () => {
                    await testRepositoryProvider.testTeardown();
                });

                describe('when querying for user groups', () => {
                    describe('when fetching a group by ID', () => {
                        describe('when there is no group with the given ID', () => {
                            it('should return not found', async () => {
                                await testRepositoryProvider.addFullSnapshot(
                                    snapshotWithUsersAndGroups
                                );

                                return await request(app.getHttpServer())
                                    .get(`${userGroupIndexEndpoint}/'BOGUS-GROUP-ID`)
                                    .expect(httpStatusCodes.notFound);
                            });
                        });

                        describe('when there is a group with the given ID', () => {
                            it('should find the group', async () => {
                                await testRepositoryProvider.addFullSnapshot(
                                    snapshotWithUsersAndGroups
                                );

                                const idToFind = userGroups[0].id;

                                const result = await request(app.getHttpServer()).get(
                                    `${userGroupIndexEndpoint}/${idToFind}`
                                );

                                assertDetailQueryOkResponse(result, idToFind);
                            });
                        });
                    });

                    describe('when fetching all groups', () => {
                        it('should return the expected result', async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                snapshotWithUsersAndGroups
                            );

                            const res = await request(app.getHttpServer()).get(
                                userGroupIndexEndpoint
                            );

                            assertIndexQueryOkResponse(res);
                        });
                    });
                });

                describe('when querying for users', () => {
                    describe('when fetching a user by ID', () => {
                        describe('when there is no user with the given ID', () => {
                            it('should return not found', async () => {
                                await testRepositoryProvider.addFullSnapshot(
                                    snapshotWithUsersAndGroups
                                );

                                return await request(app.getHttpServer())
                                    .get(`${userIndexEndpoint}/'BOGUS-USER-ID`)
                                    .expect(httpStatusCodes.notFound);
                            });
                        });

                        describe('when there is a user with the given ID', () => {
                            it('should find the user', async () => {
                                await testRepositoryProvider.addFullSnapshot(
                                    snapshotWithUsersAndGroups
                                );

                                const idToFind = users[0].id;

                                const result = await request(app.getHttpServer()).get(
                                    `${userIndexEndpoint}/${idToFind}`
                                );

                                assertDetailQueryOkResponse(result, idToFind);
                            });
                        });
                    });

                    describe('when fetching all users', () => {
                        it('should return the expected result', async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                snapshotWithUsersAndGroups
                            );

                            const res = await request(app.getHttpServer()).get(userIndexEndpoint);

                            assertIndexQueryOkResponse(res);
                        });
                    });
                });
            });
        });
    });

    describe('when the system user issuing the command is not authorized', () => {
        (
            [
                [
                    new CoscradUserWithGroups(nonAdminSystemUser, userGroups),
                    'when the user is authenticated as an ordinary, non-admin user',
                ],
                [undefined, 'when the user is not logged in'],
            ] as const
        ).forEach(([unauthorizedSystemUserWithGroups, description]) => {
            describe(description, () => {
                let app: INestApplication;

                let testRepositoryProvider: TestRepositoryProvider;
                beforeAll(async () => {
                    ({ app, testRepositoryProvider } = await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: testDatabaseName,
                        },
                        {
                            testUserWithGroups: unauthorizedSystemUserWithGroups,
                        }
                    ));
                });

                afterAll(async () => {
                    await app.close();
                });

                beforeEach(async () => {
                    await testRepositoryProvider.testSetup();
                });

                afterEach(async () => {
                    await testRepositoryProvider.testTeardown();
                });

                describe('when querying for a single group by ID (fetchById)', () => {
                    it('should return forbidden', async () => {
                        await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

                        const idToFind = userGroups[0].id;

                        return await request(app.getHttpServer())
                            .get(`${userGroupIndexEndpoint}/${idToFind}`)
                            .expect(httpStatusCodes.forbidden);
                    });
                });

                describe('when querying for many groups (fetchMany)', () => {
                    it('should return forbidden', async () => {
                        await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

                        await request(app.getHttpServer())
                            .get(userGroupIndexEndpoint)
                            .expect(httpStatusCodes.forbidden);
                    });
                });

                describe('when querying for a single user by ID (fetchById)', () => {
                    it('should return forbidden', async () => {
                        await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

                        const idToFind = users[0].id;

                        return await request(app.getHttpServer())
                            .get(`${userIndexEndpoint}/${idToFind}`)
                            .expect(httpStatusCodes.forbidden);
                    });
                });

                describe('when querying for many users (fetchMany)', () => {
                    it('should return forbidden', async () => {
                        await testRepositoryProvider.addFullSnapshot(snapshotWithUsersAndGroups);

                        await request(app.getHttpServer())
                            .get(userIndexEndpoint)
                            .expect(httpStatusCodes.forbidden);
                    });
                });
            });
        });
    });
});
