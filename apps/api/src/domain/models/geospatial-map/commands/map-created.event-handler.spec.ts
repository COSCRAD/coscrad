import { CoscradUserRole, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../app/domain-modules/geospatial-map.module';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { CoscradContributor } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapViewModel } from '../queries/geospatial-map.view-model';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from '../repositories/geospatial-map-query-repository.interface';
import { MapCreated } from './map-created.event';
import { MapCreatedEventHandler } from './map-created.event-handler';

const dummyContributor = buildTestInstance(CoscradContributor);

const testAdminUser = new CoscradUserWithGroups(
    buildTestInstance(CoscradUser, {
        roles: [CoscradUserRole.projectAdmin],
    }),
    []
);

const mapNameText = 'the king';

const originalLanguageCode = LanguageCode.Chilcotin;

const MapNameId = buildDummyUuid(98);

const mapCreatedEvent = buildTestInstance(MapCreated, {
    payload: {
        name: new MultilingualTextItem({
            languageCode: originalLanguageCode,
            text: mapNameText,
            role: MultilingualTextItemRole.original,
        }),
        description: new MultilingualTextItem({
            languageCode: originalLanguageCode,
            text: 'chuck',
            role: MultilingualTextItemRole.original,
        }),
        aggregateCompositeIdentifier: {
            id: MapNameId,
        },
    },
    meta: {
        contributorIds: [dummyContributor.id],
    },
});

describe(`MapCreatedEventHandler`, () => {
    describe(`when handling a MAP_CREATED event`, () => {
        let testQueryRepository: IGeospatialMapQueryRepository;

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

            databaseProvider = app.get(ArangoDatabaseProvider);

            testQueryRepository = app.get(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN);
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it('should create the expected view in the database', async () => {
            const handler = app.get(MapCreatedEventHandler);

            await handler.handle(mapCreatedEvent);

            const searchResult = await testQueryRepository.fetchById(MapNameId, testAdminUser);

            expect(searchResult).not.toBe(NotFound);

            const { name } = searchResult as GeospatialMapViewModel;

            const { languageCode: foundLanguageCode, text: foundText } = name.getOriginalTextItem();

            expect(foundLanguageCode).toBe(originalLanguageCode);

            expect(foundText).toBe(mapNameText);
        });
    });
});
