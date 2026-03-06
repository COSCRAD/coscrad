import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { getCommandFsaForTest } from '../../../../__tests__/utilities/getCommandFsaForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { CreatePoint } from './create-point.command';

const commandType = `CREATE_POINT`;

const pointName = 'Sunny Park Point';

const traditionalName = {
    text: pointName,
    languageCode: LanguageCode.Chilcotin,
};

const dummyFsa = getCommandFsaForTest<CreatePoint>(commandType, {
    aggregateCompositeIdentifier: { id: buildDummyUuid(101) },
    traditionalName,
});

const commandFsaFactory = new DummyCommandFsaFactory((id) => {
    const clone = clonePlainObjectWithOverrides(dummyFsa, {
        payload: { aggregateCompositeIdentifier: { id } },
    });

    return clone;
});

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
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
                    Promise.resolve();
                },
                buildValidCommandFSA: (id: AggregateType) => commandFsaFactory.build(id),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        //  note that we do not want to constrain only one place to have a given name as this will surely happen across different communities and families

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

        describe(`when the geometry is invalid`, () => {
            it(`should have a test`, async () => {
                const invalidLattitude = 9000;

                // note that -Infinity would be caught at the schema level- fuzz test this!
                const invalidLongitude = -300;

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    buildCommandFSA: (pointId) => ({
                        type: commandType,
                        payload: buildTestInstance(CreatePoint, {
                            aggregateCompositeIdentifier: {
                                id: pointId,
                            },
                            contemporaryName: {
                                text: 'blue rock',
                                languageCode: LanguageCode.English,
                            },
                            lattitude: invalidLattitude,
                            longitude: invalidLongitude,
                        }),
                    }),
                    checkError: (error) => {
                        const msg = error.toString();

                        expect(msg).toContain(invalidLattitude.toString());
                        expect(msg).toContain(invalidLongitude.toString());
                    },
                });
            });
        });

        describe(`when no name is provided`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    buildCommandFSA: (pointId) => ({
                        type: commandType,
                        payload: buildTestInstance(CreatePoint, {
                            aggregateCompositeIdentifier: {
                                id: pointId,
                            },
                            traditionalName: null,
                            contemporaryName: null,
                        }),
                    }),
                    checkError: (error, pointId) => {
                        const msg = error.toString();

                        expect(msg).toContain(pointId);

                        expect(msg).toContain(
                            `must have at least one of: traditional name, contemporary name`
                        );
                    },
                });
            });
        });
    });
});
