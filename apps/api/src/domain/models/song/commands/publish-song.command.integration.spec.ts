import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { assertCommandError } from '../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { Song } from '../song.entity';
import { PublishSong } from './publish-song.command';
import { PublishSongCommandHandler } from './publish-song.command-handler';

const publishSongCommandType = 'PUBLISH_SONG';

const dummyUuid = buildDummyUuid();

const unpublishedSong = getValidAggregateInstanceForTest(ResourceType.song).clone({
    id: dummyUuid,
    published: false,
});

const buildCommandFSA = (): FluxStandardAction<DTO<PublishSong>> => ({
    type: publishSongCommandType,
    payload: {
        id: unpublishedSong.id,
    },
});

const buildFullState = (song: Song) =>
    buildInMemorySnapshot({
        resources: {
            song: [song],
        },
    });

describe('PublishSong', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        commandHandlerService.registerHandler(
            publishSongCommandType,
            new PublishSongCommandHandler(testRepositoryProvider, idManager)
        );

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
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

    describe('when the payload is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: buildCommandFSA,
                initialState: buildFullState(unpublishedSong),
            });
        });
    });

    describe('when the payload has an invalid type', () => {
        describe('when the id property has an invalid type (number[])', () => {
            it('should return an error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => ({
                        type: publishSongCommandType,
                        payload: {
                            id: [333],
                        },
                    }),
                    initialState: buildFullState(unpublishedSong),
                    checkError: (error: InternalError) => {
                        const expectedError = new InvalidCommandPayloadTypeError(
                            publishSongCommandType,
                            [new InternalError('')]
                        );

                        expect(error).toEqual(expectedError);
                    },
                });
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when there is no song with the given ID', () => {
            it('should return the expected error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA,
                    // Note the absence of any existing songs here
                    initialState: buildInMemorySnapshot({}),
                });
            });
        });
    });

    describe('when the state transition is not allowed', () => {
        describe('when the song is already published', () => {
            it('should return the expected error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA,
                    initialState: buildFullState(unpublishedSong.clone({ published: true })),
                });
            });
        });
    });
});
