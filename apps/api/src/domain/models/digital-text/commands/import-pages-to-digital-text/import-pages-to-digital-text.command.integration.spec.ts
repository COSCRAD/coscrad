import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { DigitalText } from '../../entities';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { DigitalTextCreated } from '../digital-text-created.event';
import { ImportPagesToDigitalText } from './import-pages-to-digital-text.command';

const commandType = 'IMPORT_PAGES_TO_DIGITAL_TEXT';

const photographId = buildDummyUuid(1);

const digitalTextId = buildDummyUuid(2);

const audioItemIdForOriginalLanguage = buildDummyUuid(3);

const audioItemIdForTranslationLanguage = buildDummyUuid(4);

const eventHistoryForDigitalText = new TestEventStream()
    .andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
    })
    // note the absence of a `PAGE_ADDED_TO_DIGITAL_TEXT`- we need this digital text to be empty for the import to work
    .as({
        type: AggregateType.digitalText,
        id: digitalTextId,
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
    };

    describe(`when the command is valid`, () => {
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
});
