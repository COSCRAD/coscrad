import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { buildSingleLanguageText } from '../../../../../test-data/buildAudioItemTestData';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../../photograph/queries';
import { PhotographViewModel } from '../../../photograph/queries/photograph.view-model';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { PhotographAddedToDigitalTextPage } from './photograph-added-to-digital-text-page.event';
import { PhotographAddedToDigitalTextPageEventHandler } from './photograph-added-to-digital-text-page.event-handler';

const digitalTextId = buildDummyUuid(12);

const languageCodeForTest = LanguageCode.English;

const digitalTextTitle = buildSingleLanguageText('The new book', languageCodeForTest);

const pageIdentifier = '20';

const pageContent = buildSingleLanguageText('dummy page content', languageCodeForTest);

const photographId = buildDummyUuid(2);

const photographTitle = buildSingleLanguageText('A photo of a dolphin', languageCodeForTest);

const existingPhotographView = buildTestInstance(PhotographViewModel, {
    id: photographId,
    name: photographTitle,
    photographer: 'Jean Simmons',
});

const existingView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    name: digitalTextTitle,
    pages: [{ identifier: pageIdentifier, content: pageContent }],
});

const photographAddedToPage = new TestEventStream().buildSingle<PhotographAddedToDigitalTextPage>({
    type: 'PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE',
    payload: {
        aggregateCompositeIdentifier: { id: digitalTextId },
        pageIdentifier: pageIdentifier,
        photographId: photographId,
    },
});

describe(`PhotographAddedToDigitalTextPageEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let photographQueryRepository: IPhotographQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let photographAddedToDigitalTextPageEventHandler: PhotographAddedToDigitalTextPageEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
            ],
            providers: [
                {
                    provide: DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
                    useFactory: (connectionProvider: ArangoConnectionProvider) => {
                        return new ArangoDigitalTextQueryRepository(connectionProvider);
                    },
                    inject: [ArangoConnectionProvider],
                },
                PhotographAddedToDigitalTextPageEventHandler,
            ],
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

        databaseProvider = app.get(ArangoDatabaseProvider);

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);

        photographAddedToDigitalTextPageEventHandler =
            new PhotographAddedToDigitalTextPageEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingView);

        await photographQueryRepository.create(existingPhotographView);
    });

    describe(`when there is an existing digital text with a page that does not yet have a photograph`, () => {
        it(`should add the given photograph to the digital text page`, async () => {
            await photographAddedToDigitalTextPageEventHandler.handle(photographAddedToPage);

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as DigitalTextViewModel;

            const pageSearchResult = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            expect(pageSearchResult.photographId).toEqual(photographId);
        });
    });
});
