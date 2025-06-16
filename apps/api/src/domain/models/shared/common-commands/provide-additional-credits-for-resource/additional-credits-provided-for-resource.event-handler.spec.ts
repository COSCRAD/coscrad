import { ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ContributionSummary } from '../../../user-management';
import { AdditionalCreditsProvidedForResource } from './additional-credits-provided-for-resource.event';
import { AdditionalCreditsProvidedForResourceEventHandler } from './additional-credits-provided-for-resource.event-handler';

const WIDGET_COLLECTION = 'widgets';

class WidgetViewModel {
    id: string;

    constructor({ id }: DTO<WidgetViewModel>) {
        this.id = id;
    }
}

interface IWidgetQueryRepository {
    fetchById(id: string): Promise<Maybe<WidgetViewModel>>;
    create(w: WidgetViewModel): Promise<void>;
    attribute(id: string, contributionSummary: ContributionSummary): Promise<void>;
}

class WidgetQueryRepository implements IWidgetQueryRepository {
    private readonly arangoDb: ArangoDatabaseForCollection<WidgetViewModel>;

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.arangoDb = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            WIDGET_COLLECTION
        );
    }

    async attribute(_id: string, _contributionSummary: ContributionSummary): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async fetchById(id: string): Promise<Maybe<WidgetViewModel>> {
        const searchResult = await this.arangoDb.fetchById(id);

        if (isNotFound(searchResult)) {
            return searchResult;
        }

        return new WidgetViewModel(mapDatabaseDocumentToAggregateDTO(searchResult));
    }

    async create(w: WidgetViewModel): Promise<void> {
        await this.arangoDb.create(mapEntityDTOToDatabaseDocument(w));
    }
}

const existingWidgetView = new WidgetViewModel({
    id: buildDummyUuid(2),
});

describe(`AdditionalCreditsProvidedForResourceEventHandler`, () => {
    let testQueryRepository: IWidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let additionalCreditsProvidedForResourceEventHandler: AdditionalCreditsProvidedForResourceEventHandler;

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

        testQueryRepository = new WidgetQueryRepository(connectionProvider);

        additionalCreditsProvidedForResourceEventHandler =
            new AdditionalCreditsProvidedForResourceEventHandler({
                forResource: (resourceType) => {
                    if (resourceType !== ('widget' as ResourceType)) {
                        throw new InternalError(
                            `this test only supports resources of type 'widget'`
                        );
                    }

                    return testQueryRepository;
                },
            });

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

        await testQueryRepository.create(existingWidgetView);
    });

    describe(`when the target is a resource`, () => {
        const additionalCreditsForWidget =
            new TestEventStream().buildSingle<AdditionalCreditsProvidedForResource>({
                type: 'ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE',
                payload: {
                    aggregateCompositeIdentifier: {
                        id: buildDummyUuid(56),
                    },
                },
            });
        it('should provide the credits to the resource', async () => {
            await additionalCreditsProvidedForResourceEventHandler.handle(
                additionalCreditsForWidget
            );

            const updatedView = (await testQueryRepository.fetchById(
                existingWidgetView.id
            )) as WidgetViewModel;

            expect(updatedView).toBe(true);
        });
    });
});
