import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../../app/domain-modules/spatial-feature.module';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../../validation';
import { CoscradEventFactory } from '../../../../../common';
import { ID_MANAGER_TOKEN } from '../../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { GeometricFeatureType } from '../../../types/GeometricFeatureType';
import { CreatePoint } from './create-point.command';

const commandType = `CREATE_POINT`;

const pointName = 'Sunny Park Point';

const pointId = buildDummyUuid(4);

const originalLanguageCode = LanguageCode.English;

const dummyPayload = buildTestInstance(CreatePoint, {
    aggregateCompositeIdentifier: { id: pointId },
    name: pointName,
    languageCodeForName: originalLanguageCode,
});

const dummyFsa = {
    type: commandType,
    payload: dummyPayload,
};

const commandFsaFactory = new DummyCommandFsaFactory((id) => {
    const clone = clonePlainObjectWithOverrides(dummyFsa, {
        payload: { aggregateCompositeIdentifier: { id } },
    });

    return clone;
});

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

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
        it(`should succeed with the expected updates to the database`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await Promise.resolve();
                },
                buildValidCommandFSA: (id: AggregateType) => commandFsaFactory.build(id),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        /**
         * This is not the rule we want. There may be multiple places that happen to have the
         * same name (e.g, Springfield). We want to prevent two points from overlapping on the map.
         */
        describe(`when there is already another spatial feature with the given name`, () => {
            Object.values(GeometricFeatureType).forEach((featureType) => {
                describe(`with geometry type: ${featureType}`, () => {
                    it(`should fail with the expected errors`, async () => {
                        // We use a valid command to set up the state for the invalid test
                        await assertCreateCommandError(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await assertCreateCommandSuccess(assertionHelperDependencies, {
                                    systemUserId: dummySystemUserId,
                                    seedInitialState: async () => {
                                        await Promise.resolve();
                                    },
                                    buildValidCommandFSA: (id: AggregateId) =>
                                        commandFsaFactory.build(id),
                                });
                            },
                            buildCommandFSA: (id: AggregateId) => commandFsaFactory.build(id),
                        });
                    });
                });
            });
        });

        describe('when the id has not been generated via our system', () => {
            it('should return the expected error', async () => {
                const bogusId = buildDummyUuid(8484);

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) => commandFsaFactory.build(bogusId),
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                });
            });
        });

        describe(`when the command payload type is invalid`, () => {
            Object.values(AggregateType)
                .filter((t) => t !== AggregateType.spatialFeature)
                .forEach((invalidAggregateType) => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            {
                                propertyName: 'aggregateCompositeIdentifier',
                                invalidValue: {
                                    type: invalidAggregateType,
                                    id: buildDummyUuid(15),
                                },
                            },
                            commandFsaFactory.build(buildDummyUuid(12))
                        );
                    });
                });

            generateCommandFuzzTestCases(CreatePoint).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                commandFsaFactory.build(buildDummyUuid(123))
                            );
                        });
                    });
                }
            );
        });
    });
});
