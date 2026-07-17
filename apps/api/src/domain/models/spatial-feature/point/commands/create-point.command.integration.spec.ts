import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../app/domain-modules/spatial-feature.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DynamicDataTypeFinderService } from '../../../../../validation';
import { ID_MANAGER_TOKEN } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { getCommandFsaForTest } from '../../../../__tests__/utilities/getCommandFsaForTest';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { Point } from '../entities/point.entity';
import { CreatePoint } from './create-point.command';

const commandType = `CREATE_POINT`;

const pointName = 'Sunny Park Point';

const lattitude = 40.1;

const longitude = -123.5;

const originalLanguageCode = LanguageCode.English;

const dummyFsa = getCommandFsaForTest<CreatePoint>(commandType, {
    aggregateCompositeIdentifier: { id: buildDummyUuid(55) },
    name: pointName,
    languageCodeForName: originalLanguageCode,
    lattitude,
    longitude,
});

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

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates to the database`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await Promise.resolve();
                },
                buildValidCommandFSA: (id: AggregateType) => commandFsaFactory.build(id),
                checkStateOnSuccess: async ({ aggregateCompositeIdentifier: { id } }) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(ResourceType.spatialFeature)
                        .fetchById(id);

                    expect(searchResult).not.toBe(NotFound);

                    const newSpatialFeature = searchResult as Point;

                    expect(newSpatialFeature.geometry.coordinates.toTuple()).toEqual([
                        lattitude,
                        longitude,
                    ]);

                    expect(newSpatialFeature.eventHistory).toHaveLength(1);

                    expect(newSpatialFeature.eventHistory[0].type).toBe('POINT_CREATED');

                    const nameMlTextItem = newSpatialFeature.properties.name.getOriginalTextItem();

                    expect(nameMlTextItem.text).toBe(pointName);

                    expect(nameMlTextItem.languageCode).toBe(originalLanguageCode);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        // note that 2 spatial features may have the same name

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
