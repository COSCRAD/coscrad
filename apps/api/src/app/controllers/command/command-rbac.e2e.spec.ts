import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { PublishSong } from '../../../domain/models/song/commands/publish-song.command';
import { PublishSongCommandHandler } from '../../../domain/models/song/commands/publish-song.command-handler';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { dummyUuid } from '../../../domain/models/__tests__/utilities/dummyUuid';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

const databaseName = generateDatabaseNameForTestSuite();

/**
 * This is a high level test that checks the Role Base Access Control for
 * the commands endpoint. It mocks out the auth strategy / guard.
 *
 * `command.controller.e2e.spec.ts` tests the command controller in more detail
 **/
describe('Role Based Access Control for commands', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    const existingSong = getValidAggregateInstanceForTest(ResourceType.song).clone({
        id: dummyUuid,
        published: false,
    });

    const validCommandFSA: FluxStandardAction<PublishSong> = {
        type: 'PUBLISH_SONG',
        payload: {
            id: existingSong.id,
        },
    };

    describe('when the user does not have an admin role', () => {
        const ordinaryUser = buildTestData().user[0].clone({
            roles: [CoscradUserRole.viewer],
        });

        const userGroup = buildTestData().userGroup[0].clone({
            userIds: [ordinaryUser.id],
        });

        const testUserWithGroups = new CoscradUserWithGroups(ordinaryUser, [userGroup]);

        beforeAll(async () => {
            ({ testRepositoryProvider, app, commandHandlerService, idManager } =
                await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: databaseName,
                    },
                    { shouldMockIdGenerator: true, testUserWithGroups }
                ));

            commandHandlerService.registerHandler(
                'PUBLISH_SONG',
                new PublishSongCommandHandler(testRepositoryProvider, idManager)
            );

            await testRepositoryProvider.testSetup();

            await testRepositoryProvider.addFullSnapshot(
                buildInMemorySnapshot({
                    user: [ordinaryUser],
                    userGroup: [userGroup],
                    resources: {
                        song: [existingSong],
                    },
                })
            );
        });

        afterAll(async () => {
            await app.close();

            await testRepositoryProvider.testTeardown();
        });
        it('should return an unauthroized error', async () => {
            await request(app.getHttpServer())
                .post(`/commands`)
                .send(validCommandFSA)
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });
    });

    describe('when there is no user on the request (public request)', () => {
        beforeAll(async () => {
            ({ testRepositoryProvider, app, commandHandlerService, idManager } =
                await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: databaseName,
                    },
                    { shouldMockIdGenerator: true }
                ));

            commandHandlerService.registerHandler(
                'PUBLISH_SONG',
                new PublishSongCommandHandler(testRepositoryProvider, idManager)
            );

            await testRepositoryProvider.addFullSnapshot(
                buildInMemorySnapshot({
                    resources: {
                        song: [existingSong],
                    },
                })
            );

            await testRepositoryProvider.testSetup();
        });

        afterAll(async () => {
            await app.close();
        });
        it('should return an unauthroized error', async () => {
            await request(app.getHttpServer())
                .post(`/commands`)
                .send(validCommandFSA)
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });
    });

    (
        [
            [CoscradUserRole.projectAdmin, 'when the user is a project admin'],
            [CoscradUserRole.superAdmin, 'when the user is a COSCRAD admin'],
        ] as const
    ).forEach(([role, description]) => {
        describe(description, () => {
            const adminUser = buildTestData().user[0].clone({
                roles: [role],
            });

            const userGroup = buildTestData().userGroup[0].clone({
                userIds: [adminUser.id],
            });

            const testUserWithGroups = new CoscradUserWithGroups(adminUser, [userGroup]);

            beforeAll(async () => {
                ({ testRepositoryProvider, app, commandHandlerService, idManager } =
                    await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: databaseName,
                        },
                        { shouldMockIdGenerator: true, testUserWithGroups }
                    ));

                commandHandlerService.registerHandler(
                    'PUBLISH_SONG',
                    new PublishSongCommandHandler(testRepositoryProvider, idManager)
                );

                await testRepositoryProvider.testSetup();

                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        user: [adminUser],
                        userGroup: [userGroup],
                        resources: {
                            song: [existingSong],
                        },
                    })
                );
            });

            afterAll(async () => {
                await app.close();
            });
            it('should return ok', async () => {
                const result = request(app.getHttpServer()).post(`/commands`).send(validCommandFSA);

                result.expect(httpStatusCodes.ok);
            });
        });
    });
});
