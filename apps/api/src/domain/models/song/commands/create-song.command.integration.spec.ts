import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../types/DTO';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { assertCommandFailsDueToTypeError } from '../../../models/__tests__/command-helpers/assert-command-payload-type-error';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../__tests__/utilities/dummyUuid';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import UuidNotGeneratedInternallyError from '../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { Song } from '../song.entity';
import { CreateSong } from './create-song.command';

const createSongCommandType = 'CREATE_SONG';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateSong>> => ({
    type: createSongCommandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.song },
        title: 'test-song-name (language)',
        languageCodeForTitle: LanguageCode.Chilcotin,
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

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
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
                            buildValidCommandFSA(dummyUuid)
                        );
                    });
                });
            }
        );
    });

    describe('when the payload has an invalid type', () => {
        describe(`when the payload has an invalid aggregate type`, () => {
            Object.values(AggregateType)
                .filter((t) => t !== AggregateType.song)
                .forEach((invalidAggregateType) => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            {
                                propertyName: 'aggregateCompositeIdentifier',
                                invalidValue: {
                                    type: invalidAggregateType,
                                    id: buildDummyUuid(15),
                                },
                            },
                            buildValidCommandFSA(buildDummyUuid(12))
                        );
                    });
                });
        });

        generateCommandFuzzTestCases(CreateSong).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            { propertyName, invalidValue },
                            buildValidCommandFSA(buildDummyUuid(123))
                        );
                    });
                });
            }
        );
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

                // add the song for the first time
                await commandHandlerService.execute(validCommandFSA, {
                    userId: dummySystemUserId,
                });

                // attempt to add a second song with the same ID
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
                checkError: (error: InternalError) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([new UuidNotGeneratedInternallyError(bogusId)])
                    );
                },
            });
        });
    });
});
