import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../../test-data/commands';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { AudioVisualCompositeIdentifier } from '../../../entities/audio-item-composite-identifier';
import { AudioItem } from '../../../entities/audio-item.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { Video } from '../../../entities/video.entity';
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

const translation = `this is what was said (in English)`;

const translationLanguageCode = LanguageCode.English;

const buildValidFsa = (
    existingTranscribableResource: AudioItem | Video
): CommandFSA<TranslateLineItem> =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier:
                existingTranscribableResource.getCompositeIdentifier() as AudioVisualCompositeIdentifier,
            inPointMilliseconds:
                existingTranscribableResource.transcript.items[0].inPointMilliseconds,
            outPointMilliseconds:
                existingTranscribableResource.transcript.items[0].outPointMilliseconds,
            translation,
            languageCode: translationLanguageCode,
        },
    });

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
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

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected database updates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                initialState: new DeluxeInMemoryStore({
                    [existingAudioItem.type]: [existingAudioItem],
                }).fetchFullSnapshotInLegacyFormat(),
                buildValidCommandFSA: () => buildValidFsa(existingAudioItem),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        const commandFsaFactory = new DummyCommandFsaFactory(() =>
            buildValidFsa(existingAudioItem)
        );

        describe(`when the audio-visual resource does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => buildValidFsa(existingAudioItem),
                });
            });
        });

        describe(`when the line item already has text in this language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [existingAudioItem.type]: [
                            existingAudioItem.clone({
                                transcript: existingAudioItem.transcript.clone({
                                    items: [
                                        new TranscriptItem({
                                            inPointMilliseconds: 0,
                                            outPointMilliseconds: 0.001,
                                            speakerInitials: targetSpeakerInitials,
                                            text: buildMultilingualTextWithSingleItem(
                                                'I already have text in this language',
                                                translationLanguageCode
                                            ),
                                        }),
                                    ],
                                }),
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => buildValidFsa(existingAudioItem),
                });
            });
        });

        describe(`when the in point does not match an existing line item`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [existingAudioItem.type]: [existingAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            inPointMilliseconds: existingLineItem.getTimeBounds[0] + 0.0345,
                        }),
                });
            });
        });

        describe(`when the out point does not match an existing line item`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [existingAudioItem.type]: [existingAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            outPointMilliseconds: existingLineItem.getTimeBounds[1] - 0.0345,
                        }),
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
                                commandFsaFactory.build(buildDummyUuid(789), {
                                    [propertyName]: invalidValue,
                                })
                            );
                        });
                    });
                }
            );
        });
    });
});
