import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../../domain/models/song/commands/create-song.command-handler';
import { Song } from '../../../domain/models/song/song.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import { DTO } from '../../../types/DTO';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

const commandEndpoint = `/commands`;

const buildValidCommandFSA = (id: string): FluxStandardAction<DTO<CreateSong>> => ({
    type: 'CREATE_SONG',
    payload: {
        id,
        title: 'test-song-name (language)',
        titleEnglish: 'test-song-name (English)',
        contributions: [],
        lyrics: 'la la la',
        audioURL: 'https://www.mysound.org/song.mp3',
    },
});

const existingSong = getValidAggregateInstanceForTest(ResourceType.song);

const dummyAdminUser = buildTestData().user[0].clone({
    roles: [CoscradUserRole.projectAdmin],
});

// Only the role matters here
const testUserWithGroups = new CoscradUserWithGroups(dummyAdminUser, []);

/**
 * This is a high level integration test. It's purpose is to check that
 * the command controller returns the correct Http status codes in its response
 * depending on the result \ exception that occurs.
 *
 * This test assumes an authorized user. `command-rbac.e2e.spec.ts` has the
 * responsibility of testing our Role Based Access Control for the commands route.
 */
describe('The Command Controller', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    beforeAll(async () => {
        ({ testRepositoryProvider, app, commandHandlerService, idManager } =
            await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                { shouldMockIdGenerator: true, testUserWithGroups }
            ));

        commandHandlerService.registerHandler(
            'CREATE_SONG',
            new CreateSongCommandHandler(testRepositoryProvider, idManager)
        );

        jest.useFakeTimers().setSystemTime(new Date('2020-04-05'));
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        // The admin user must be there for the auth middleware
        await testRepositoryProvider.getUserRepository().create(dummyAdminUser);
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command type is invalid', () => {
        it('should return a 400', async () => {
            const idResponse = await request(app.getHttpServer()).post(`/ids`);

            const id = idResponse.text;

            const validPayload = buildValidCommandFSA(id).payload;

            const result = await request(app.getHttpServer()).post(commandEndpoint).send({
                type: 'DO_BAD_THINGS',
                payload: validPayload,
            });

            expect(result.status).toBe(httpStatusCodes.badRequest);
        });
    });

    describe('when the payload is valid', () => {
        it('should return a 200', async () => {
            const idResponse = await request(app.getHttpServer()).post(`/ids`);

            const id = idResponse.text;

            const validCommandFSA = buildValidCommandFSA(id);

            const result = await request(app.getHttpServer())
                .post(commandEndpoint)
                .send(validCommandFSA);

            expect(result.status).toBe(httpStatusCodes.ok);
        });

        it('should persist the result', async () => {
            const idResponse = await request(app.getHttpServer()).post(`/ids`);

            const id = idResponse.text;

            const validCommandFSA = buildValidCommandFSA(id);

            const { payload: validPayload } = validCommandFSA;

            await request(app.getHttpServer()).post(commandEndpoint).send(validCommandFSA);

            const result = await testRepositoryProvider
                .forResource<Song>(ResourceType.song)
                .fetchById(validPayload.id);

            const test = result as Song;

            expect(test.id).toBe(validPayload.id);

            // A create event should be the only one in the song's history
            expect(test.eventHistory).toHaveLength(1);

            expect(test.eventHistory).toMatchSnapshot();
        });
    });

    describe('when the payload has an invalid type', () => {
        describe('when one of the properties on the payload has an invalid type', () => {
            it('should return a 400', async () => {
                const idResponse = await request(app.getHttpServer()).post(`/ids`);

                const id = idResponse.text;

                const validCommandFSA = buildValidCommandFSA(id);

                const { payload: validPayload } = validCommandFSA;

                await request(app.getHttpServer())
                    .post(commandEndpoint)
                    .send({
                        ...validCommandFSA,
                        payload: { ...validPayload, id: [99] },
                    })
                    .expect(httpStatusCodes.badRequest);
            });
        });

        describe('when there is a superfluous property on the payload', () => {
            it('should return a 400', async () => {
                const idResponse = await request(app.getHttpServer()).post(`/ids`);

                const id = idResponse.text;

                const validCommandFSA = buildValidCommandFSA(id);

                const { payload: validPayload } = validCommandFSA;

                await request(app.getHttpServer())
                    .post(commandEndpoint)
                    .send({
                        ...validCommandFSA,
                        payload: { ...validPayload, foo: ["I'm bogus, so bogus!"] },
                    })
                    .expect(httpStatusCodes.badRequest);
            });
        });
    });

    describe('when the command violates invariants through the model update', () => {
        it('should return a 400', async () => {
            const idResponse = await request(app.getHttpServer()).post(`/ids`);

            const id = idResponse.text;

            const validCommandFSA = buildValidCommandFSA(id);

            const { payload: validPayload } = validCommandFSA;

            const result = await request(app.getHttpServer())
                .post(commandEndpoint)
                .send({
                    ...validCommandFSA,
                    payload: {
                        ...validPayload,
                        title: undefined,
                        titleEnglish: undefined,
                    },
                });

            expect(result.status).toBe(httpStatusCodes.badRequest);
        });
    });

    describe('when there is an invalid external state', () => {
        it('should return a 400', async () => {
            const idResponse = await request(app.getHttpServer()).post(`/ids`);

            const id = idResponse.text;

            const validCommandFSA = buildValidCommandFSA(id);

            const { payload: validPayload } = validCommandFSA;

            await testRepositoryProvider.addFullSnapshot(
                buildInMemorySnapshot({
                    resources: {
                        song: [existingSong],
                    },
                })
            );

            const payloadThatAddsSongWithDuplicateId = {
                ...validPayload,
                id: existingSong.id,
            };

            const badFSA = {
                ...validCommandFSA,
                payload: payloadThatAddsSongWithDuplicateId,
            };

            const result = await request(app.getHttpServer()).post(commandEndpoint).send(badFSA);

            expect(result.status).toBe(httpStatusCodes.badRequest);
        });
    });

    // TODO Add a test case where an invalid state transition is attempted
});
