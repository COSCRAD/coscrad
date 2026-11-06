import { AggregateType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../../app/domain-modules/geospatial-map.module';
import { SpatialFeatureModule } from '../../../../../app/domain-modules/spatial-feature.module';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { CoscradNLPModule } from '../../../../../lib/nlp';
import { clonePlainObjectWithoutProperties } from '../../../../../lib/utilities/clonePlainObjectWithoutProperties';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { SpatialFeatureViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../../spatial-feature/queries/spatial-feature-query-repository.interface';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapViewModel } from '../../queries/geospatial-map.view-model';
import { ArangoGeospatialMapQueryRepository } from '../../repositories/arango-geospatial-map-query-repository';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from '../../repositories/geospatial-map-query-repository.interface';
import { MapCreated } from '../map-created.event';
import { SpatialFeatureAddedToMap } from './spatial-feature-added-to-map.event';
import { SpatialFeatureAddedToMapEventHandler } from './spatial-feature-added-to-map.event-handler';

const mapId = buildDummyUuid(65);

const mapCompositeId = {
    type: AggregateType.map,
    id: mapId,
};

const mapCreated = new TestEventStream().andThen<MapCreated>(
    {
        type: 'MAP_CREATED',
    },
    MapCreated
);

const spatialFeatureId = buildDummyUuid(12);

const existingSpatialFeatureView = buildTestInstance(SpatialFeatureViewModel, {
    id: spatialFeatureId,
});

const spatialFeatureAddedToMap = mapCreated.andThen<SpatialFeatureAddedToMap>(
    {
        type: 'SPATIAL_FEATURE_ADDED_TO_MAP',
        payload: {
            spatialFeatureId,
        },
    },
    SpatialFeatureAddedToMap
);

describe(`SpatialFeatureAddedToMapEventHandler.handle`, () => {
    let testQueryRepository: IGeospatialMapQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let spatialFeatureAddedToMapEventHandler: SpatialFeatureAddedToMapEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                PersistenceModule.forRootAsync(),
                CoscradNLPModule,
                SpatialFeatureModule,
                GeospatialMapModule,
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

        await app.init();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoGeospatialMapQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        spatialFeatureAddedToMapEventHandler = app.get(SpatialFeatureAddedToMapEventHandler);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        const existingView = GeospatialMapViewModel.fromMapCreated(
            mapCreated.as(mapCompositeId)[0] as MapCreated
        );

        existingView.isPublished = true;

        await testQueryRepository.create(existingView);

        /**
         * This must be in the DB for the event handler to work
         */
        await app
            .get<ISpatialFeatureQueryRepository>(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN)
            .create(existingSpatialFeatureView);
    });

    describe(`when adding a first spatial feature`, () => {
        it(`should add the spatial feature`, async () => {
            await spatialFeatureAddedToMapEventHandler.handle(
                spatialFeatureAddedToMap.as(mapCompositeId)[1] as SpatialFeatureAddedToMap
            );

            const updatedMap = (await app
                .get<IGeospatialMapQueryRepository>(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN)
                .fetchById(mapId)) as GeospatialMapViewModel;

            const { spatialFeaturesById } = updatedMap;

            expect(Object.entries(spatialFeaturesById)).toHaveLength(1);

            expect(spatialFeatureId in spatialFeaturesById).toBe(true);

            const { id: foundId, geometry, properties } = spatialFeaturesById[spatialFeatureId];

            expect(foundId).toBe(spatialFeatureId);

            expect(geometry).toEqual(existingSpatialFeatureView.geometry);

            // TODO Deal with maps disappearing during serialization here
            expect(
                // @ts-expect-error Friday
                clonePlainObjectWithoutProperties(properties, ['alternativeNamesByLabel'])
            ).toEqual(
                clonePlainObjectWithoutProperties(
                    // @ts-expect-error Friday
                    existingSpatialFeatureView.properties,
                    ['alternativeNamesByLabel']
                )
            );
        });
    });

    describe(`when adding a second spatial feature`, () => {
        it.todo(`should the spatial feature`);
    });
});
