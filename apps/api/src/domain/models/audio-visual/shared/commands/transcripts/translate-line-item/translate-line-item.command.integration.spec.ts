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
import { AudioVisualCompositeIdentifier } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { LineItemNotFoundError } from '../../../transcript-errors/line-item-not-found.error';
import { TranslateLineItem } from './translate-line-item.command';

const commandType = `TRANSLATE_LINE_ITEM`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const dummyFsaMap = buildTestCommandFsaMap();

const dummyFsa = dummyFsaMap.get(commandType) as CommandFSA<TranslateLineItem>;

const targetSpeakerInitials = 'AP';

const existingMultilingualText = new MultilingualText({
    items: [
        new MultilingualTextItem({
            text: 'this is what was said (language)',
            languageCode: LanguageCode.Chilcotin,
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

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    transcript: existingTranscript,
});

const existingVideoItem = getValidAggregateInstanceForTest(AggregateType.video).clone({
    transcript: existingTranscript,
});

const translation = `this is what was said (in English)`;

const translationLanguageCode = LanguageCode.English;

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

    const existingTranscribibleResources = [existingAudioItem, existingVideoItem];

    const buildTranscribileResourceDescription = (
        existingTranscribibleResource: AudioItem | Video
    ) => `when transcribing a: ${existingTranscribibleResource.type}`;

    describe(`when the command is valid`, () => {
        existingTranscribibleResources.forEach((existingTranscribibleResource) => {
            describe(buildTranscribileResourceDescription(existingTranscribibleResource), () => {
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

                            const plainTextThatDoesNotIncludeNewLineItem = [
                                plainTextTranscript,
                            ].filter((text) => !text.includes(translation));

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
        });
    });

    describe(`when the command is invalid`, () => {
        existingTranscribibleResources.forEach((existingTranscribibleResource) => {
            const commandFsaFactory = new DummyCommandFsaFactory(() =>
                buildValidFsa(existingTranscribibleResource)
            );

            describe(buildTranscribileResourceDescription(existingTranscribibleResource), () => {
                describe(`when the audio-visual resource does not exist`, () => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            initialState: new DeluxeInMemoryStore(
                                {}
                            ).fetchFullSnapshotInLegacyFormat(),
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
                        const existingMultilingualText = buildMultilingualTextWithSingleItem(
                            'I already have text in this language',
                            translationLanguageCode
                        );

                        const fsa = buildValidFsa(existingTranscribibleResource);

                        const { payload } = fsa;

                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            initialState: new DeluxeInMemoryStore({
                                [existingTranscribibleResource.type]: [
                                    existingTranscribibleResource.clone({
                                        transcript: existingTranscribibleResource.transcript.clone({
                                            items: [
                                                new TranscriptItem({
                                                    inPointMilliseconds:
                                                        payload.inPointMilliseconds,
                                                    outPointMilliseconds:
                                                        payload.outPointMilliseconds,
                                                    speakerInitials: targetSpeakerInitials,
                                                    text: existingMultilingualText,
                                                }),
                                            ],
                                        }),
                                    }),
                                ],
                            }).fetchFullSnapshotInLegacyFormat(),
                            buildCommandFSA: () => fsa,
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
                                [existingTranscribibleResource.type]: [
                                    existingTranscribibleResource,
                                ],
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
                                [existingTranscribibleResource.type]: [
                                    existingTranscribibleResource,
                                ],
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
