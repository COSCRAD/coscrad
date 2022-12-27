import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import MissingSongTitleError from '../../../domainModelValidators/errors/song/MissingSongTitleError';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import {
    assertCommandFailsDueToTypeError,
    assertCommandPayloadTypeError,
} from '../../../models/__tests__/command-helpers/assert-command-payload-type-error';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { Song } from '../song.entity';
import { CreateSong } from './create-song.command';
import { CreateSongCommandHandler } from './create-song.command-handler';

const createSongCommandType = 'CREATE_SONG';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateSong>> => ({
    type: createSongCommandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.song },
        title: 'test-song-name (language)',
        titleEnglish: 'test-song-name (English)',
        contributions: [],
        lyrics: 'la la la',
        audioURL: 'https://www.mysound.org/song.mp3',
    },
});

const buildInvalidFSA = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof CreateSong, unknown>> = {}
): FluxStandardAction<DTO<CreateSong>> => ({
    type: createSongCommandType,
    payload: {
        ...buildValidCommandFSA(id).payload,
        ...(payloadOverrides as Partial<CreateSong>),
    },
});

const initialState = buildInMemorySnapshot({});

describe('CreateSong', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };

        commandHandlerService.registerHandler(
            createSongCommandType,
            new CreateSongCommandHandler(testRepositoryProvider, idManager)
        );
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
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA,
                initialState,
                systemUserId: dummySystemUserId,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateSong) => {
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const songSearchResult = await testRepositoryProvider
                        .forResource<Song>(ResourceType.song)
                        .fetchById(id);

                    expect(songSearchResult).not.toBe(NotFound);

                    expect(songSearchResult).not.toBeInstanceOf(InternalError);

                    expect((songSearchResult as Song).id).toBe(id);

                    assertEventRecordPersisted(
                        songSearchResult as Song,
                        'SONG_CREATED',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the payload has an invalid type', () => {
        generateCommandFuzzTestCases(CreateSong).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            { propertyName, invalidValue },
                            buildValidCommandFSA('unused-id')
                        );
                    });
                });
            }
        );
    });

    describe('when the payload has an invalid type', () => {
        // TODO: Use the fuzz generator here
        describe('when the id property has an invalid type (number[])', () => {
            it('should return an error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            aggregateCompositeIdentifier: { id: [99], type: AggregateType.song },
                        }),
                    initialState,
                    systemUserId: dummySystemUserId,
                    checkError: (error) => {
                        // TODO Check inner errors
                        expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);
                    },
                });
            });
        });

        describe('when the required property contributions is missing', () => {
            it('should return an error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) => ({
                        type: createSongCommandType,
                        payload: {
                            id,
                            title: 'test-song-name (language)',
                            titleEnglish: 'test-song-name (English)',
                            lyrics: 'la la la',
                            audioURL: 'https://www.mysound.org/song.mp3',
                        },
                    }),
                    initialState,
                    systemUserId: dummySystemUserId,

                    checkError: (error) => assertCommandPayloadTypeError(error, 'contributions'),
                });
            });
        });
    });

    /**
     * We build this test case without the helpers because of the complication
     * of using the generated ID as part of the initial state.
     */
    describe('when the external state is invalid', () => {
        describe('when there is already a song with the given ID', () => {
            it('should return the expected error', async () => {
                const newId = await idManager.generate();

                const validCommandFSA = buildValidCommandFSA(newId);

                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        resources: {
                            [ResourceType.song]: [
                                getValidAggregateInstanceForTest(ResourceType.song).clone({
                                    id: newId,
                                }),
                            ],
                        },
                    })
                );

                const result = await commandHandlerService.execute(validCommandFSA, {
                    userId: dummySystemUserId,
                });

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });

    describe('when the id has not been generated via our system', () => {
        it('should return the expected error', async () => {
            const bogusId = '4604b265-3fbd-4e1c-9603-66c43773aec0';

            await assertCreateCommandError(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                buildCommandFSA: (_: AggregateId) => buildInvalidFSA(bogusId),
                initialState,
                // TODO Tighten up the error check
            });
        });
    });

    describe('when the song to create does not satisfy invariant validation rules', () => {
        describe('when creating a song with no title in any language', () => {
            it('should return the expected error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            title: undefined,
                            titleEnglish: undefined,
                        }),
                    initialState,
                    checkError: (error: InternalError, id) => {
                        const expectedError = new InvariantValidationError(
                            { type: ResourceType.song, id },
                            [new MissingSongTitleError()]
                        );

                        const wrappedError = new CommandExecutionError([expectedError]);

                        // We probably want a `checkInerErrors` helper
                        expect(error).toEqual(wrappedError);

                        expect(error.innerErrors).toEqual(wrappedError.innerErrors);

                        expect(error.innerErrors[0].innerErrors).toEqual(
                            wrappedError.innerErrors[0].innerErrors
                        );
                    },
                });
            });
        });
    });
});
