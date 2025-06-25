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
import { PageAddedToDigitalText } from './page-added-to-digital-text.event';
import { PageAddedToDigitalTextEventHandler } from './page-added-to-digital-text.event-handler';

const digitalTextId = buildDummyUuid(43);

const pageAddedToDigitalText = buildTestInstance(PageAddedToDigitalText, {
    payload: {
        aggregateCompositeIdentifier: { id: digitalTextId },
        identifier: '55',
    },
});

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    pages: [],
});

describe(`PageAddedToDigitalTextEventHandler`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let pageAddedToDigitalTextEventHandler: PageAddedToDigitalTextEventHandler;

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

        pageAddedToDigitalTextEventHandler = new PageAddedToDigitalTextEventHandler(
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

    describe(`when adding a page to the digital text`, () => {
        it('should add the page to the digital text', async () => {
            await pageAddedToDigitalTextEventHandler.handle(pageAddedToDigitalText);

            const updatedView = (await testQueryRepository.fetchById(
                existingDigitalTextView.id
            )) as DigitalTextViewModel;

            expect(updatedView.pages).toBeTruthy();
        });
    });
});
