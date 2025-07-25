import { FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { dummyUuid } from '../../../domain/models/__tests__/utilities/dummyUuid';
import { PublishResource } from '../../../domain/models/shared/common-commands';
import { SongCreated } from '../../../domain/models/song/commands';
import { Song } from '../../../domain/models/song/song.entity';
import { CoscradUserGroup } from '../../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../test-data/events';
import { buildTestInstance } from '../../../test-data/utilities';
import httpStatusCodes, { HttpStatusCode } from '../../constants/httpStatusCodes';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';
import { ARANGO_BULK_JOB_COLLECTION_NAME } from './bulk-imports/arango-bulk-job-repository';

const databaseName = generateDatabaseNameForTestSuite();

const routes = {
    validate: '/commands/validate',
};

/**
 * This is a high level test that checks the Role Base Access Control for
 * the commands endpoint. It mocks out the auth strategy / guard.
 *
 * `command.controller.e2e.spec.ts` tests the command controller in more detail
 **/
describe('Role Based Access Control for commands', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    const songCreated = new TestEventStream().buildSingle<SongCreated>({
        type: 'SONG_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: dummyUuid,
            },
        },
    });

    const existingSong = Song.fromEventHistory([songCreated], dummyUuid) as Song;

    const validCommandFSA: FluxStandardAction<PublishResource> = {
        type: 'PUBLISH_RESOURCE',
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.song, id: existingSong.id },
        },
    };

    describe('when the user does not have an admin role', () => {
        const ordinaryUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.viewer],
        });

        const userGroup = buildTestInstance(CoscradUserGroup, {
            userIds: [ordinaryUser.id],
        });

        const testUserWithGroups = new CoscradUserWithGroups(ordinaryUser, [userGroup]);

        beforeAll(async () => {
            ({ testRepositoryProvider, app, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: databaseName,
                },
                { shouldMockIdGenerator: true, testUserWithGroups }
            ));

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

            databaseProvider.close();
        });
        it('should return an unauthroized error from the single commands endpoint "/commands"', async () => {
            await request(app.getHttpServer())
                .post(`/commands`)
                .send(validCommandFSA)
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });

        it('should return an unauthroized error from the bulk job endpoint "/commands/bulk"', async () => {
            await request(app.getHttpServer())
                .post(`/commands/bulk`)
                .send(validCommandFSA)
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });

        it('should return an unauthroized error from the bulk job endpoint "/commands/bulk/:id"', async () => {
            await request(app.getHttpServer())
                .post(`/commands/bulk/123`)
                .send(validCommandFSA)
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });

        it(`should return an untauthorized error from the validation endpoint "/commands/bulk/:id"`, async () => {
            await request(app.getHttpServer())
                .get(routes.validate)
                .send({})
                .expect(HttpStatusCode.forbidden);
        });
    });

    describe('when there is no user on the request (public request)', () => {
        beforeAll(async () => {
            ({ testRepositoryProvider, app } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: databaseName,
                },
                { shouldMockIdGenerator: true }
            ));

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
        it('should return an unauthroized error when executing a single command via /commands', async () => {
            await request(app.getHttpServer())
                .post(`/commands`)
                .send(validCommandFSA)
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });

        it('should return an unauthroized error when executing a single command via /commands/bulk', async () => {
            await request(app.getHttpServer())
                .post(`/commands/bulk`)
                .send({ stream: [validCommandFSA] })
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });

        it('should return an unauthroized error when executing a single command via /commands/bulk/:id', async () => {
            await request(app.getHttpServer())
                .post(`/commands/bulk/123`)
                .send({ stream: [validCommandFSA] })
                //  A non-admin user cannot even activate the route
                .expect(httpStatusCodes.forbidden);
        });

        it(`should return an untauthorized error from the validation endpoint "/commands/bulk/:id"`, async () => {
            await request(app.getHttpServer())
                .get(routes.validate)
                .send({})
                .expect(HttpStatusCode.forbidden);
        });
    });

    (
        [
            [CoscradUserRole.projectAdmin, 'when the user is a project admin'],
            [CoscradUserRole.superAdmin, 'when the user is a COSCRAD admin'],
        ] as const
    ).forEach(([role, description]) => {
        beforeEach(async () => {
            await databaseProvider
                .getDatabaseForCollection(ARANGO_BULK_JOB_COLLECTION_NAME)
                .clear();
        });

        describe(description, () => {
            const adminUser = buildTestInstance(CoscradUser, {
                roles: [role],
            });

            const userGroup = buildTestInstance(CoscradUserGroup, {
                userIds: [adminUser.id],
            });

            const testUserWithGroups = new CoscradUserWithGroups(adminUser, [userGroup]);

            beforeEach(async () => {
                ({ testRepositoryProvider, app } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: databaseName,
                    },
                    { shouldMockIdGenerator: true, testUserWithGroups }
                ));

                await testRepositoryProvider.testSetup();

                await testRepositoryProvider.addFullSnapshot(
                    new DeluxeInMemoryStore({
                        user: [adminUser],
                        userGroup: [userGroup],
                        song: [existingSong],
                    }).fetchFullSnapshotInLegacyFormat()
                );
            });

            afterAll(async () => {
                await app.close();
            });
            it('should return ok for a single command via /commands', async () => {
                const result = await request(app.getHttpServer())
                    .post(`/commands`)
                    .send(validCommandFSA);

                expect(result.status).toBe(HttpStatusCode.ok);
            });

            it('should return ok when creating a bulk job via /commands/bulk and executing it via /commands/bulk/:id', async () => {
                const jobCreationResponse = await request(app.getHttpServer())
                    .post(`/commands/bulk`)
                    .send({ stream: [validCommandFSA] });

                expect(jobCreationResponse.status).toBe(HttpStatusCode.ok);

                const {
                    body: { id: jobId },
                } = jobCreationResponse;

                const jobExecutionResponse = await await request(app.getHttpServer()).post(
                    `/commands/bulk/${jobId}`
                );

                expect(jobExecutionResponse.status).toBe(HttpStatusCode.ok);
            });

            it(`should return an bad input error from the validation endpoint "/commands/bulk/:id" for an empty stream`, async () => {
                await request(app.getHttpServer())
                    .get(routes.validate)
                    .send({
                        stream: [],
                    })
                    .expect(HttpStatusCode.badRequest);
            });
        });
    });
});
