import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../../app/domain-modules/geospatial-map.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../validation';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeospatialMap } from '../../geospatial-map.entity';
import { MapCreated } from '../map-created.event';
import { AddSpatialFeatureToMap } from './add-spatial-feature-to-map.command';

const commandType = 'ADD_SPATIAL_FEATURE_TO_MAP';

const geospatialId = buildDummyUuid(9);

const geospatialCompositeIdentifier = {
    type: AggregateType.map,
    id: geospatialId,
};

const mapCreated = new TestEventStream().andThen<MapCreated>({
    type: 'MAP_CREATED',
    payload: {
        aggregateCompositeIdentifier: geospatialCompositeIdentifier,
        name: { text: 'spatial feature text', languageCode: LanguageCode.English },
    },
});

const eventHistoryForExistingEmptyMapCreated = mapCreated.as(geospatialCompositeIdentifier);

const validFsa = {
    type: commandType,
    payload: buildTestInstance(AddSpatialFeatureToMap, {
        aggregateCompositeIdentifier: geospatialCompositeIdentifier,
        spatialFeatureId: geospatialId,
    }),
};

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                GeospatialMapModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        testRepositoryProvider = new TestRepositoryProvider(
            app.get(ArangoDatabaseProvider),
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        app.get(ArangoDatabaseProvider).close();

        app.close();
    });

    describe(`when the command is valid`, () => {
        it(`should add the spatial feature to map`, async () => {
            const existingEmptyMapCreated = GeospatialMap.fromEventHistory;
        });
    });
});
