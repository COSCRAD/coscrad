import { Ack, CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import buildMockUuidGenerator from '../../../../app/controllers/command/__tests__/buildMockUuidGenerator';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import InvalidEntityDTOError from '../../../domainModelValidators/errors/InvalidEntityDTOError';
import MissingSongTitleError from '../../../domainModelValidators/errors/song/MissingSongTitleError';
import getValidResourceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { AddSong } from './add-song.command';
import { AddSongHandler } from './add-song.command-handler';

export const dummyUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

const addSongCommandType = 'ADD_SONG';

const validCommandFSA: FluxStandardAction<DTO<AddSong>> = {
    type: addSongCommandType,
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

const validPayload = validCommandFSA.payload;
describe('AddSong', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
            }));

        commandHandlerService.registerHandler(
            addSongCommandType,
            new AddSongHandler(testRepositoryProvider, buildMockUuidGenerator())
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
                    new InvalidCommandPayloadTypeError(addSongCommandType, [new InternalError('')])
                );
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when there is already a song with the given ID', () => {
            it('should return the expected error', async () => {
                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        resources: {
                            [ResourceType.song]: [
                                getValidResourceInstanceForTest(ResourceType.song).clone({
                                    id: dummyUuid,
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
                const fsa: FluxStandardAction<DTO<AddSong>> = {
                    ...validCommandFSA,
                    payload: {
                        ...validPayload,
                        title: undefined,
                        titleEnglish: undefined,
                    },
                };

                const result = await commandHandlerService.execute(fsa);

                expect(result).toEqual(
                    new InvalidEntityDTOError(ResourceType.song, validPayload.id, [
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
