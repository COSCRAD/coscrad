import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DigitalText } from '../../entities';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import {
    DigitalTextPageImportRecord,
    ImportPagesToDigitalText,
} from './import-pages-to-digital-text.command';

const commandType = 'IMPORT_PAGES_TO_DIGITAL_TEXT';

const photographId = buildDummyUuid(1);

const digitalTextId = buildDummyUuid(2);

const audioItemIdForOriginalLanguage = buildDummyUuid(3);

const audioItemIdForTranslationLanguage = buildDummyUuid(4);

const dummyAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

// TODO event source these
const audioItems = [audioItemIdForOriginalLanguage, audioItemIdForTranslationLanguage].map((id) =>
    dummyAudioItem.clone({
        id,
        name: buildMultilingualTextWithSingleItem(`audio number: ${id}`),
    })
);

const photograph = getValidAggregateInstanceForTest(AggregateType.photograph).clone({
    id: photographId,
});

const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
    type: 'DIGITAL_TEXT_CREATED',
});

const eventHistoryForDigitalText =
    // note the absence of a `PAGE_ADDED_TO_DIGITAL_TEXT`- we need this digital text to be empty for the import to work
    digitalTextCreated.as({
        type: AggregateType.digitalText,
        id: digitalTextId,
    });

const pageAddedToDigitalText = digitalTextCreated.andThen<PageAddedToDigitalText>({
    type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
});

const textContent = 'hello world';

const translation = 'hello world translated';

const originalLangaugeCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.Chinook;

const pageIdentifier = '1v';

const existingDigitalText = DigitalText.fromEventHistory(
    eventHistoryForDigitalText,
    digitalTextId
) as DigitalText;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<ImportPagesToDigitalText>;

const multiplePagesToImport: DigitalTextPageImportRecord[] = ['X', 'XI', 'XII', 'XIII'].map(
    (pageIdentifier) => ({
        pageIdentifier,
        content: [
            {
                text: `text for page: ${pageIdentifier}`,
                languageCode: originalLangaugeCode,
                isOriginalLanguage: true,
                // no audioItemId
            },
            {
                text: `translation for page: ${pageIdentifier}`,
                languageCode: translationLanguageCode,
                isOriginalLanguage: false,
            },
        ],
        // no photographId
    })
);

const commandFsaFactory = new DummyCommandFsaFactory<ImportPagesToDigitalText>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier: existingDigitalText.getCompositeIdentifier(),
            pages: [
                {
                    pageIdentifier,
                    content: [
                        {
                            text: textContent,
                            languageCode: originalLangaugeCode,
                            audioItemId: audioItemIdForOriginalLanguage,
                            isOriginalLanguage: true,
                        },
                        {
                            text: translation,
                            languageCode: translationLanguageCode,
                            isOriginalLanguage: false,
                            audioItemId: audioItemIdForTranslationLanguage,
                        },
                    ],
                    photographId,
                },
            ],
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

    const seedValidInitialState = async () => {
        await app.get(ArangoEventRepository).appendEvents(eventHistoryForDigitalText);

        await testRepositoryProvider.forResource(AggregateType.audioItem).createMany(audioItems);

        await testRepositoryProvider.forResource(AggregateType.photograph).create(photograph);
    };

    describe(`when the command is valid`, () => {
        describe(`when all properties are specified`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA: () => commandFsaFactory.build(),
                    seedInitialState: seedValidInitialState,
                    checkStateOnSuccess: async () => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = digitalTextSearchResult as DigitalText;

                        const pageSearch = updatedDigitalText.getPage(pageIdentifier);

                        expect(pageSearch).toBeInstanceOf(DigitalTextPage);

                        const targetPage = pageSearch as DigitalTextPage;

                        const pageContent = targetPage.getContent() as MultilingualText;

                        const originalTextSearch = pageContent.getOriginalTextItem();

                        expect(originalTextSearch.text).toBe(textContent);

                        expect(originalTextSearch.languageCode).toBe(originalLangaugeCode);

                        const translationTextSearch =
                            pageContent.getTranslation(translationLanguageCode);

                        expect(translationTextSearch).toBeInstanceOf(MultilingualTextItem);

                        const {
                            text: foundTranslationText,
                            languageCode: foundTranslationLanguageCode,
                        } = translationTextSearch as MultilingualTextItem;

                        expect(foundTranslationText).toBe(translation);

                        expect(foundTranslationLanguageCode).toBe(translationLanguageCode);

                        expect(targetPage.getAudioIn(originalLangaugeCode)).toBe(
                            audioItemIdForOriginalLanguage
                        );

                        expect(targetPage.getAudioIn(translationLanguageCode)).toBe(
                            audioItemIdForTranslationLanguage
                        );

                        expect(targetPage.photographId).toBe(photographId);
                    },
                });
            });
        });

        describe(`when optional properties are omitted`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            // note that these omit the optional props photographId and audioId
                            pages: multiplePagesToImport,
                        }),
                    seedInitialState: seedValidInitialState,
                    checkStateOnSuccess: async () => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);

                        const updatedDigitalText = digitalTextSearchResult as DigitalText;

                        expect(updatedDigitalText.numberOfPages()).toBe(
                            multiplePagesToImport.length
                        );
                    },
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the digital text already has pages`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        app.get(ArangoEventRepository).appendEvents(
                            pageAddedToDigitalText.as({
                                id: digitalTextId,
                                type: AggregateType.digitalText,
                            })
                        );
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                });
            });
        });

        describe(`when the digital text does not exist`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // TODO why isn't the before each working?
                        await testRepositoryProvider.testSetup();

                        await testRepositoryProvider
                            .forResource(AggregateType.audioItem)
                            .createMany(audioItems);

                        await testRepositoryProvider
                            .forResource(AggregateType.photograph)
                            .create(photograph);
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    existingDigitalText.getCompositeIdentifier()
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when no pages are provided`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: seedValidInitialState,
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            pages: [],
                        }),
                });
            });
        });

        describe(`when the translation language is the same as the original language`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: seedValidInitialState,
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            pages: [{ originalLangaugeCode }],
                        }),
                });
            });
        });

        describe(`when no translation item is marked as the original`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: seedValidInitialState,
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            pages: [{ translationLanguageCode }],
                        }),
                });
            });
        });

        describe(`when an audio item ID is provided and the audio item does not exist`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(eventHistoryForDigitalText);

                        await testRepositoryProvider
                            .forResource(AggregateType.photograph)
                            .create(photograph);
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            pages: [
                                {
                                    pageIdentifier,
                                    content: [
                                        {
                                            text: textContent,
                                            languageCode: originalLangaugeCode,
                                            audioItemId: audioItemIdForOriginalLanguage,
                                            isOriginalLanguage: true,
                                        },
                                    ],
                                    photographId,
                                },
                            ],
                        }),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingDigitalText.getCompositeIdentifier(),
                                    [
                                        {
                                            type: AggregateType.audioItem,
                                            id: audioItemIdForOriginalLanguage,
                                        },
                                    ]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when a photograph ID is provided and the photograph does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(eventHistoryForDigitalText);

                        await testRepositoryProvider
                            .forResource(AggregateType.audioItem)
                            .createMany(audioItems);

                        // no photographs
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingDigitalText.getCompositeIdentifier(),
                                    [
                                        {
                                            type: AggregateType.photograph,
                                            id: photographId,
                                        },
                                    ]
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
