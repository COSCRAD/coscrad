import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from '../../queries/digital-text-query-repository.interface';
import { DigitalTextPageImportRecord } from './import-pages-to-digital-text.command';
import { PagesImportedToDigitalText } from './pages-imported-to-digital-text.event';
import { PagesImportedToDigitalTextEventHandler } from './pages-imported-to-digital-text.event-handler';

const digitalTextId = buildDummyUuid(3);

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    pages: [],
});

const targetPageIdentifier = 'RVI';

const originalTextContentForTargetPage = 'This is a test.';

const translationTextContentForTargetPage = 'This is a test (translated).';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const pageImportRecords: DigitalTextPageImportRecord[] = [
    {
        pageIdentifier: targetPageIdentifier,
        content: [
            {
                text: originalTextContentForTargetPage,
                languageCode: originalLanguageCode,
                isOriginalLanguage: true,
            },
            {
                text: translationTextContentForTargetPage,
                languageCode: translationLanguageCode,
                isOriginalLanguage: false,
            },
        ],
    },
];

const pagesImported = buildTestInstance(PagesImportedToDigitalText, {
    payload: {
        aggregateCompositeIdentifier: {
            id: digitalTextId,
        },
        pages: pageImportRecords,
    },
});

describe('PagesImportedToDigitalTextEventHandler', () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let pagesImportedEventHandler: PagesImportedToDigitalTextEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        pagesImportedEventHandler = new PagesImportedToDigitalTextEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingDigitalTextView);
    });

    describe(`when the target digital text exists`, () => {
        describe(`when there are no pages to begin with`, () => {
            it(`should import the pages`, async () => {
                await pagesImportedEventHandler.handle(pagesImported);

                const updatedView = (await testQueryRepository.fetchById(
                    digitalTextId
                )) as DigitalTextViewModel;

                const pageToCheckInDetail = updatedView.pages.find(
                    ({ identifier }) => identifier === targetPageIdentifier
                );

                const { languageCode: foundOriginalLanguageCode, text: foundOriginalText } =
                    pageToCheckInDetail.content.getOriginalTextItem();

                expect(foundOriginalLanguageCode).toBe(originalLanguageCode);

                expect(foundOriginalText).toBe(originalTextContentForTargetPage);
            });
        });

        describe(`when there are already pages`, () => {
            /**
             * This would be a system error. Our command validation flow
             * prevents importing pages to a non-empty digital text.
             */
            it.todo(`should not update the existing view`);
        });
    });

    describe(`when the target digital text does not exist`, () => {
        it(`should fail gracefully`, async () => {
            const tryIt = () =>
                pagesImportedEventHandler.handle(
                    buildTestInstance(PagesImportedToDigitalText, {
                        payload: {
                            aggregateCompositeIdentifier: { id: buildDummyUuid(404) },
                        },
                    })
                );

            expect(tryIt).resolves;

            // TODO assert correct message is logged
        });
    });
});
