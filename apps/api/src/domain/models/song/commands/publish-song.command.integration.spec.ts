import { Ack, CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import buildMockUuidGenerator from '../../../../app/controllers/command/__tests__/buildMockUuidGenerator';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import getValidResourceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { PublishSong } from './publish-song.command';
import { PublishSongCommandHandler } from './publish-song.command-handler';

const publishSongCommandType = 'PUBLISH_SONG';

const dummyUuid = buildDummyUuid();

const validCommandFSA: FluxStandardAction<DTO<PublishSong>> = {
    type: publishSongCommandType,
    payload: {
        id: dummyUuid,
    },
};

const validPayload = validCommandFSA.payload;
describe('PublishSong', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
            }));

        commandHandlerService.registerHandler(
            publishSongCommandType,
            new PublishSongCommandHandler(testRepositoryProvider, buildMockUuidGenerator())
        );
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the payload is valid', () => {
        it('should succeed', async () => {
            await testRepositoryProvider.addFullSnapshot(
                buildInMemorySnapshot({
                    resources: {
                        [ResourceType.song]: [
                            getValidResourceInstanceForTest(ResourceType.song).clone({
                                id: dummyUuid,
                                published: false,
                            }),
                        ],
                    },
                })
            );

            const result = await commandHandlerService.execute(validCommandFSA);

            expect(result).toBe(Ack);
        });
    });

    describe('when the payload has an invalid type', () => {
        describe('when the id property has an invalid type (number[])', () => {
            it('should return an error', async () => {
                const result = await commandHandlerService.execute({
                    ...validCommandFSA,
                    payload: {
                        ...validPayload,
                        id: [99],
                    },
                });

                expect(result).toEqual(
                    new InvalidCommandPayloadTypeError(publishSongCommandType, [
                        new InternalError(''),
                    ])
                );
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when there is no song with the given ID', () => {
            it('should return the expected error', async () => {
                // Note the absence of a setup step adding existing songs here

                const result = await commandHandlerService.execute(validCommandFSA);

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });

    // There is no way to invalidate invariants with this command

    describe('when the state transition is not allowed', () => {
        describe('when the song is already published', () => {
            it('should return the expected error', async () => {
                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        resources: {
                            [ResourceType.song]: [
                                getValidResourceInstanceForTest(ResourceType.song).clone({
                                    id: dummyUuid,
                                    published: true,
                                }),
                            ],
                        },
                    })
                );

                const result = await commandHandlerService.execute(validCommandFSA);

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
