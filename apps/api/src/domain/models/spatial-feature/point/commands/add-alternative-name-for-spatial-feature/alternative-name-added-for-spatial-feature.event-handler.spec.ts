import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { buildTestInstance } from 'apps/api/src/test-data/utilities';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../../app/domain-modules/spatial-feature.module';
import { ConsoleCoscradCliLogger } from '../../../../../../coscrad-cli/logging';
import { CoscradNLPModule } from '../../../../../../lib/nlp';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { ISpatialFeatureQueryRepository } from '../../../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../../../queries/spatial-feature.view-model.event-sourced';
import { ArangoSpatialFeatureQueryRepository } from '../../../repositories/arango-spatial-feature-query-repository';
import { PointCreated } from '../point-created.event';
import { AlternativeNameAddedForSpatialFeature } from './alternative-name-added-for-spatial-feature.event';
import { AlternativeNameAddedForSpatialFeatureEventHandler } from './alternative-name-added-for-spatial-feature.event-handler';

const spatialFeatureId = buildDummyUuid(55);

const spatialFeatureCompositeId = {
    type: AggregateType.spatialFeature,
    id: spatialFeatureId,
};

const spatialFeatureOriginalName = 'The Point';
const spatialFeatureLanguageCodeForOriginalName = LanguageCode.English;

const label = 'contemporary';

/**
 * Note that this is not a translation, but yet a different name entirely.
 */
const spatialFeatureAlternativeName = 'Wicked Woods';
const spatialFeatureAlternativeLanguageCode = LanguageCode.Chilcotin;

const pointCreated = new TestEventStream().andThen<PointCreated>(
    {
        type: 'POINT_CREATED',
        payload: {
            name: {
                text: spatialFeatureOriginalName,
                languageCode: spatialFeatureLanguageCodeForOriginalName,
            },
        },
    },
    PointCreated
);

const [pointCreatedEvent, alternativeNameAddedEvent] = pointCreated
    .andThen<AlternativeNameAddedForSpatialFeature>(
        {
            type: 'ALTERNATIVE_NAME_ADDED_FOR_SPATIAL_FEATURE',
            payload: {
                label,
                textItem: {
                    text: spatialFeatureAlternativeName,
                    languageCode: spatialFeatureAlternativeLanguageCode,
                },
            },
        },
        AlternativeNameAddedForSpatialFeature
    )
    .as(spatialFeatureCompositeId);

describe(`AlternativeNameAddedForSpatialFeatureEventHandler`, () => {
    let testQueryRepository: ISpatialFeatureQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let alternativeNameAddedEventHandler: AlternativeNameAddedForSpatialFeatureEventHandler;

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

        await app.init();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoSpatialFeatureQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        alternativeNameAddedEventHandler = app.get(
            AlternativeNameAddedForSpatialFeatureEventHandler
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        const existingView = EventSourcedSpatialFeatureViewModel.fromPointCreated(
            pointCreatedEvent as PointCreated
        );

        existingView.isPublished = true;

        await testQueryRepository.create(existingView);
    });

    describe(`when adding a first alternative name`, () => {
        it(`should add the name`, async () => {
            await alternativeNameAddedEventHandler.handle(
                alternativeNameAddedEvent as AlternativeNameAddedForSpatialFeature
            );

            const updatedView = (await testQueryRepository.fetchById(
                spatialFeatureId
            )) as EventSourcedSpatialFeatureViewModel;

            const alternativeNameSearchResult =
                updatedView.properties.alternativeNamesByLabel.get(label);

            expect(alternativeNameSearchResult).toBeTruthy();

            const foundText = alternativeNameSearchResult.getOriginalTextItem();

            expect(foundText.text).toBe(spatialFeatureAlternativeName);

            expect(foundText.languageCode).toBe(spatialFeatureAlternativeLanguageCode);
        });
    });

    describe(`when adding a second alternative name`, () => {
        it(`should add the name`, async () => {
            const secondLabel = 'label 2';
            const secondAltName = 'alt name 2';
            const secondAltNameLanguageCode = LanguageCode.Chinook;

            await alternativeNameAddedEventHandler.handle(
                alternativeNameAddedEvent as AlternativeNameAddedForSpatialFeature
            );

            await alternativeNameAddedEventHandler.handle(
                buildTestInstance(AlternativeNameAddedForSpatialFeature, {
                    payload: {
                        aggregateCompositeIdentifier: spatialFeatureCompositeId,
                        textItem: {
                            text: secondAltName,
                            languageCode: secondAltNameLanguageCode,
                        },
                        label: secondLabel,
                    },
                })
            );

            const updatedView = (await testQueryRepository.fetchById(
                spatialFeatureId
            )) as EventSourcedSpatialFeatureViewModel;

            /**
             * We test this in more detail in the query repository test.
             */
            expect(updatedView.properties.alternativeNamesByLabel.size).toBe(2);
        });
    });
});
