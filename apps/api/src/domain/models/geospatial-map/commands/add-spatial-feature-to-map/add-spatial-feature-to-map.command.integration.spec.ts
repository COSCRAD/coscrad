import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../../app/domain-modules/geospatial-map.module';
import { SpatialFeatureModule } from '../../../../../app/domain-modules/spatial-feature.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import InvalidExternalReferenceByAggregateError from '../../../../../domain/models/categories/errors/InvalidExternalReferenceByAggregateError';
import { SpatialFeatureAddedToMap } from '../../../../../domain/models/geospatial-map/commands/add-spatial-feature-to-map/spatial-feature-added-to-map.event';
import AggregateNotFoundError from '../../../../../domain/models/shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { PointCreated } from '../../../../../domain/models/spatial-feature/point/commands';
import { Point } from '../../../../../domain/models/spatial-feature/point/entities/point.entity';
import { assertCommandError } from '../../../../../domain/models/__tests__/command-helpers/assert-command-error';
import { InternalError } from '../../../../../lib/errors/InternalError';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../validation';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { GeospatialMap } from '../../geospatial-map.entity';
import { MapCreated } from '../map-created.event';
import { AddSpatialFeatureToMap } from './add-spatial-feature-to-map.command';

const commandType = 'ADD_SPATIAL_FEATURE_TO_MAP';

const mapId = buildDummyUuid(9);

const mapCompositeIdentifier = {
    type: AggregateType.map,
    id: mapId,
};

const pointCompositeIdentifier = {
    type: AggregateType.spatialFeature,
    id: buildDummyUuid(55),
};

const mapName = 'name of the test map';

const mapCreated = new TestEventStream().andThen<MapCreated>(
    {
        type: 'MAP_CREATED',
        payload: {
            aggregateCompositeIdentifier: mapCompositeIdentifier,
            name: { text: mapName, languageCode: LanguageCode.English },
        },
    },
    MapCreated
);

const eventHistoryForExistingEmptyMap = mapCreated.as(mapCompositeIdentifier);

const validFsa = {
    type: commandType,
    payload: buildTestInstance(AddSpatialFeatureToMap, {
        aggregateCompositeIdentifier: mapCompositeIdentifier,
        spatialFeatureId: pointCompositeIdentifier.id,
    }),
};

const existingPoint = Point.fromEventHistory(
    new TestEventStream()
        .andThen<PointCreated>({
            type: 'POINT_CREATED',
            payload: {},
        })
        .as(pointCompositeIdentifier),
    pointCompositeIdentifier.id
) as Point;

const existinEmptyMap = GeospatialMap.fromEventHistory(
    eventHistoryForExistingEmptyMap,
    mapId
) as GeospatialMap;

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
                SpatialFeatureModule,
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
        it(`should add the spatial the map`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(AggregateType.spatialFeature)
                        .create(existingPoint);

                    await testRepositoryProvider
                        .forResource(AggregateType.map)
                        .create(existinEmptyMap);
                },
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: AddSpatialFeatureToMap) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.map)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(GeospatialMap);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the spatialFeature does not exist`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(AggregateType.map)
                            .create(existinEmptyMap);
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existinEmptyMap.getCompositeIdentifier(),
                                    [existingPoint.getCompositeIdentifier()]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the map does not exist`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(AggregateType.spatialFeature)
                            .create(existingPoint);
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    existinEmptyMap.getCompositeIdentifier()
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the spatial feature is already in the map`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(AggregateType.spatialFeature)
                            .create(existingPoint);

                        await testRepositoryProvider.forResource(AggregateType.map).create(
                            GeospatialMap.fromEventHistory(
                                mapCreated
                                    .andThen<SpatialFeatureAddedToMap>(
                                        {
                                            type: 'SPATIAL_FEATURE_ADDED_TO_MAP',
                                            payload: {
                                                spatialFeatureId: existingPoint.id,
                                            },
                                        },
                                        SpatialFeatureAddedToMap
                                    )
                                    .as(mapCompositeIdentifier),
                                mapId
                            ) as GeospatialMap
                        );
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (result) => {
                        const message = (result as InternalError).toString();

                        expect(message).toContain('duplicate spatial feature');
                        expect(message).toContain(existingPoint.id);
                        expect(message).toContain(mapName);
                    },
                });
            });
        });
    });
});
