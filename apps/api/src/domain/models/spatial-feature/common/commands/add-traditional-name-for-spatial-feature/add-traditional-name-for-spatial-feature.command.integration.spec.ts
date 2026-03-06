import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { SpatialFeatureModule } from '../../../../../../app/domain-modules/spatial-feature.module';
import { CoscradEventFactory } from '../../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { ID_MANAGER_TOKEN } from '../../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../../validation';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { Point } from '../../../point/entities/point.entity';
import { AddTraditionalNameForSpatialFeature } from './add-traditional-name-for-spatial-feature.command';

const commandType = `ADD_TRADITIONAL_NAME_FOR_SPATIAL_FEATURE`;

const spatialFeatureId = buildDummyUuid(8);

const existingSpatialFeatureLanguageCode = LanguageCode.Chilcotin;

const newTraditionalNameText = 'existing text for spatial feature';

const validPayload = buildTestInstance(AddTraditionalNameForSpatialFeature, {
    aggregateCompositeIdentifier: { id: spatialFeatureId },
    text: newTraditionalNameText,
    languageCode: existingSpatialFeatureLanguageCode,
});

const existingPoint = buildTestInstance(Point, {
    id: spatialFeatureId,
    properties: {
        contemporaryName: buildMultilingualTextWithSingleItem('Parking Lot C27'),
        traditionalName: undefined,
    },
});

const validFsa = {
    type: commandType,
    payload: validPayload,
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
        it(`should succeed with the expected updates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(ResourceType.spatialFeature)
                        .create(existingPoint);
                },
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: AddTraditionalNameForSpatialFeature) => {
                    const updatedPoint = (await testRepositoryProvider
                        .forResource(ResourceType.spatialFeature)
                        .fetchById(id)) as Point;

                    const originalTextItem =
                        updatedPoint.properties.traditionalName?.getOriginalTextItem();

                    expect(originalTextItem.languageCode).toBe(existingSpatialFeatureLanguageCode);

                    expect(originalTextItem.text).toBe(newTraditionalNameText);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the target spatial feature already has a traditional name`, () => {
            it(`should return the expected error response`, async () => {
                const textForTraditionalName = 'blue creek';

                const languageCodeForTraditionalName = LanguageCode.Chilcotin;

                const existingTraditionalName = buildMultilingualTextWithSingleItem(
                    textForTraditionalName,
                    languageCodeForTraditionalName
                );

                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.spatialFeature)
                            .create(
                                existingPoint.clone({
                                    properties: {
                                        traditionalName: existingTraditionalName,
                                    },
                                })
                            );
                    },
                    buildCommandFSA: () => ({
                        type: commandType,
                        payload: buildTestInstance(AddTraditionalNameForSpatialFeature, {
                            aggregateCompositeIdentifier: {
                                id: existingPoint.id,
                            },
                            text: textForTraditionalName,
                            languageCode: languageCodeForTraditionalName,
                        }),
                    }),
                });
            });
        });
    });
});
