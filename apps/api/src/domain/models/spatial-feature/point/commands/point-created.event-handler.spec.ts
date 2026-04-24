import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../app/domain-modules/spatial-feature.module';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../queries/spatial-feature-query-repository.interface';

describe(`PointCreatedEventHandler`, () => {
    describe(`when handling a POINT_CREATED event`, () => {
        let testQueryRepository: ISpatialFeatureQueryRepository;

        let databaseProvider: ArangoDatabaseProvider;

        let app: INestApplication;

        beforeAll(async () => {
            const moduleRef = await Test.createTestingModule({
                providers: [],
                imports: [
                    ConfigModule.forRoot({
                        isGlobal: true,
                        envFilePath: buildConfigFilePath(Environment.test),
                        cache: false,
                    }),
                    PersistenceModule.forRootAsync(),
                    CommandModule,
                    SpatialFeatureModule,
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

            databaseProvider = app.get(ArangoDatabaseProvider);

            testQueryRepository = app.get(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN);
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should create the expected view in the database`, async () => {});
    });
});
