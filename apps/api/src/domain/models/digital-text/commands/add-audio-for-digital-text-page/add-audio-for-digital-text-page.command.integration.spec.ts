import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
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
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DigitalText } from '../../entities';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { ContentAddedToDigitalTextPage } from '../add-content-to-digital-text-page';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';

const commandType = 'ADD_AUDIO_FOR_DIGITAL_TEXT_PAGE';

// TODO make this helper fail with a more useful message
const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddAudioForDigitalTextPage>;

const languageCodeForContent = LanguageCode.Chilcotin;

const languageCodeWithoutContent = LanguageCode.English;

const audioItemId = buildDummyUuid(123);

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
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

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            const eventHistory = eventStreamForDigitalTextWithPageContent.as({
                id: digitalTextId,
            });

            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    // add the snapshot based audio item
                    await testRepositoryProvider
                        .forResource(ResourceType.audioItem)
                        .create(existingAudioItem);

                    // add the event-sourced digital text
                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
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

    describe(`when the command is invalid`, () => {
        describe(`when the digital text does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItem],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
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
                            .appendEvents(
                                eventStreamForDigitalTextWithPageContent.as(
                                    aggregateCompositeIdentifier
                                )
                            );

                        await testRepositoryProvider
                            .forResource(ResourceType.audioItem)
                            .create(existingAudioItem);
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
                        await app.get(ArangoEventRepository).appendEvents(
                            eventStreamForDigitalTextWithPageContent
                                .andThen<AudioAddedForDigitalTextPage>({
                                    type: `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`,
                                    payload: {
                                        pageIdentifier: existingPageIdentifier,
                                        audioItemId,
                                        languageCode: languageCodeForContent,
                                    },
                                })
                                .as(aggregateCompositeIdentifier)
                        );

                        await testRepositoryProvider
                            .forResource(ResourceType.audioItem)
                            .create(existingAudioItem);
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
