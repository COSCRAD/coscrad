import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
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
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../queries/digital-text-query-repository.interface';
import { ContentAddedToDigitalTextPage } from '../add-content-to-digital-text-page';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { PhotographAddedToDigitalTextPage } from './photograph-added-to-digital-text-page.event';
import { PhotographAddedToDigitalTextPageEventHandler } from './photograph-added-to-digital-text-page.event-handler';

const photographId = buildDummyUuid(2);

const digitalTextId = buildDummyUuid(12);

const digitalTextTitle = 'The new book';

const languageCodeForTitle = LanguageCode.English;

const compositeId = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
    type: 'DIGITAL_TEXT_CREATED',
    payload: {
        title: digitalTextTitle,
        languageCodeForTitle,
    },
});

const pageIdentifier = '20';

const digitalTextPageAdded = digitalTextCreated
    .andThen<PageAddedToDigitalText>({
        type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
        payload: {
            identifier: pageIdentifier,
        },
    })
    .andThen<ContentAddedToDigitalTextPage>({
        type: 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE',
        payload: {
            pageIdentifier,
            text: 'dummy page content',
            languageCode: LanguageCode.English,
        },
    });

const photographAddedToDigitalTextPage =
    digitalTextPageAdded.andThen<PhotographAddedToDigitalTextPage>({
        type: 'PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE',
        payload: {
            aggregateCompositeIdentifier: { id: digitalTextId },
            pageIdentifier,
            photographId,
        },
    });

const [creationEvent, pageAddedEvent, contentAddedToPageEvent, photographAddedToPageEvent] =
    photographAddedToDigitalTextPage.as(compositeId) as [
        DigitalTextCreated,
        PageAddedToDigitalText,
        ContentAddedToDigitalTextPage,
        PhotographAddedToDigitalTextPage
    ];

const existingView = DigitalTextViewModel.fromDigitalTextCreated(creationEvent)
    .apply(pageAddedEvent)
    .apply(contentAddedToPageEvent);

describe(`PhotographAddedToDigitalTextPageEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: PhotographAddedToDigitalTextPageEventHandler;

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

        databaseProvider = app.get(ArangoDatabaseProvider);

        testQueryRepository = app.get(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN);

        eventHandler = new PhotographAddedToDigitalTextPageEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing digital text with a page added`, () => {
        it(`should add the given photograph to the digital text page`, async () => {
            await eventHandler.handle(photographAddedToPageEvent);

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as DigitalTextViewModel;

            const photographSearchResult = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            expect(photographSearchResult.photographId).toEqual(photographId);
        });
    });
});
