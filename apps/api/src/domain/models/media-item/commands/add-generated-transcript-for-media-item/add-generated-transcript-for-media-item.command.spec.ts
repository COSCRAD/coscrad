import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { MediaItem } from '../../entities/media-item.entity';
import { AddGeneratedTranscriptForMediaItem } from './add-generated-transcript-for-media-item.command';

const commandType = 'ADD_GENERATED_TRANSCRIPT_FOR_MEDIA_ITEM';

const mediaItemId = buildDummyUuid(1);

const existingMediaItem = buildTestInstance(MediaItem, {
    id: mediaItemId,
    transcripts: [],
});

/**
 * Note that at the level of this command, we do not validate the contents
 * of the transcript. Instead, we can attempt to parse this separately, and
 * update the state if the parsing succeeds. This ensures that
 * 1. We can add raw data from a new `source` model or version without writing a parser.
 * 2. We can opt in to the parsing at a future date.
 *
 * There is no guarantee that this is a valid COSCRAD transcript.
 * There will be a data cleaning \ augmentation flow before `IMPORT_LINE_ITEMS_TO_TRANSCRIPT`
 * if necessary.
 */
const rawTranscript = {
    model: 'my-super-awesome-asr-model',
    modelVersion: 'en2.5',
    data: {
        words: [
            {
                text: 'boo',
                in: 1234.5,
                out: 4959.2,
            },
            {
                text: 'hoo',
                in: 5555.2,
                out: 5559.34,
            },
        ],
    },
};

const validFsa: CommandFSA<AddGeneratedTranscriptForMediaItem> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.mediaItem,
            id: mediaItemId,
        },
        source: 'whisper-local',
        version: '1.5.4',
        transcript: rawTranscript,
    },
};

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected state updates`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validFsa,
                seedInitialState: async () => {
                    await commandAssertionDependencies.testRepositoryProvider
                        .forResource(ResourceType.mediaItem)
                        .create(existingMediaItem);
                },
                checkStateOnSuccess: async () => {
                    const updatedMediaItem =
                        (await commandAssertionDependencies.testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .fetchById(mediaItemId)) as MediaItem;

                    const { transcripts } = updatedMediaItem;

                    expect(transcripts).toHaveLength(1);

                    expect(transcripts[0].data).toEqual(rawTranscript);

                    assertEventRecordPersisted(
                        updatedMediaItem,
                        'GENERATED_TRANSCRIPT_ADDED_FOR_MEDIA_ITEM',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the media item does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    validFsa.payload.aggregateCompositeIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });

        /**
         * TODO Normally, we use schema-based time validation for these kinds
         * of check. But because we use `RawData` type for this property, we
         * want to do a sanity check to prevent accidentally posting an empty
         * object. We can't really say too much more about the structure of this
         * until parse-time.
         */
        describe(`when the transcript is an empty object`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await commandAssertionDependencies.testRepositoryProvider
                            .forResource(ResourceType.mediaItem)
                            .create(existingMediaItem);
                    },
                    buildCommandFSA: () => {
                        const withEmptyTranscript = {
                            ...validFsa,
                            payload: {
                                ...validFsa.payload,
                                transcript: {},
                            },
                        };

                        return withEmptyTranscript;
                    },
                    checkError: (error) => {
                        assertErrorAsExpected(error, new CommandExecutionError([]));

                        const invalidMessages = [error.toString()].filter(
                            (m) => !m.toLowerCase().includes('empty transcript')
                        );

                        expect(invalidMessages).toEqual([]);
                    },
                });
            });
        });
    });
});
