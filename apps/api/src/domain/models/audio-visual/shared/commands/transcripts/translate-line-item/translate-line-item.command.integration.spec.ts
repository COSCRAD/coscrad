import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import assertErrorAsExpected from '../../../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../../../test-data/commands';
import { TestEventStream } from '../../../../../../../test-data/events';
import getValidAggregateInstanceForTest from '../../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../../../../common/entities/errors';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../../shared/common-command-errors/CommandExecutionError';
import { AudioItemCreated } from '../../../../audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioVisualCompositeIdentifier } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { LineItemNotFoundError } from '../../../transcript-errors/line-item-not-found.error';
import { LineItemAddedToTranscript } from '../add-line-item-to-transcript/line-item-added-to-transcript.event';
import { ParticipantAddedToTranscript } from '../add-participant-to-transcript/participant-added-to-transcript.event';
import { TranscriptCreated } from '../create-transcript/transcript-created.event';
import { TranslateLineItem } from './translate-line-item.command';

const commandType = `TRANSLATE_LINE_ITEM`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const dummyFsaMap = buildTestCommandFsaMap();

const dummyFsa = dummyFsaMap.get(commandType) as CommandFSA<TranslateLineItem>;

const targetSpeakerInitials = 'AP';

const translation = `this is what was said (in English)`;

const translationLanguageCode = LanguageCode.English;

const originalLanguageCode = LanguageCode.Chilcotin;

const audioItemId = buildDummyUuid(1);

const existingMultilingualText = new MultilingualText({
    items: [
        new MultilingualTextItem({
            text: 'this is what was said (language)',
            languageCode: originalLanguageCode,
            role: MultilingualTextItemRole.original,
        }),
    ],
});

const existingLineItem = new TranscriptItem({
    inPointMilliseconds: 1000.56,
    outPointMilliseconds: 3055.33,
    text: existingMultilingualText,
    speakerInitials: targetSpeakerInitials,
});

const existingTranscript = new Transcript({
    participants: [targetSpeakerInitials, 'JB'].map(
        (initials) =>
            new TranscriptParticipant({
                initials,
                name: `name of participant with initials: ${initials}`,
            })
    ),
    items: [existingLineItem],
});

const audioCompositeId = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const participantAdded = audioItemCreated
    .andThen<TranscriptCreated>({
        type: 'TRANSCRIPT_CREATED',
    })
    .andThen<ParticipantAddedToTranscript>({
        type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
        payload: {
            initials: targetSpeakerInitials,
            name: 'Target McSpeaker',
        },
    });

const lineItemAddedToAudioTranscript = participantAdded
    .andThen<ParticipantAddedToTranscript>({
        type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
        payload: {
            initials: 'JB',
            name: 'Jay Bam',
        },
    })
    .andThen<LineItemAddedToTranscript>({
        type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
        payload: {
            inPointMilliseconds: existingLineItem.inPointMilliseconds,
            outPointMilliseconds: existingLineItem.outPointMilliseconds,
            speakerInitials: targetSpeakerInitials,
            languageCode: originalLanguageCode,
            text: existingLineItem.text.getOriginalTextItem().text,
        },
    });

const existingAudioItem = AudioItem.fromEventHistory(
    lineItemAddedToAudioTranscript.as(audioCompositeId),
    audioItemId
) as AudioItem;

const _existingVideoItem = getValidAggregateInstanceForTest(AggregateType.video).clone({
    transcript: existingTranscript,
});

const buildValidFsa = (
    existingTranscribibleResource: AudioItem | Video
): CommandFSA<TranslateLineItem> =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier:
                existingTranscribibleResource.getCompositeIdentifier() as AudioVisualCompositeIdentifier,
            inPointMilliseconds:
                existingTranscribibleResource.transcript.items[0].inPointMilliseconds,
            outPointMilliseconds:
                existingTranscribibleResource.transcript.items[0].outPointMilliseconds,
            translation,
            languageCode: translationLanguageCode,
        },
    });

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
                ARANGO_DB_NAME: testDatabaseName,
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

    describe(`when the command is valid`, () => {
        describe(`when transcribing an audio item`, () => {
            const existingTranscribibleResource = existingAudioItem;

            it(`should succeed with the expected database updates`, async () => {
                await assertCommandSuccess(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [existingTranscribibleResource.type]: [existingTranscribibleResource],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildValidCommandFSA: () => buildValidFsa(existingTranscribibleResource),
                    checkStateOnSuccess: async ({
                        aggregateCompositeIdentifier: { id },
                        translation,
                    }: TranslateLineItem) => {
                        const searchResult = await testRepositoryProvider
                            .forResource(existingTranscribibleResource.type)
                            .fetchById(id);

                        expect(searchResult).not.toBe(NotFound);

                        expect(searchResult).not.toBeInstanceOf(InternalError);

                        const resource = searchResult as AudioItem | Video;

                        const plainTextTranscript = resource.transcript.toString();

                        const plainTextThatDoesNotIncludeNewLineItem = [plainTextTranscript].filter(
                            (text) => !text.includes(translation)
                        );

                        expect(plainTextThatDoesNotIncludeNewLineItem).toEqual([]);

                        assertEventRecordPersisted(
                            resource,
                            `LINE_ITEM_TRANSLATED`,
                            dummySystemUserId
                        );
                    },
                });
            });
        });

        describe(`when transcribing a video`, () => {
            it.todo(`should have a test`);
        });
    });

    describe(`when the command is invalid`, () => {
        const existingTranscribibleResource = existingAudioItem;

        const commandFsaFactory = new DummyCommandFsaFactory(() =>
            buildValidFsa(existingTranscribibleResource)
        );

        describe(`when transcribing an audio item`, () => {
            describe(`when the audio-visual resource does not exist`, () => {
                it(`should fail with the expected error`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                        buildCommandFSA: () => buildValidFsa(existingTranscribibleResource),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new AggregateNotFoundError(existingTranscribibleResource),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the line item already has text in this language`, () => {
                it(`should fail with the expected errors`, async () => {
                    const existingText = 'I already have text in this language';

                    const existingMultilingualText = buildMultilingualTextWithSingleItem(
                        existingText,
                        translationLanguageCode
                    );

                    const fsa = buildValidFsa(existingTranscribibleResource);

                    const { payload } = fsa;

                    const audioItemWithExistingOriginalTextInTargetLanguage =
                        AudioItem.fromEventHistory(
                            participantAdded
                                .andThen<LineItemAddedToTranscript>({
                                    type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
                                    payload: {
                                        // note that this is the original language code for the existing transcript item
                                        languageCode: fsa.payload.languageCode,
                                        speakerInitials: targetSpeakerInitials,
                                        inPointMilliseconds: fsa.payload.inPointMilliseconds,
                                        outPointMilliseconds: fsa.payload.outPointMilliseconds,
                                        text: existingText,
                                    },
                                })
                                .as(audioCompositeId),
                            audioItemId
                        ) as AudioItem;

                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore({
                                    [existingTranscribibleResource.type]: [
                                        audioItemWithExistingOriginalTextInTargetLanguage,
                                    ],
                                }).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                languageCode: LanguageCode.English,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new CannotAddDuplicateTranslationError(
                                        new MultilingualTextItem({
                                            text: payload.translation,
                                            languageCode: payload.languageCode,
                                            role: MultilingualTextItemRole.freeTranslation,
                                        }),
                                        existingMultilingualText
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the in point does not match an existing line item`, () => {
                const inPointMilliseconds = existingLineItem.getTimeBounds()[0] + 0.0345;

                const outPointMilliseconds = existingLineItem.getTimeBounds()[0];

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        initialState: new DeluxeInMemoryStore({
                            [existingTranscribibleResource.type]: [existingTranscribibleResource],
                        }).fetchFullSnapshotInLegacyFormat(),
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                inPointMilliseconds,
                                outPointMilliseconds,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new LineItemNotFoundError({
                                        inPointMilliseconds,
                                        outPointMilliseconds,
                                    }),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the out point does not match an existing line item`, () => {
                const inPointMilliseconds = existingLineItem.getTimeBounds()[0];

                const outPointMilliseconds = existingLineItem.getTimeBounds()[0] - 0.0345;

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        initialState: new DeluxeInMemoryStore({
                            [existingTranscribibleResource.type]: [existingTranscribibleResource],
                        }).fetchFullSnapshotInLegacyFormat(),
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                inPointMilliseconds,
                                outPointMilliseconds,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new LineItemNotFoundError({
                                        inPointMilliseconds,
                                        outPointMilliseconds,
                                    }),
                                ])
                            );
                        },
                    });
                });
            });
        });

        describe('when the command payload type is invalid', () => {
            describe(`when the aggregate composite identifier has an invalid type`, () => {
                const transcribibleResourceTypes: AggregateType[] = [
                    AggregateType.audioItem,
                    AggregateType.video,
                ];

                Object.values(AggregateType)
                    .filter((t) => !transcribibleResourceTypes.includes(t))
                    .forEach((invalidType) => {
                        describe(`type: ${invalidType}`, () => {
                            it(`should fail with the expected type error`, async () => {
                                await assertCommandFailsDueToTypeError(
                                    assertionHelperDependencies,
                                    {
                                        propertyName: 'aggregateCompositeIdentifier',
                                        invalidValue: {
                                            type: invalidType,
                                            // the ID is irrelevant since the command wail fail at a type error
                                            id: buildDummyUuid(123),
                                        },
                                    },
                                    buildValidFsa(existingAudioItem)
                                );
                            });
                        });
                    });
            });

            generateCommandFuzzTestCases(TranslateLineItem).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                buildValidFsa(existingAudioItem)
                            );
                        });
                    });
                }
            );
        });
    });
});
