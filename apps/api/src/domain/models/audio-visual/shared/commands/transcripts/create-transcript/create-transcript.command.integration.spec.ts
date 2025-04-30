import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../../../queries/presentation/formatAggregateType';
import { TestEventStream } from '../../../../../../../test-data/events';
import { IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../../../types/ResourceType';
import { assertCommandError } from '../../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../../shared/common-command-errors/CommandExecutionError';
import InvalidCommandPayloadTypeError from '../../../../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { AudioItemCreated } from '../../../../audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { CannotOverwriteTranscriptError } from '../../../../audio-item/errors';
import { VideoCreated } from '../../../../video';
import { Video } from '../../../../video/entities/video.entity';
import { CreateTranscript } from './create-transcript.command';
import { TranscriptCreated } from './transcript-created.event';

const commandType = `CREATE_TRANSCRIPT`;

const audioItemId = buildDummyUuid(1);

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const existingAudioItem = AudioItem.fromEventHistory(
    audioItemCreated.as({
        type: AggregateType.audioItem,
        id: audioItemId,
    }),
    audioItemId
) as AudioItem;

const videoId = buildDummyUuid(2);

const videoCreated = new TestEventStream().andThen<VideoCreated>({
    type: 'VIDEO_CREATED',
});

const existingVideo = Video.fromEventHistory(
    videoCreated.as({
        type: AggregateType.video,
        id: videoId,
    }),
    videoId
) as Video;

const buildValidCommandFSA = (validResource: AudioItem | Video) => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: validResource.getCompositeIdentifier(),
    },
});

const systemUserId = buildDummyUuid(555);

const validInitialState = new DeluxeInMemoryStore({
    resources: {
        [AggregateType.audioItem]: [existingAudioItem],
        [AggregateType.video]: [existingVideo],
    },
}).fetchFullSnapshotInLegacyFormat();

const audiovisualResourceTypes = [ResourceType.audioItem, ResourceType.video];

describe(commandType, () => {
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

    Object.values(ResourceType)
        .filter((resourceType) => !audiovisualResourceTypes.includes(resourceType))
        .forEach((nonAudiovisualResourceType) =>
            describe(`when the command invalidly targets a non-audiovisual resource`, () => {
                it(`should fail with the expected error`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => ({
                            type: commandType,
                            payload: {
                                aggregateCompositeIdentifier: {
                                    id: buildDummyUuid(432),
                                    type: nonAudiovisualResourceType,
                                },
                            },
                        }),
                        systemUserId: dummySystemUserId,
                        initialState: validInitialState,
                        checkError: (error) => {
                            expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);
                            // expect(error.toString().includes('aggregateCompositeIdentifier')).toBe(
                            //     true
                            // );
                        },
                    });
                });
            })
        );

    // audio items
    describe(`when working with a resource of type: ${formatAggregateType(
        AggregateType.audioItem
    )}`, () => {
        const instance = existingAudioItem;

        const audioItemWithTranscript = AudioItem.fromEventHistory(
            audioItemCreated
                .andThen<TranscriptCreated>({
                    type: 'TRANSCRIPT_CREATED',
                })
                .as({
                    type: AggregateType.audioItem,
                    id: audioItemId,
                }),
            audioItemId
        ) as AudioItem;

        describe(`when the command is valid`, () => {
            describe(`when adding a transcript`, () => {
                it('should succeed with the expected database updates', async () => {
                    await assertCommandSuccess(assertionHelperDependencies, {
                        systemUserId,
                        initialState: validInitialState,
                        buildValidCommandFSA: () => buildValidCommandFSA(instance),
                        checkStateOnSuccess: async ({
                            aggregateCompositeIdentifier: { id },
                        }: CreateTranscript) => {
                            const resourceSearchResult = await testRepositoryProvider
                                .forResource<AudioItem | Video>(AggregateType.audioItem)
                                .fetchById(id);

                            expect(resourceSearchResult).not.toBe(NotFound);

                            expect(resourceSearchResult).not.toBeInstanceOf(InternalError);

                            const updatedResource = resourceSearchResult as unknown as
                                | AudioItem
                                | Video;

                            expect(updatedResource.hasTranscript()).toBe(true);

                            assertEventRecordPersisted(
                                updatedResource,
                                'TRANSCRIPT_CREATED',
                                systemUserId
                            );
                        },
                    });
                });
            });
        });

        describe(`when the command is invalid`, () => {
            describe(`when the payload has an invalid type`, () => {
                describe('when the command payload type is invalid', () => {
                    generateCommandFuzzTestCases(CreateTranscript).forEach(
                        ({ description, propertyName, invalidValue }) => {
                            describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                                it('should fail with the appropriate error', async () => {
                                    await assertCommandFailsDueToTypeError(
                                        assertionHelperDependencies,
                                        { propertyName, invalidValue },
                                        buildValidCommandFSA(instance)
                                    );
                                });
                            });
                        }
                    );
                });
            });

            describe(`when there is no resource with the given aggregateCompositeIdentifier`, () => {
                it('should fail with the expected error', async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => buildValidCommandFSA(instance),
                        systemUserId,
                        initialState: new DeluxeInMemoryStore({
                            // empty- no existing resources
                        }).fetchFullSnapshotInLegacyFormat(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new AggregateNotFoundError(instance.getCompositeIdentifier()),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the resource already has a transcript`, () => {
                it('should fail with the expected error', async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => buildValidCommandFSA(instance),
                        systemUserId,
                        initialState: new DeluxeInMemoryStore({
                            [instance.type]: [audioItemWithTranscript],
                        }).fetchFullSnapshotInLegacyFormat(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new CannotOverwriteTranscriptError(
                                        instance.getCompositeIdentifier()
                                    ),
                                ])
                            );
                        },
                    });
                });
            });
        });
    });

    // videos
    describe(`when working with a resource of type: ${formatAggregateType(
        AggregateType.video
    )}`, () => {
        const instance = existingVideo;

        const videoWithTranscript = Video.fromEventHistory(
            videoCreated
                .andThen<TranscriptCreated>({
                    type: 'TRANSCRIPT_CREATED',
                })
                .as({
                    type: AggregateType.video,
                    id: videoId,
                }),
            videoId
        ) as Video;

        describe(`when the command is valid`, () => {
            describe(`when adding a transcript`, () => {
                it('should succeed with the expected database updates', async () => {
                    await assertCommandSuccess(assertionHelperDependencies, {
                        systemUserId,
                        initialState: validInitialState,
                        buildValidCommandFSA: () => buildValidCommandFSA(instance),
                        checkStateOnSuccess: async ({
                            aggregateCompositeIdentifier: { id },
                        }: CreateTranscript) => {
                            const resourceSearchResult = await testRepositoryProvider
                                .forResource<AudioItem | Video>(AggregateType.video)
                                .fetchById(id);

                            expect(resourceSearchResult).not.toBe(NotFound);

                            expect(resourceSearchResult).not.toBeInstanceOf(InternalError);

                            const updatedResource = resourceSearchResult as unknown as
                                | AudioItem
                                | Video;

                            expect(updatedResource.hasTranscript()).toBe(true);

                            assertEventRecordPersisted(
                                updatedResource,
                                'TRANSCRIPT_CREATED',
                                systemUserId
                            );
                        },
                    });
                });
            });
        });

        describe(`when the command is invalid`, () => {
            describe(`when there is no resource with the given aggregateCompositeIdentifier`, () => {
                it('should fail with the expected error', async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => buildValidCommandFSA(instance),
                        systemUserId,
                        initialState: new DeluxeInMemoryStore({
                            // empty- no existing resources
                        }).fetchFullSnapshotInLegacyFormat(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new AggregateNotFoundError(instance.getCompositeIdentifier()),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the resource already has a transcript`, () => {
                it('should fail with the expected error', async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => buildValidCommandFSA(instance),
                        systemUserId,
                        initialState: new DeluxeInMemoryStore({
                            [instance.type]: [videoWithTranscript],
                        }).fetchFullSnapshotInLegacyFormat(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new CannotOverwriteTranscriptError(
                                        instance.getCompositeIdentifier()
                                    ),
                                ])
                            );
                        },
                    });
                });
            });
        });
    });

    /**
     * TODO refactor to remove this test builder pattern so we can levarge
     * `.only` and `.skip` to isolate test cases.
     */
    // validResourcesForTests.forEach((instance) => {
    //     const resourceType = instance.type;

    //     describe(`when working with a resource of type: ${formatAggregateType(
    //         resourceType
    //     )}`, () => {
    //         describe(`when the command is valid`, () => {
    //             describe(`when adding a transcript`, () => {
    //                 it('should succeed with the expected database updates', async () => {
    //                     await assertCommandSuccess(assertionHelperDependencies, {
    //                         systemUserId,
    //                         initialState: validInitialState,
    //                         buildValidCommandFSA: () => buildValidCommandFSA(instance),
    //                         checkStateOnSuccess: async ({
    //                             aggregateCompositeIdentifier: { id },
    //                         }: CreateTranscript) => {
    //                             const resourceSearchResult = await testRepositoryProvider
    //                                 .forResource<AudioItem | Video>(resourceType)
    //                                 .fetchById(id);

    //                             expect(resourceSearchResult).not.toBe(NotFound);

    //                             expect(resourceSearchResult).not.toBeInstanceOf(InternalError);

    //                             const updatedResource = resourceSearchResult as unknown as
    //                                 | AudioItem
    //                                 | Video;

    //                             expect(updatedResource.hasTranscript()).toBe(true);

    //                             assertEventRecordPersisted(
    //                                 updatedResource,
    //                                 'TRANSCRIPT_CREATED',
    //                                 systemUserId
    //                             );
    //                         },
    //                     });
    //                 });
    //             });
    //         });

    //         describe(`when the command is invalid`, () => {
    //             describe(`when the payload has an invalid type`, () => {
    //                 describe('when the command payload type is invalid', () => {
    //                     generateCommandFuzzTestCases(CreateTranscript).forEach(
    //                         ({ description, propertyName, invalidValue }) => {
    //                             describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
    //                                 it('should fail with the appropriate error', async () => {
    //                                     await assertCommandFailsDueToTypeError(
    //                                         assertionHelperDependencies,
    //                                         { propertyName, invalidValue },
    //                                         buildValidCommandFSA(instance)
    //                                     );
    //                                 });
    //                             });
    //                         }
    //                     );
    //                 });
    //             });

    //             describe(`when there is no resource with the given aggregateCompositeIdentifier`, () => {
    //                 it('should fail with the expected error', async () => {
    //                     await assertCommandError(assertionHelperDependencies, {
    //                         buildCommandFSA: () => buildValidCommandFSA(instance),
    //                         systemUserId,
    //                         initialState: new DeluxeInMemoryStore({
    //                             // empty- no existing resources
    //                         }).fetchFullSnapshotInLegacyFormat(),
    //                         checkError: (error) => {
    //                             assertErrorAsExpected(
    //                                 error,
    //                                 new CommandExecutionError([
    //                                     new AggregateNotFoundError(
    //                                         instance.getCompositeIdentifier()
    //                                     ),
    //                                 ])
    //                             );
    //                         },
    //                     });
    //                 });
    //             });

    //             describe(`when the resource already has a transcript`, () => {
    //                 it('should fail with the expected error', async () => {
    //                     await assertCommandError(assertionHelperDependencies, {
    //                         buildCommandFSA: () => buildValidCommandFSA(instance),
    //                         systemUserId,
    //                         initialState: new DeluxeInMemoryStore({
    //                             [instance.type]: [],
    //                         }).fetchFullSnapshotInLegacyFormat(),
    //                         checkError: (error) => {
    //                             assertErrorAsExpected(
    //                                 error,
    //                                 new CommandExecutionError([
    //                                     new CannotOverwriteTranscriptError(
    //                                         instance.getCompositeIdentifier()
    //                                     ),
    //                                 ])
    //                             );
    //                         },
    //                     });
    //                 });
    //             });
    //         });
    //     });
    // });
});
