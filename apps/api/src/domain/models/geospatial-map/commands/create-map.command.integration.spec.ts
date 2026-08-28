import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../app/domain-modules/geospatial-map.module';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../validation';
import { CoscradEventFactory } from '../../../common';
import { ID_MANAGER_TOKEN } from '../../../interfaces/id-manager.interface';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import UuidNotGeneratedInternallyError from '../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { GeospatialMap } from '../geospatial-map.entity';
import { CreateMap } from './create-map.command';

const commandType = 'CREATE_MAP';

const geospatialId = buildDummyUuid(3);

const invalidGeoSpatialId = buildDummyUuid(4);

const validFsa = {
    type: commandType,
    payload: buildTestInstance(CreateMap, {
        aggregateCompositeIdentifier: { id: geospatialId },
    }),
};

const invalidPayload = buildTestInstance(CreateMap, {
    aggregateCompositeIdentifier: { id: invalidGeoSpatialId },
});

const invalidFsa = {
    type: 'CREATE_MAP',
    payload: invalidPayload,
};

const seedEmptyInitialState = async () => {
    Promise.resolve();
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
        it(`should succeed with the expected updates`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await Promise.resolve();
                },
                buildValidCommandFSA: (id) =>
                    clonePlainObjectWithOverrides(validFsa, {
                        payload: { aggregateCompositeIdentifier: { id } },
                    }),

                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateMap) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.map)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(GeospatialMap);

                    const updatedGeospatialMap = searchResult as unknown as GeospatialMap;

                    expect(updatedGeospatialMap.name.getOriginalTextItem().text).toBe(
                        validFsa.payload.name
                    );

                    assertEventRecordPersisted(
                        updatedGeospatialMap,
                        'MAP_CREATED',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the ID has not been generated via our system`, () => {
            it(`should return with the expected error`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => invalidFsa,
                    seedInitialState: seedEmptyInitialState,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new UuidNotGeneratedInternallyError(invalidGeoSpatialId),
                            ])
                        );
                    },
                });
            });
        });
    });
});
