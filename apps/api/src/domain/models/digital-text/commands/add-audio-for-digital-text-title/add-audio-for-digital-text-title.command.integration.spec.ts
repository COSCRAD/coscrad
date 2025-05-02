import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { AudioItemCreated } from '../../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DigitalText } from '../../entities';
import { DigitalTextCreated } from '../digital-text-created.event';
import { DigitalTextTitleTranslated } from '../translate-digital-text-title';
import { AddAudioForDigitalTextTitle } from './add-audio-for-digital-text-title.command';
import { AudioAddedForDigitalTextTitle } from './audio-added-for-digital-text-title.event';

const commandType = 'ADD_AUDIO_FOR_DIGITAL_TEXT_TITLE';

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddAudioForDigitalTextTitle>;

const languageCodeForTitle = LanguageCode.Chilcotin;

const languageCodeForTitleTranslation = LanguageCode.English;

const audioItemId = buildDummyUuid(117);

const eventHistoryForAudioItem = new TestEventStream()
    .andThen<AudioItemCreated>({
        type: 'AUDIO_ITEM_CREATED',
    })
    .as({
        type: AggregateType.audioItem,
        id: audioItemId,
    });

const digitalTextId = dummyFsa.payload.aggregateCompositeIdentifier.id;

const aggregateCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const commandFsaFactory = new DummyCommandFsaFactory<AddAudioForDigitalTextTitle>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            languageCode: languageCodeForTitle,
            audioItemId,
        },
    })
);

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

    const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
        type: `DIGITAL_TEXT_CREATED`,
        payload: {
            languageCodeForTitle,
        },
    });

    const digitalTextTitleTranslated = digitalTextCreated.andThen<DigitalTextTitleTranslated>({
        type: `DIGITAL_TEXT_TITLE_TRANSLATED`,
        payload: {
            languageCode: languageCodeForTitleTranslation,
        },
    });

    const audioAddedForDigitalText =
        digitalTextTitleTranslated.andThen<AudioAddedForDigitalTextTitle>({
            type: `AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE`,
            payload: {
                audioItemId,
                languageCode: languageCodeForTitle,
            },
        });

    const validEventHistoryForDigitalTextWithNoTitleTranslationAndNoAudio = digitalTextCreated.as({
        id: digitalTextId,
    });

    describe(`when the command is valid`, () => {
        describe(`when the audio is for the original text title`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForAudioItem);

                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                validEventHistoryForDigitalTextWithNoTitleTranslationAndNoAudio
                            );
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: digitalTextId,
                            },
                        }),
                    checkStateOnSuccess: async () => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = digitalTextSearchResult as DigitalText;

                        const audioIdSearchResult =
                            updatedDigitalText.getAudioForTitleInLanguage(languageCodeForTitle);

                        expect(audioIdSearchResult).toBe(audioItemId);

                        assertEventRecordPersisted(
                            updatedDigitalText,
                            'AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE',
                            dummySystemUserId
                        );
                    },
                });
            });
        });

        describe(`when the audio is for the title's translation`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForAudioItem);

                        await app.get(ArangoEventRepository).appendEvents(
                            digitalTextTitleTranslated.as({
                                type: AggregateType.digitalText,
                                id: digitalTextId,
                            })
                        );
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: digitalTextId,
                            },
                            languageCode: languageCodeForTitleTranslation,
                        }),
                    checkStateOnSuccess: async () => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = digitalTextSearchResult as DigitalText;

                        const audioIdSearchResult = updatedDigitalText.getAudioForTitleInLanguage(
                            languageCodeForTitleTranslation
                        );

                        expect(audioIdSearchResult).toBe(audioItemId);

                        assertEventRecordPersisted(
                            updatedDigitalText,
                            'AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE',
                            dummySystemUserId
                        );
                    },
                });
            });
        });

        describe(`when the command is invalid`, () => {
            describe(`when the digital text does not exist`, () => {
                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await app
                                .get(ArangoEventRepository)
                                .appendEvents(eventHistoryForAudioItem);
                        },
                        buildCommandFSA: () => commandFsaFactory.build(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new AggregateNotFoundError(aggregateCompositeIdentifier),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the audio item does not exist`, () => {
                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await app
                                .get(ArangoEventRepository)
                                .appendEvents(
                                    validEventHistoryForDigitalTextWithNoTitleTranslationAndNoAudio
                                );
                        },
                        buildCommandFSA: () => commandFsaFactory.build(),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new InvalidExternalReferenceByAggregateError(
                                        aggregateCompositeIdentifier,
                                        [
                                            {
                                                type: AggregateType.audioItem,
                                                id: audioItemId,
                                            },
                                        ]
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the title does not have a translation in the given language`, () => {
                it(`should fail`, async () => {
                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await app
                                .get(ArangoEventRepository)
                                .appendEvents([
                                    ...validEventHistoryForDigitalTextWithNoTitleTranslationAndNoAudio,
                                    ...eventHistoryForAudioItem,
                                ]);
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                languageCode: LanguageCode.Chinook,
                            }),
                    });
                });
            });

            describe(`when there is already audio for this language`, () => {
                it(`should fail`, async () => {
                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await app.get(ArangoEventRepository).appendEvents(
                                audioAddedForDigitalText.as({
                                    type: AggregateType.digitalText,
                                    id: digitalTextId,
                                })
                            );

                            await app
                                .get(ArangoEventRepository)
                                .appendEvents(eventHistoryForAudioItem);
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                languageCode: languageCodeForTitle,
                            }),
                    });
                });
            });
        });
    });
});
