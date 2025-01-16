import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConsoleCoscradCliLogger } from '../../../coscrad-cli/logging';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { ObservableInMemoryEventPublisher } from '../../../domain/common/events/in-memory-event-publisher';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { buildFakeTimersConfig } from '../../../domain/models/__tests__/utilities/buildFakeTimersConfig';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../../domain/models/song/commands/create-song.command-handler';
import { Song } from '../../../domain/models/song/song.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../test-data/buildTestData';
import { DTO } from '../../../types/DTO';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

const commandEndpoint = `/commands`;

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const buildValidCommandFSA = (id: string): FluxStandardAction<DTO<CreateSong>> => ({
    type: 'CREATE_SONG',
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.song },
        title: 'test-song-name (language)',
        languageCodeForTitle: LanguageCode.Chilcotin,
        audioItemId: existingAudioItem.id,
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

    let databaseProvider: ArangoDatabaseProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    beforeAll(async () => {
        ({ testRepositoryProvider, app, commandHandlerService, idManager, databaseProvider } =
            await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                { shouldMockIdGenerator: true, testUserWithGroups }
            ));

        /**
         * TODO[https://www.pivotaltracker.com/story/show/184111389]
         *
         * This needs to be replaced with `PUBLISH_RESOURCE`
         */
        commandHandlerService.registerHandler(
            'CREATE_SONG',
            new CreateSongCommandHandler(
                testRepositoryProvider,
                idManager,
                new ObservableInMemoryEventPublisher(new ConsoleCoscradCliLogger())
            )
        );

        jest.useFakeTimers(buildFakeTimersConfig());
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        // The admin user must be there for the auth middleware
        await testRepositoryProvider.getUserRepository().create(dummyAdminUser);

        await testRepositoryProvider.addFullSnapshot(
            new DeluxeInMemoryStore({
                [AggregateType.audioItem]: [existingAudioItem],
            }).fetchFullSnapshotInLegacyFormat()
        );
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(() => {
        databaseProvider.close();
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
                .fetchById(validPayload.aggregateCompositeIdentifier.id);

            const test = result as Song;

            expect(test.id).toBe(validPayload.aggregateCompositeIdentifier.id);

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
