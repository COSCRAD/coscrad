import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../../app/domain-modules/spatial-feature.module';
import { ConsoleCoscradCliLogger } from '../../../../../../coscrad-cli/logging';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../../domain/common/entities/multilingual-text';
import { CoscradNLPModule } from '../../../../../../lib/nlp';
import { NotFound } from '../../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { ISpatialFeatureQueryRepository } from '../../../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../../../queries/spatial-feature.view-model.event-sourced';
import { ArangoSpatialFeatureQueryRepository } from '../../../repositories/arango-spatial-feature-query-repository';
import { PointCoordinates } from '../../entities/point-coordinates.entity';
import { PointCreated } from '../create-point/point-created.event';
import { SpatialFeatureNameTranslated } from './spatial-feature-name-translated.event';
import { SpatialFeatureNameTranslatedEventHandler } from './spatial-feature-name-translated.event-handler';

const spatialFeatureId = buildDummyUuid(56);

const spatialFeatureName = 'name of point';

const spatialFeatureNameTranslated = 'translation of point name';

const translationLanguageCode = LanguageCode.Chilcotin;

const originalLanguageCode = LanguageCode.English;

const pointCreated = new TestEventStream().andThen<PointCreated>({
    type: 'POINT_CREATED',
    payload: {
        aggregateCompositeIdentifier: { id: spatialFeatureId },
        name: {
            text: spatialFeatureName,
            languageCode: originalLanguageCode,
        },
        description: 'description of point',
        geometricFeature: {
            coordinates: PointCoordinates.fromTuple([52.1322203, -122.145229]),
        },
    },
});

const nameTranslated = pointCreated.andThen<SpatialFeatureNameTranslated>({
    type: 'SPATIAL_FEATURE_NAME_TRANSLATED',
    payload: {
        aggregateCompositeIdentifier: { id: spatialFeatureId },
        translationItem: {
            text: spatialFeatureNameTranslated,
            languageCode: translationLanguageCode,
            role: MultilingualTextItemRole.freeTranslation,
        },
    },
});

const [creationEvent, translatedEvent] = nameTranslated.as({
    type: AggregateType.spatialFeature,
    id: spatialFeatureId,
}) as [PointCreated, SpatialFeatureNameTranslated];

describe(`SpatialFeatureNameTranslatedEventHandler.handle`, () => {
    let testQueryRepository: ISpatialFeatureQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let spatialFeatureNameTranslatedEventHandler: SpatialFeatureNameTranslatedEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), CoscradNLPModule, SpatialFeatureModule],
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

        testQueryRepository = new ArangoSpatialFeatureQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        spatialFeatureNameTranslatedEventHandler = app.get(
            SpatialFeatureNameTranslatedEventHandler
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        const existingView = EventSourcedSpatialFeatureViewModel.fromPointCreated(
            creationEvent as PointCreated
        );

        existingView.isPublished = true;

        await testQueryRepository.create(existingView);
    });

    describe(`when the spatial feature exists`, () => {
        it(`should update the view appropriately in the database`, async () => {
            await spatialFeatureNameTranslatedEventHandler.handle(translatedEvent);

            const updatedView = (await testQueryRepository.fetchById(
                spatialFeatureId
            )) as EventSourcedSpatialFeatureViewModel;

            expect(updatedView.name.getOriginalTextItem()).toEqual({
                text: spatialFeatureName,
                languageCode: originalLanguageCode,
                role: MultilingualTextItemRole.original,
            });

            expect(
                updatedView.name.getTranslation(translationLanguageCode) as MultilingualTextItem
            ).toEqual({
                text: spatialFeatureNameTranslated,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            const updatedName = new MultilingualText(updatedView.name);

            const translationItem = updatedName.getTranslation(
                translatedEvent.payload.translationItem.languageCode
            );

            expect(translationItem).not.toBe(NotFound);

            const { text, languageCode } = translationItem as MultilingualTextItem;

            expect(text).toBe(translatedEvent.payload.translationItem.text);

            expect(languageCode).toBe(translatedEvent.payload.translationItem.languageCode);
        });
    });
});
