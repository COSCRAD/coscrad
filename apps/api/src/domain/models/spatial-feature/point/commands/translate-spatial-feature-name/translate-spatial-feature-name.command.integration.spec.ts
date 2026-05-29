import {
    AggregateType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../../app/domain-modules/spatial-feature.module';
import { CoscradEventFactory } from '../../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../../domain/common/entities/multilingual-text';
import { ID_MANAGER_TOKEN } from '../../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../../test-data/events';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../../validation';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { Point } from '../../entities/point.entity';
import { PointCreated } from '../point-created.event';
import { SpatialFeatureNameTranslated } from './spatial-feature-name-translated.event';
import { TranslateSpatialFeatureName } from './translate-spatial-feature-name.command';

const commandType = 'TRANSLATE_SPATIAL_FEATURE_NAME';

const spatialFeatureId = buildDummyUuid(3);

const spatialFeatureCompositeIdentifier = {
    type: AggregateType.spatialFeature,
    id: spatialFeatureId,
};

// const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationSpatialFeatureText = 'translation of spatial feature text';

const pointCreated = new TestEventStream().andThen<PointCreated>({
    type: 'POINT_CREATED',
    payload: {
        aggregateCompositeIdentifier: spatialFeatureCompositeIdentifier,
        name: 'point name translation',
    },
});

const eventHistoryForExistingPoint = pointCreated.as(spatialFeatureCompositeIdentifier);

const validFsa = {
    type: commandType,
    payload: buildTestInstance(TranslateSpatialFeatureName, {
        aggregateCompositeIdentifier: { id: spatialFeatureId },
        languageCode: translationLanguageCode,
        translation: translationSpatialFeatureText,
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
                SpatialFeatureModule,
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
        it(`should translate the text`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(ResourceType.spatialFeature)
                        .create(
                            Point.fromEventHistory(
                                eventHistoryForExistingPoint,
                                spatialFeatureId
                            ) as Point
                        );
                },
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: TranslateSpatialFeatureName) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.spatialFeature)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(Point);

                    const updatedPoint = searchResult as Point;

                    const translationSearchResult =
                        updatedPoint.properties.name.getTranslation(translationLanguageCode);

                    expect(translationSearchResult).toBeInstanceOf(MultilingualTextItem);

                    const translationTextItem = translationSearchResult as MultilingualTextItem;

                    expect(translationTextItem.text).toBe(translationSpatialFeatureText);

                    expect(translationTextItem.role).toBe(MultilingualTextItemRole.freeTranslation);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the translation language is the same as the original`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.spatialFeature)
                            .create(
                                Point.fromEventHistory(
                                    pointCreated
                                        .andThen<SpatialFeatureNameTranslated>({
                                            type: 'SPATIAL_FEATURE_NAME_TRANSLATED',
                                            payload: {
                                                languageCode: translationLanguageCode,
                                            },
                                        })
                                        .as(spatialFeatureCompositeIdentifier),
                                    spatialFeatureId
                                ) as Point
                            );
                        // todo then translate
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        expect(error.message).toContain('shoot Aaron!');
                    },
                });
            });
        });

        describe(`when there is already a translation in the given languauge`, () => {
            it.todo(`should return the expected error`);
        });

        describe(`when the spatial feature does not exist`, () => {
            it.todo(`should return the expected error`);
        });
    });
});
