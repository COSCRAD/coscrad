import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../../app/domain-modules/geospatial-map.module';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradNLPModule } from '../../../../../lib/nlp';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapViewModel } from '../../queries/geospatial-map.view-model';
import { ArangoGeospatialMapQueryRepository } from '../../repositories/arango-geospatial-map-query-repository';
import { IGeospatialMapQueryRepository } from '../../repositories/geospatial-map-query-repository.interface';
import { MapCreated } from '../map-created.event';
import { MapNameTranslated } from './map-name-translated.event';
import { MapNameTranslatedEventHandler } from './map-name-translated.event-handler';

const mapId = buildDummyUuid(34);

const mapName = 'name of map';

const translationOfMapName = 'translation of map name';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const mapCreated = new TestEventStream().andThen<MapCreated>(
    {
        type: 'MAP_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: mapId,
            },
            name: {
                text: mapName,
                languageCode: originalLanguageCode,
                role: MultilingualTextItemRole.original,
            },
        },
    },
    MapCreated
);

const mapNameTranslated = mapCreated.andThen<MapNameTranslated>(
    {
        type: 'MAP_NAME_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: { id: mapId },
            translationOfName: {
                text: translationOfMapName,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.freeTranslation,
            },
        },
    },
    MapNameTranslated
);

const [creationEvent, translatedEvent] = mapNameTranslated.as({
    type: AggregateType.map,
    id: mapId,
}) as [MapCreated, MapNameTranslated];

describe(`MapNameTranslatedEventHandler.handle`, () => {
    let testQueryRepository: IGeospatialMapQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let mapNameTranslatedEventHandler: MapNameTranslatedEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), CoscradNLPModule, GeospatialMapModule],
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

        testQueryRepository = new ArangoGeospatialMapQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        mapNameTranslatedEventHandler = app.get(MapNameTranslatedEventHandler);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        const existingView = GeospatialMapViewModel.fromMapCreated(creationEvent as MapCreated);

        existingView.isPublished = true;

        await testQueryRepository.create(existingView);
    });

    describe(`when the map name exists`, () => {
        it(`should update the view appropriately in the database`, async () => {
            await mapNameTranslatedEventHandler.handle(translatedEvent);

            const updatedView = (await testQueryRepository.fetchById(
                mapId
            )) as GeospatialMapViewModel;

            expect(updatedView.name.getOriginalTextItem()).toEqual({
                text: mapName,
                languageCode: originalLanguageCode,
                role: MultilingualTextItemRole.original,
            });

            expect(
                updatedView.name.getTranslation(translationLanguageCode) as MultilingualTextItem
            ).toEqual({
                text: translationOfMapName,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });
        });
    });
});
