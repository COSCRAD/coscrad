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
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { AudioItemCreated } from '../../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DigitalText } from '../../entities';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { ContentAddedToDigitalTextPage } from '../add-content-to-digital-text-page';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { DigitalTextPageContentTranslated } from '../translate-digital-text-page-content';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

const commandType = 'ADD_AUDIO_FOR_DIGITAL_TEXT_PAGE';

// TODO[https://github.com/COSCRAD/coscrad/pull/525#discussion_r1434258838] make this helper fail with a more useful message
const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddAudioForDigitalTextPage>;

const languageCodeForContent = LanguageCode.Chilcotin;

const languageCodeWithoutContent = LanguageCode.English;

const translationLanguageCodeForContent = LanguageCode.Haida;

const audioItemId = buildDummyUuid(123);

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const eventHistoryForAudioItem = audioItemCreated.as({
    type: AggregateType.audioItem,
    id: audioItemId,
});

const existingPageIdentifier = `4`;

const digitalTextId = dummyFsa.payload.aggregateCompositeIdentifier.id;

const aggregateCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const commandFsaFactory = new DummyCommandFsaFactory<AddAudioForDigitalTextPage>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            languageCode: languageCodeForContent,
            pageIdentifier: existingPageIdentifier,
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

    const eventStreamForDigitalTextWithNoPages = new TestEventStream().andThen<DigitalTextCreated>({
        type: `DIGITAL_TEXT_CREATED`,
        payload: {},
    });

    const eventStreamForDigitalTextWithEmptyPage =
        eventStreamForDigitalTextWithNoPages.andThen<PageAddedToDigitalText>({
            type: `PAGE_ADDED_TO_DIGITAL_TEXT`,
            payload: {
                identifier: existingPageIdentifier,
            },
        });

    const eventStreamForDigitalTextWithPageContent =
        eventStreamForDigitalTextWithEmptyPage.andThen<ContentAddedToDigitalTextPage>({
            type: `CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE`,
            payload: {
                pageIdentifier: existingPageIdentifier,
                languageCode: languageCodeForContent,
            },
        });

    const eventStreamForDigitalTextWithTranslatedPageContent =
        eventStreamForDigitalTextWithPageContent
            // for good measure, we work with a digital text that already has audio for its original item
            .andThen<AudioAddedForDigitalTextPage>({
                type: `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`,
                payload: {
                    pageIdentifier: existingPageIdentifier,
                    languageCode: languageCodeForContent,
                },
            })
            .andThen<DigitalTextPageContentTranslated>({
                type: `DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`,
                payload: {
                    pageIdentifier: existingPageIdentifier,
                    languageCode: translationLanguageCodeForContent,
                },
            })
            // An extra translation that won't receive audio
            .andThen<DigitalTextPageContentTranslated>({
                type: `DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`,
                payload: {
                    pageIdentifier: existingPageIdentifier,
                    languageCode: LanguageCode.Chinook,
                },
            });

    describe(`when the command is valid`, () => {
        describe(`when the audio is for the original text item`, () => {
            it(`should succeed`, async () => {
                const eventHistoryForDigitalText = eventStreamForDigitalTextWithPageContent.as({
                    id: digitalTextId,
                });

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // add the digital text and audio item
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents([
                                ...eventHistoryForDigitalText,
                                ...eventHistoryForAudioItem,
                            ]);
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: digitalTextId,
                            },
                        }),
                    checkStateOnSuccess: async () => {
                        const searchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(searchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = searchResult as DigitalText;

                        const foundAudioItemId = (
                            updatedDigitalText.getPage(existingPageIdentifier) as DigitalTextPage
                        ).getAudioIn(languageCodeForContent);

                        expect(foundAudioItemId).toBe(audioItemId);
                    },
                });
            });
        });

        describe(`when the audio is for a translated text item`, () => {
            const audioIdForTranslatedContent = buildDummyUuid(920);

            it(`should succeed`, async () => {
                const eventHistory = eventStreamForDigitalTextWithTranslatedPageContent.as({
                    id: digitalTextId,
                });

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents([
                            ...eventHistory,
                            ...audioItemCreated.as({
                                type: AggregateType.audioItem,
                                id: audioIdForTranslatedContent,
                            }),
                        ]);
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: digitalTextId,
                            },
                            audioItemId: audioIdForTranslatedContent,
                            languageCode: translationLanguageCodeForContent,
                        }),
                    checkStateOnSuccess: async () => {
                        const searchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(searchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = searchResult as DigitalText;

                        const foundAudioItemId = (
                            updatedDigitalText.getPage(existingPageIdentifier) as DigitalTextPage
                        ).getAudioIn(translationLanguageCodeForContent);

                        expect(foundAudioItemId).toBe(audioIdForTranslatedContent);
                    },
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the digital text does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForAudioItem);
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

        describe(`when there is no page with the given identifier`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // TODO Stop using the concrete type for this
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                eventStreamForDigitalTextWithNoPages.as(
                                    aggregateCompositeIdentifier
                                )
                            );
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    // errors like this are already checked in the test for the corresponding udpate method
                });
            });
        });

        describe(`when the given page does not have content`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // TODO Stop using the concrete type for this
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                eventStreamForDigitalTextWithEmptyPage.as(
                                    aggregateCompositeIdentifier
                                )
                            );
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    // errors like this are already checked in the test for the corresponding udpate method
                });
            });
        });

        describe(`when the given page has content that is not translated into the target language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // TODO Stop using the concrete type for this
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents([
                                ...eventStreamForDigitalTextWithPageContent.as(
                                    aggregateCompositeIdentifier
                                ),
                                ...eventHistoryForAudioItem,
                            ]);
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            languageCode: languageCodeWithoutContent,
                        }),
                    // errors like this are already checked in the test for the corresponding udpate method
                });
            });
        });

        describe(`when the given page already has audio for the given language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // TODO Stop using the concrete type for this
                        await app.get(ArangoEventRepository).appendEvents([
                            ...eventStreamForDigitalTextWithPageContent
                                .andThen<AudioAddedForDigitalTextPage>({
                                    type: `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`,
                                    payload: {
                                        pageIdentifier: existingPageIdentifier,
                                        audioItemId,
                                        languageCode: languageCodeForContent,
                                    },
                                })
                                .as(aggregateCompositeIdentifier),
                            ...eventHistoryForAudioItem,
                        ]);
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            languageCode: languageCodeWithoutContent,
                        }),
                    // errors like this are already checked in the test for the corresponding udpate method
                });
            });
        });
    });
});
