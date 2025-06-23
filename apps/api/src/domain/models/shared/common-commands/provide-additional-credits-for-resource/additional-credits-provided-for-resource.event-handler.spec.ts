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
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ContributionSummary } from '../../../user-management';
import { CoscradDate } from '../../../user-management/utilities';
import { AdditionalCreditsProvidedForResource } from './additional-credits-provided-for-resource.event';
import {
    AdditionalCreditsProvidedForResourceEventHandler,
    IQueryRepositoryForAttributable,
} from './additional-credits-provided-for-resource.event-handler';

const WIDGET_COLLECTION = 'widgets';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

const RESOURCE_TYPE_FOR_REPO_WITH_NO_ATTRIBUTE_METHOD = 'non-attributing-resource' as ResourceType;

class WidgetViewModel {
    id: string;
    contributions: ContributionSummary[];

    constructor({ id, contributions }: DTO<WidgetViewModel>) {
        this.id = id;

        this.contributions = contributions.map((c) => new ContributionSummary(c));
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

    async attribute(id: string, contributionSummary: ContributionSummary): Promise<void> {
        const existingWidget = (await this.fetchById(id)) as WidgetViewModel;

        existingWidget.contributions.push(contributionSummary);

        await this.arangoDb.update(id, { contributions: existingWidget.contributions });
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
    contributions: [],
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
                    if (resourceType === RESOURCE_TYPE_FOR_REPO_WITH_NO_ATTRIBUTE_METHOD) {
                        // no attribute method
                        return {} as IQueryRepositoryForAttributable;
                    }

                    if (resourceType === WIDGET_RESOURCE_TYPE) {
                        return testQueryRepository;
                    }

                    throw new InternalError(`this test only supports resources of type 'widget'`);
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

    describe(`when the target is a resource whose repository has an 'attribute' method`, () => {
        const additionalCreditsForWidget = buildTestInstance(AdditionalCreditsProvidedForResource, {
            payload: {
                aggregateCompositeIdentifier: {
                    id: existingWidgetView.id,
                    type: 'widget' as ResourceType,
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

            const { contributions } = updatedView;

            expect(contributions).toHaveLength(1);

            const { contributorIds, timestamp, date } = contributions[0];

            expect(timestamp).toBe(additionalCreditsForWidget.meta.dateCreated);

            expect(date).toEqual(
                CoscradDate.fromUnixTimestamp(additionalCreditsForWidget.meta.dateCreated)
            );

            expect(contributorIds).toEqual(additionalCreditsForWidget.payload.contributorIds);
        });
    });

    describe(`when the target is a resource whose repository has not implemented 'attribute'`, () => {
        it(`should not throw`, async () => {
            const tryIt = additionalCreditsProvidedForResourceEventHandler.handle(
                buildTestInstance(AdditionalCreditsProvidedForResource, {
                    payload: {
                        aggregateCompositeIdentifier: {
                            id: buildDummyUuid(99),
                            type: RESOURCE_TYPE_FOR_REPO_WITH_NO_ATTRIBUTE_METHOD,
                        },
                    },
                })
            );

            expect(tryIt).resolves;
        });
    });
});
