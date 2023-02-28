import { LanguageCode, ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../../types/DTO';
import formatAggregateType from '../../../../../../view-models/presentation/formatAggregateType';
import {
    MultilingualText,
    MultilingualTextItemRole,
} from '../../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFSAFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { AudioItem } from '../../../entities/audio-item.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { Video } from '../../../entities/video.entity';
import { TranscriptLineItemOutOfBoundsError } from '../../../errors';
import { MultilingualTextHasNoOriginalError } from '../../../errors/multilingual-text-has-no-original.error';
import { MultipleOriginalsInMultilingualTextError } from '../../../errors/multiple-originals-in-multilingual-text.error';
import { CannotAddInconsistentLineItemError } from '../../../errors/transcript-line-item/cannot-add-inconsistent-line-item.error';
import { TranscriptParticipantInitialsNotRegisteredError } from '../../../errors/transcript-participant-initials-not-registered.error';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';

const commandType = `ADD_LINE_ITEM_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const systemUserId = buildDummyUuid(464);

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const existingVideo = getValidAggregateInstanceForTest(AggregateType.video);

const validAudiovisualItems = [existingAudioItem, existingVideo];

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

    validAudiovisualItems.forEach((validInstance) => {
        describe(`when transcribing a ${formatAggregateType(validInstance.type)}`, () => {
            const [startTime, endTime] = validInstance.getTimeBounds();

            const audioLength = endTime - startTime;

            const numberOfTimestampsToGenerate = 10;

            // offset to avoid collisions
            const epsilon = 0.0001;

            const allTimestamps = Array(numberOfTimestampsToGenerate)
                .fill(0)
                .map((_, index) => [
                    startTime + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
                    startTime +
                        ((index + 1) * audioLength) / numberOfTimestampsToGenerate -
                        epsilon,
                ]);

            const dummyText = new MultilingualText({
                items: [
                    {
                        languageCode: LanguageCode.Chilcotin,
                        text: 'lha lha lha',
                        role: MultilingualTextItemRole.original,
                    },
                    {
                        languageCode: LanguageCode.English,
                        text: 'bla bla bla',
                        role: MultilingualTextItemRole.literalTranslation,
                    },
                ],
            });

            const buildValidCommandFSA = (
                validInstance: AudioItem | Video
            ): FluxStandardAction<AddLineItemToTranscript> => ({
                type: commandType,
                payload: {
                    aggregateCompositeIdentifier:
                        validInstance.getCompositeIdentifier() as ResourceCompositeIdentifier<
                            typeof ResourceType.audioItem | typeof ResourceType.video
                        >,
                    inPointMilliseconds: allTimestamps[0][0],
                    outPointMilliseconds: allTimestamps[0][1],
                    text: dummyText,
                    speakerInitials: validInstance.transcript.participants[0].initials,
                },
            });

            const validInitialState = new DeluxeInMemoryStore({
                [validInstance.type]: [validInstance],
            }).fetchFullSnapshotInLegacyFormat();

            const multilingualTextWithMultipleOriginalItems: DTO<MultilingualText> = {
                items: [
                    {
                        role: MultilingualTextItemRole.original,
                        text: 'bla bla',
                        languageCode: LanguageCode.English,
                    },
                    {
                        role: MultilingualTextItemRole.original,
                        text: 'bla bla',
                        languageCode: LanguageCode.Haida,
                    },
                ],
            };

            const validCommandFSA = buildValidCommandFSA(validInstance);

            const commandFSAFactory = new DummyCommandFSAFactory(() => validCommandFSA);

            const commandFsaWithMultipleOriginalTextItems = commandFSAFactory.build(
                validCommandFSA.payload.aggregateCompositeIdentifier.id,
                {
                    aggregateCompositeIdentifier:
                        validCommandFSA.payload.aggregateCompositeIdentifier,
                    text: multilingualTextWithMultipleOriginalItems,
                }
            );

            const multilingualTextWithNoOriginalItems: DTO<MultilingualText> = {
                items: [
                    {
                        role: MultilingualTextItemRole.freeTranslation,
                        text: 'bla bla',
                        languageCode: LanguageCode.English,
                    },
                ],
            };

            const commandFsaNoOriginalTextItems = commandFSAFactory.build(
                validCommandFSA.payload.aggregateCompositeIdentifier.id,
                {
                    aggregateCompositeIdentifier:
                        validCommandFSA.payload.aggregateCompositeIdentifier,
                    text: multilingualTextWithNoOriginalItems,
                }
            );

            const multilingualTextWithDuplicateLanguageItems: DTO<MultilingualText> = {
                items: [
                    {
                        role: MultilingualTextItemRole.freeTranslation,
                        text: 'bla bla',
                        languageCode: LanguageCode.English,
                    },
                    {
                        role: MultilingualTextItemRole.original,
                        text: 'bla bla',
                        languageCode: LanguageCode.English,
                    },
                ],
            };

            const commandFsaWithDuplicateItemsForSingleLanguage = commandFSAFactory.build(
                validCommandFSA.payload.aggregateCompositeIdentifier.id,
                {
                    aggregateCompositeIdentifier:
                        validCommandFSA.payload.aggregateCompositeIdentifier,
                    text: multilingualTextWithDuplicateLanguageItems,
                }
            );

            describe(`when the command is valid`, () => {
                it(`should succeed with the expected database udpates`, async () => {
                    await assertCommandSuccess(assertionHelperDependencies, {
                        systemUserId,
                        buildValidCommandFSA: () => validCommandFSA,
                        initialState: validInitialState,
                    });
                });
            });

            describe(`when the command is invalid`, () => {
                describe('when the command payload type is invalid', () => {
                    generateCommandFuzzTestCases(AddLineItemToTranscript).forEach(
                        ({ description, propertyName, invalidValue }) => {
                            describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                                it('should fail with the appropriate error', async () => {
                                    await assertCommandFailsDueToTypeError(
                                        assertionHelperDependencies,
                                        { propertyName, invalidValue },
                                        commandFSAFactory.build(buildDummyUuid(789), {
                                            [propertyName]: invalidValue,
                                        })
                                    );
                                });
                            });
                        }
                    );
                });

                describe(`when the refrenced ${formatAggregateType(
                    validInstance.type
                )} does not exist`, () => {
                    it('should fail with the expected error', async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: new DeluxeInMemoryStore(
                                {}
                            ).fetchFullSnapshotInLegacyFormat(),
                            buildCommandFSA: () => validCommandFSA,
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new AggregateNotFoundError(
                                            validCommandFSA.payload.aggregateCompositeIdentifier
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when the inPoint is out of bounds`, () => {
                    it(`should fail with the expected error`, async () => {
                        const inPointMilliseconds = validInstance.lengthMilliseconds + 100;

                        const outPointMilliseconds = validInstance.lengthMilliseconds + 200;

                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () =>
                                commandFSAFactory.build(null, {
                                    inPointMilliseconds,
                                    outPointMilliseconds,
                                }),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new TranscriptLineItemOutOfBoundsError(
                                            new TranscriptItem({
                                                inPoint: inPointMilliseconds,
                                                outPoint: outPointMilliseconds,
                                                text: validCommandFSA.payload.text,
                                                speakerInitials:
                                                    validCommandFSA.payload.speakerInitials,
                                            }),
                                            validInstance.getTimeBounds()
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when the outPoint is out of bounds`, () => {
                    it(`should fail with the expected error`, async () => {
                        const inPointMilliseconds = 1;

                        const outPointMilliseconds = validInstance.lengthMilliseconds + 1;

                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () =>
                                commandFSAFactory.build(null, {
                                    inPointMilliseconds,
                                    outPointMilliseconds,
                                }),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new TranscriptLineItemOutOfBoundsError(
                                            new TranscriptItem({
                                                inPoint: inPointMilliseconds,
                                                outPoint: outPointMilliseconds,
                                                text: validCommandFSA.payload.text,
                                                speakerInitials:
                                                    validCommandFSA.payload.speakerInitials,
                                            }),
                                            validInstance.getTimeBounds()
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when the inPoint and outPoint are out of order`, () => {
                    it(`should fail with the expected error`, async () => {
                        const inPointMilliseconds = validInstance.lengthMilliseconds / 2;

                        // outPoint is within bounds, but smaller than inPoint
                        const outPointMilliseconds = validInstance.lengthMilliseconds / 4;

                        const newLineItem = new TranscriptItem({
                            inPoint: inPointMilliseconds,
                            outPoint: outPointMilliseconds,
                            speakerInitials: validCommandFSA.payload.speakerInitials,
                            text: validCommandFSA.payload.text,
                        });

                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () =>
                                commandFSAFactory.build(null, {
                                    inPointMilliseconds,
                                    outPointMilliseconds,
                                }),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new CannotAddInconsistentLineItemError(newLineItem, [
                                            // TODO validate nested innerErrors further
                                        ]),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when the initials are not registered`, () => {
                    it(`should fail with the expected error`, async () => {
                        const bogusInitials = 'BOGUS';

                        const inPointMilliseconds = validInstance.lengthMilliseconds / 4;

                        const outPointMilliseconds = validInstance.lengthMilliseconds / 2;

                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () =>
                                commandFSAFactory.build(null, {
                                    speakerInitials: bogusInitials,
                                    inPointMilliseconds,
                                    outPointMilliseconds,
                                }),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new CannotAddInconsistentLineItemError(
                                            new TranscriptItem({
                                                inPoint: inPointMilliseconds,
                                                outPoint: outPointMilliseconds,
                                                speakerInitials: bogusInitials,
                                                text: validCommandFSA.payload.text,
                                            }),
                                            [
                                                new TranscriptParticipantInitialsNotRegisteredError(
                                                    bogusInitials
                                                ),
                                            ]
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when there is more than one text item with the role "original"`, () => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () => commandFsaWithMultipleOriginalTextItems,
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        /**
                                         * TODO Check inner errors. The nesting is starting
                                         * to get pretty deep. We need to deal with this
                                         * both from the test point of view but also as a
                                         * matter of UX.
                                         */
                                    ])
                                );

                                const expectedNestedError =
                                    new MultipleOriginalsInMultilingualTextError(
                                        commandFsaWithMultipleOriginalTextItems.payload.text.items
                                            .filter(
                                                ({ role }) =>
                                                    role === MultilingualTextItemRole.original
                                            )
                                            .map(({ languageCode }) => languageCode)
                                    );

                                expect(error.toString().includes(expectedNestedError.toString()));
                            },
                        });
                    });
                });

                describe(`when there is no text item with the role "original"`, () => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () => commandFsaNoOriginalTextItems,
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        /**
                                         * TODO Check inner errors. The nesting is starting
                                         * to get pretty deep. We need to deal with this
                                         * both from the test point of view but also as a
                                         * matter of UX.
                                         */
                                    ])
                                );

                                const expectedNestedError =
                                    new MultilingualTextHasNoOriginalError();

                                expect(error.toString().includes(expectedNestedError.toString()));
                            },
                        });
                    });
                });

                describe(`when there are multiple items with the same language`, () => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildCommandFSA: () => commandFsaWithDuplicateItemsForSingleLanguage,
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        /**
                                         * TODO Check inner errors. The nesting is starting
                                         * to get pretty deep. We need to deal with this
                                         * both from the test point of view but also as a
                                         * matter of UX.
                                         */
                                    ])
                                );

                                const expectedNestedError =
                                    new MultilingualTextHasNoOriginalError();

                                expect(error.toString().includes(expectedNestedError.toString()));
                            },
                        });
                    });
                });
            });
        });
    });
});
