import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import getValidResourceInstanceForTest from '../../../domain/domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { PublishSong } from '../../../domain/models/song/commands/publish-song.command';
import { PublishSongCommandHandler } from '../../../domain/models/song/commands/publish-song.command-handler';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

describe('Role Based Access Control for commands', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    const existingSong = getValidResourceInstanceForTest(ResourceType.song).clone({
        id: buildDummyUuid(),
        published: false,
    });

    const validCommandFSA: FluxStandardAction<PublishSong> = {
        type: 'PUBLISH_SONG',
        payload: {
            id: existingSong.id,
        },
    };

    describe('when the user does not have an admin role', () => {
        const ordinaryUser = buildTestData().users[0].clone({
            roles: [CoscradUserRole.viewer],
        });

        const userGroup = buildTestData().userGroups[0].clone({
            userIds: [ordinaryUser.id],
        });

        const testUserWithGroups = new CoscradUserWithGroups(ordinaryUser, [userGroup]);

        beforeAll(async () => {
            ({ testRepositoryProvider, app, commandHandlerService, idManager } =
                await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: generateRandomTestDatabaseName(),
                    },
                    { shouldMockIdGenerator: true, testUserWithGroups }
                ));

            commandHandlerService.registerHandler(
                'PUBLISH_SONG',
                new PublishSongCommandHandler(testRepositoryProvider, idManager)
            );

            await testRepositoryProvider.addFullSnapshot(
                buildInMemorySnapshot({
                    users: [ordinaryUser],
                    userGroups: [userGroup],
                    resources: {
                        song: [existingSong],
                    },
                })
            );
        });

        afterAll(async () => {
            await app.close();
        });
        it('should return an unauthroized error', async () => {
            const res = await request(app.getHttpServer()).post(`/commands`).send(validCommandFSA);

            expect(res.status).toBe(httpStatusCodes.unauthorized);
        });
    });

    describe('when there is no user on the request (public request)', () => {
        beforeAll(async () => {
            ({ testRepositoryProvider, app, commandHandlerService, idManager } =
                await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: generateRandomTestDatabaseName(),
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
        });

        afterAll(async () => {
            await app.close();
        });
        it('should return an unauthroized error', async () => {
            const res = await request(app.getHttpServer()).post(`/commands`).send(validCommandFSA);

            expect(res.status).toBe(httpStatusCodes.unauthorized);
        });
    });

    (
        [
            [CoscradUserRole.projectAdmin, 'when the user is a project admin'],
            [CoscradUserRole.superAdmin, 'when the user is a COSCRAD admin'],
        ] as const
    ).forEach(([role, description]) => {
        describe(description, () => {
            const adminUser = buildTestData().users[0].clone({
                roles: [role],
            });

            const userGroup = buildTestData().userGroups[0].clone({
                userIds: [adminUser.id],
            });

            const testUserWithGroups = new CoscradUserWithGroups(adminUser, [userGroup]);

            beforeAll(async () => {
                ({ testRepositoryProvider, app, commandHandlerService, idManager } =
                    await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: generateRandomTestDatabaseName(),
                        },
                        { shouldMockIdGenerator: true, testUserWithGroups }
                    ));

                commandHandlerService.registerHandler(
                    'PUBLISH_SONG',
                    new PublishSongCommandHandler(testRepositoryProvider, idManager)
                );

                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        users: [adminUser],
                        userGroups: [userGroup],
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
                const res = await request(app.getHttpServer())
                    .post(`/commands`)
                    .send(validCommandFSA);

                expect(res.status).toBe(httpStatusCodes.ok);
            });
        });
    });
});
