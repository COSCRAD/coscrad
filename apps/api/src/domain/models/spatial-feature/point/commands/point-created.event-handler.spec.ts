import {
    CoscradUserRole,
    GeometricFeatureType,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../app/domain-modules/spatial-feature.module';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { CoscradContributor } from '../../../user-management';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../../queries/spatial-feature.view-model.event-sourced';
import { PointCreated } from './point-created.event';
import { PointCreatedEventHandler } from './point-created.event-handler';

const dummyContributor = buildTestInstance(CoscradContributor);

const testAdminUser = new CoscradUserWithGroups(
    buildTestInstance(CoscradUser, {
        roles: [CoscradUserRole.projectAdmin],
    }),
    []
);

const pointNameText = 'speed racer';

const originalLanguageCode = LanguageCode.English;

const pointId = buildDummyUuid(89);

const pointCreatedEvent = buildTestInstance(PointCreated, {
    payload: {
        name: new MultilingualTextItem({
            languageCode: originalLanguageCode,
            text: `speed racer`,
            role: MultilingualTextItemRole.original,
        }),
        location: { type: GeometricFeatureType.point, coordinates: [54.1, 45.2] },
        aggregateCompositeIdentifier: {
            id: pointId,
        },
    },
    meta: {
        contributorIds: [dummyContributor.id],
    },
});

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

        it(`should create the expected view in the database`, async () => {
            const handler = app.get(PointCreatedEventHandler);

            await handler.handle(pointCreatedEvent);

            const searchResult = await testQueryRepository.fetchById(pointId, testAdminUser);

            expect(searchResult).not.toBe(NotFound);

            const { name } = searchResult as EventSourcedSpatialFeatureViewModel;

            const { languageCode: foundLanguageCode, text: foundText } = name.getOriginalTextItem();

            expect(foundLanguageCode).toBe(originalLanguageCode);

            expect(foundText).toBe(pointNameText);
        });
    });
});
