import { Ack, CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import InvalidEntityDTOError from '../../../domainModelValidators/errors/InvalidEntityDTOError';
import MissingSongTitleError from '../../../domainModelValidators/errors/song/MissingSongTitleError';
import getValidResourceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { CreateSong } from './create-song.command';
import { CreateSongCommandHandler } from './create-song.command-handler';

const createSongCommandType = 'CREATE_SONG';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateSong>> => ({
    type: createSongCommandType,
    payload: {
        id,
        title: 'test-song-name (language)',
        titleEnglish: 'test-song-name (English)',
        contributorAndRoles: [],
        lyrics: 'la la la',
        audioURL: 'https://www.mysound.org/song.mp3',
        lengthMilliseconds: 15340,
    },
});

describe('CreateSong', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let idManager: IIdManager;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
            }));

        commandHandlerService.registerHandler(
            createSongCommandType,
            new CreateSongCommandHandler(testRepositoryProvider, idManager)
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
            const newId = await idManager.generate();

            const result = await commandHandlerService.execute(buildValidCommandFSA(newId));

            expect(result).toBe(Ack);
        });
    });

    describe('when the payload has an invalid type', () => {
        describe('when the id property has an invalid type (number[])', () => {
            it('should return an error', async () => {
                const newId = await idManager.generate();

                const validCommandFSA = buildValidCommandFSA(newId);

                const result = await commandHandlerService.execute({
                    ...validCommandFSA,
                    payload: {
                        ...validCommandFSA.payload,
                        id: [99],
                    },
                });

                expect(result).toEqual(
                    new InvalidCommandPayloadTypeError(createSongCommandType, [
                        new InternalError(''),
                    ])
                );
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when there is already a song with the given ID', () => {
            it('should return the expected error', async () => {
                const newId = await idManager.generate();

                const validCommandFSA = buildValidCommandFSA(newId);

                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        resources: {
                            [ResourceType.song]: [
                                getValidResourceInstanceForTest(ResourceType.song).clone({
                                    id: newId,
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

    describe('when the song to create does not satisfy invariant validation rules', () => {
        describe('when creating a song with no title in any language', () => {
            it('should return the expected error', async () => {
                const newId = await idManager.generate();

                const validCommandFSA = buildValidCommandFSA(newId);

                const fsa: FluxStandardAction<DTO<CreateSong>> = {
                    ...validCommandFSA,
                    payload: {
                        ...validCommandFSA.payload,
                        title: undefined,
                        titleEnglish: undefined,
                    },
                };

                const result = await commandHandlerService.execute(fsa);

                expect(result).toEqual(
                    new InvalidEntityDTOError(ResourceType.song, validCommandFSA.payload.id, [
                        new MissingSongTitleError(),
                    ])
                );

                expect((result as InternalError).innerErrors).toEqual([
                    new MissingSongTitleError(),
                ]);
            });
        });
    });

    // There are currently no 'invalid state transitions' for Song
});
