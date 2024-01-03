import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { TestEventStream } from '../../../../../test-data/events/test-event-stream';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DIGITAL_TEXT_CREATED, PAGE_ADDED_TO_DIGITAL_TEXT } from '../../constants';
import { DigitalText } from '../../entities';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { ContentAddedToDigitalTextPage } from '../add-content-to-digital-text-page';
import { DigitalTextCreated } from '../events/digital-text-created.event';
import { PageAddedToDigitalText } from '../events/page-added-to-digital-text.event';
import { DigitalTextPageContentTranslated } from './digital-text-page-content-translated.event';
import { TranslateDigitalTextPageContent } from './translate-digital-text-page-content.command';

const commandType = `TRANSLATE_DIGITAL_TEXT_PAGE_CONTENT`;

const targetPageIdentifier = '17';

const digitalTextId = buildDummyUuid(1);

const digitalTextCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'translation';

const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
    type: DIGITAL_TEXT_CREATED,
    payload: {},
});

const pageAddedToDigitalText = digitalTextCreated.andThen<PageAddedToDigitalText>({
    type: PAGE_ADDED_TO_DIGITAL_TEXT,
    payload: {
        identifier: targetPageIdentifier,
    },
});

const contentAddedToDigitalTextPage = pageAddedToDigitalText.andThen<ContentAddedToDigitalTextPage>(
    {
        type: `CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE`,
        payload: {
            pageIdentifier: targetPageIdentifier,
            languageCode: originalLanguageCode,
        },
    }
);

const validPayload: TranslateDigitalTextPageContent = {
    aggregateCompositeIdentifier: digitalTextCompositeIdentifier,
    languageCode: translationLanguageCode,
    translation: translationText,
    pageIdentifier: targetPageIdentifier,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected database updates`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                seedInitialState: async () => {
                    const eventHistory = contentAddedToDigitalTextPage.as(
                        digitalTextCompositeIdentifier
                    );

                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                checkStateOnSuccess: async () => {
                    const digitalTextSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.digitalText)
                        .fetchById(digitalTextId);

                    expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);

                    const digitalText = digitalTextSearchResult as DigitalText;

                    const page = digitalText.getPage(targetPageIdentifier) as DigitalTextPage;

                    const translationResult = page.content.getTranslation(translationLanguageCode);

                    expect(translationResult).toBeInstanceOf(MultilingualTextItem);

                    const translationItem = translationResult as MultilingualTextItem;

                    expect(translationItem.text).toBe(translationText);
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
                        Promise.resolve();
                    },
                    buildCommandFSA: () => validCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(digitalTextCompositeIdentifier),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the digital text does not have a page with the given identifier`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(digitalTextCreated.as(digitalTextCompositeIdentifier));
                    },
                    buildCommandFSA: () => validCommandFSA,
                });
            });
        });

        describe(`when the target page does not have content`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                pageAddedToDigitalText.as(digitalTextCompositeIdentifier)
                            );
                    },
                    buildCommandFSA: () => validCommandFSA,
                });
            });
        });

        describe(`when the target page already has a translation in the given language`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(
                            contentAddedToDigitalTextPage
                                .andThen<DigitalTextPageContentTranslated>({
                                    type: 'DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED',
                                    payload: {
                                        languageCode: translationLanguageCode,
                                    },
                                })
                                .as(digitalTextCompositeIdentifier)
                        );
                    },
                    buildCommandFSA: () => validCommandFSA,
                });
            });
        });

        describe(`when the translation language is the same as the original language`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                contentAddedToDigitalTextPage.as(digitalTextCompositeIdentifier)
                            );
                    },
                    buildCommandFSA: () =>
                        new DummyCommandFsaFactory(() => validCommandFSA).build(undefined, {
                            languageCode: originalLanguageCode,
                        }),
                });
            });
        });
    });
});
