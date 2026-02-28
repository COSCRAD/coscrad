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
import { ID_MANAGER_TOKEN } from '../../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../../validation';
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
    properties: {
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
});
