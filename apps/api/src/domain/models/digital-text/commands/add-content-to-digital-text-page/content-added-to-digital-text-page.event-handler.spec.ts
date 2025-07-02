import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
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
import { ContentAddedToDigitalTextPage } from './content-added-to-digital-text-page.event';
import { ContentAddedToDigitalTextPageEventHandler } from './content-added-to-digital-text-page.event-handler';

const digitalTextId = buildDummyUuid(34);

const newPageContent = 'content for page';

const languageCodeForContent = LanguageCode.Chilcotin;

const identifier = '56';

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    pages: [{ identifier: identifier }],
});

const contentAddedToDigitalTextPage = buildTestInstance(ContentAddedToDigitalTextPage, {
    payload: {
        aggregateCompositeIdentifier: { id: digitalTextId },
        text: newPageContent,
        languageCode: languageCodeForContent,
        pageIdentifier: identifier,
    },
});

describe(`ContentAddedToDigitalTextPageEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let contentAddedToDigitalTextPageEventHandler: ContentAddedToDigitalTextPageEventHandler;

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

        contentAddedToDigitalTextPageEventHandler = new ContentAddedToDigitalTextPageEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingDigitalTextView);
    });

    describe(`when content is added to the digital text page`, () => {
        it('should add the content to the page', async () => {
            await contentAddedToDigitalTextPageEventHandler.handle(contentAddedToDigitalTextPage);

            const updatedView = (await testQueryRepository.fetchById(
                existingDigitalTextView.id
            )) as DigitalTextViewModel;

            const pageSearchResult = updatedView.pages.find(
                ({ identifier }) => identifier === identifier
            );

            const { content } = pageSearchResult;

            expect(content).toBeTruthy();

            const pageContentOriginalTextItem = content.items.find(
                ({ role }) => role === MultilingualTextItemRole.original
            ).text;

            expect(pageContentOriginalTextItem).toEqual(newPageContent);
        });
    });
});
