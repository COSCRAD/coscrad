import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import getValidResourceInstanceForTest from '../../../domain/domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { AddSong } from '../../../domain/models/song/commands/add-song.command';
import { AddSongHandler } from '../../../domain/models/song/commands/add-song.command-handler';
import { dummyUuid } from '../../../domain/models/song/commands/add-song.command.integration.spec';
import { Song } from '../../../domain/models/song/song.entity';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../types/DTO';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';
import buildMockUuidGenerator from './__tests__/buildMockUuidGenerator';

const commandEndpoint = `/commands`;

const validCommandFSA: FluxStandardAction<DTO<AddSong>> = {
    type: 'ADD_SONG',
    payload: {
        id: dummyUuid,
        title: 'test-song-name (language)',
        titleEnglish: 'test-song-name (English)',
        contributorAndRoles: [],
        lyrics: 'la la la',
        audioURL: 'https://www.mysound.org/song.mp3',
        lengthMilliseconds: 15340,
    },
};

const existingSong = getValidResourceInstanceForTest(ResourceType.song);

const validPayload = validCommandFSA.payload;

/**
 * This is a high level integration test. It's purpose is to check that
 * the command controller returns the correct Http status codes in its response
 * depending on the result \ exception that occurs.
 */
describe('The Command Controller', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let commandHandlerService: CommandHandlerService;

    beforeAll(async () => {
        ({ testRepositoryProvider, app, commandHandlerService } = await setUpIntegrationTest({
            ARANGO_DB_NAME: generateRandomTestDatabaseName(),
        }));

        commandHandlerService.registerHandler(
            'ADD_SONG',
            new AddSongHandler(testRepositoryProvider, buildMockUuidGenerator())
        );

        jest.useFakeTimers().setSystemTime(new Date('2020-04-05'));
    });

    describe('when the command type is invalid', () => {
        it('should return a 400', async () => {
            const result = await request(app.getHttpServer()).post(commandEndpoint).send({
                type: 'DO_BAD_THINGS',
                payload: validPayload,
            });

            expect(result.status).toBe(httpStatusCodes.badRequest);
        });
    });

    describe('when the payload is valid', () => {
        it('should return a 200', async () => {
            const result = await request(app.getHttpServer())
                .post(commandEndpoint)
                .send(validCommandFSA);

            expect(result.status).toBe(httpStatusCodes.ok);
        });

        it('should persist the result', async () => {
            await request(app.getHttpServer()).post(commandEndpoint).send(validCommandFSA);

            const result = await testRepositoryProvider
                .forResource<Song>(ResourceType.song)
                .fetchById(validPayload.id);

            const test = result as Song;

            expect(test.id).toBe(validCommandFSA.payload.id);

            // A create event should be the only one in the song's history
            expect(test.eventHistory).toHaveLength(1);

            expect(test.eventHistory).toMatchSnapshot();
        });
    });

    describe('when the payload has an invalid type', () => {
        it('should return a 400', async () => {
            const result = await request(app.getHttpServer())
                .post(commandEndpoint)
                .send({
                    ...validCommandFSA,
                    payload: { ...validPayload, id: [99] },
                });

            expect(result.status).toBe(httpStatusCodes.badRequest);
        });
    });

    describe('when the command violates invariants through the model update', () => {
        it('should return a 400', async () => {
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
