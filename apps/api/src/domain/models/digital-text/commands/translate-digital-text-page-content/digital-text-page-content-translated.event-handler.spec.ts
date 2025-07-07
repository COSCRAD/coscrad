import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import DigitalTextPage from '../../entities/digital-text-page.entity';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from '../../queries/digital-text-query-repository.interface';
import { DigitalTextPageContentTranslated } from './digital-text-page-content-translated.event';
import { DigitalTextPageContentTranslatedEventHandler } from './digital-text-page-content-translated.event-handler';

const originalLanguageCode = LanguageCode.Chilcotin;

const digitalTextId = buildDummyUuid(21);

const translationLanguageCode = LanguageCode.English;

const translatedContent = 'page content translated';

const pageIdentifier = 'XV';

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    name: buildMultilingualTextWithSingleItem('digital text page content', originalLanguageCode),
    pages: [
        buildTestInstance(DigitalTextPage, {
            identifier: pageIdentifier,
            content: buildMultilingualTextWithSingleItem('original text', originalLanguageCode),
        }),
    ],
});

const digitalTextPageContentTranslated = buildTestInstance(DigitalTextPageContentTranslated, {
    payload: {
        aggregateCompositeIdentifier: { id: digitalTextId },
        languageCode: translationLanguageCode,
        translation: translatedContent,
        pageIdentifier,
    },
});

describe(`DigitalTextPageContentTranslated`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let digitalTextPageContentTranslatedEventHandler: DigitalTextPageContentTranslatedEventHandler;

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

        digitalTextPageContentTranslatedEventHandler =
            new DigitalTextPageContentTranslatedEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingDigitalTextView);
    });

    describe(`when translating page content for digital text`, () => {
        it('should tranlate the page content', async () => {
            await digitalTextPageContentTranslatedEventHandler.handle(
                digitalTextPageContentTranslated
            );

            const updatedView = (await testQueryRepository.fetchById(
                digitalTextId
            )) as DigitalTextViewModel;

            const { content: updatedContent } = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            const translationItem = updatedContent.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(translationItem.text).toBe(translatedContent);

            expect(translationItem.role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });
});
